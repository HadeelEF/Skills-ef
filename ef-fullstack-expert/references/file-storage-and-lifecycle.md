# معمارية حفظ الملفات ودورة حياتها

## افصل metadata عن bytes وحدد الملكية

صمم سجلًا يحتوي FileId وtenant/owner ونوع الارتباط وstorage key آمن
والاسم المعروض والحجم والنوع المتحقق وchecksum عند الحاجة والحالة
والنسخة ومواعيد الإنشاء والانتهاء. افصل الاسم الذي يراه المستخدم عن
المسار الفعلي، ولا تجعل URL دائمًا هو الهوية الوحيدة للملف.

| التخزين | متى يلائم | ما يجب التحقق منه |
| --- | --- | --- |
| disk محلي خاص | نسخة واحدة أو ملفات مؤقتة يمكن توليدها | persistence بعد deploy، مساحة القرص، backup، وعدم توجيه طلب لنسخة أخرى |
| shared filesystem | بيئة محلية متعددة الخوادم تحتاج مشاركة | صلاحيات حساب الخدمة، الشبكة، locking، HA والاستعادة |
| object storage | ملفات كبيرة أو توسع وlifecycle وسحب مباشر | الموقع والتصنيف، private access، URLs المؤقتة، التكلفة وSDK |
| BLOB داخل DB | أحجام/معاملات تستفيد فعلًا من ذلك | أثر حجم DB وbackup والاستعلام والنقل؛ ليس الاختيار التلقائي |

اجعل واجهة storage صغيرة حسب العمليات الفعلية: upload/read/delete/metadata؛
لا تبتكر abstraction يوحد كل قدرات المزود دون استخدام. لا تفترض Azure.

## نفّذ upload آمنًا وقابلًا للاسترداد

- عالج الملفات الخاصة خارج wwwroot؛ استخدم أسماء/keys مولدة وامنع
  traversal وabsolute paths وsymlink escape حيث ينطبق. لا تثق باسم العميل.
- ضع حدودًا متوافقة في reverse proxy وKestrel وmultipart والتطبيق، مع
  quota للمستخدم/tenant؛ stream الملفات الكبيرة، مع cancellation وتنظيف المؤقت.
- تحقق من allowlist وsignature/content والحجم؛ Content-Type والامتداد
  أدلة غير كافية. عالج archives ضد zip-slip/decompression bombs إن دُعمت.
- استخدم quarantine وحالة pending/scanning/ready/rejected عند الحاجة؛
  لا تتيح download قبل الفحص المطلوب. فشل scanner لا يعني ملفًا سليمًا.
- اجعل upload المباشر بتوقيع قصير المدة ومقيدًا بالمورد والعمل المسموح؛
  تحقق من object الفعلي عند completion ولا تثق بmetadata يرسلها المتصفح.

## عالج الفجوة بين DB وstorage

كتابة metadata وحفظ object عمليتان منفصلتان غالبًا. صمم state machine
وتعويضًا وreconciliation للـorphan/missing objects؛ لا تدّعِ معاملة موزعة
تلقائية. اختر ترتيبًا يناسب الاسترداد، مع idempotency ومدة انتهاء للمؤقت.
atomic rename يفيد داخل filesystem يدعمه؛ لا تعممه على object storage
أو نقل بين volumes. علّم الملف ready بعد اكتمال الشروط، لا قبلها.

اجعل delete قابلًا لإعادة التنفيذ: سجل طلب حذف وحالة، احذف object، ثم
حدث metadata وفق retention؛ افحص version/ownership لتجنب حذف بديل حديث.
للـexports، اربط FileId بسجل job ثابت، وحدد صلاحية الملف والـsnapshot
وسياسة إعادة التوليد، ونظف النتائج غير المرتبطة بعد crash.

## احمِ download والاسترجاع

تحقق من authorization وtenant وملكية المورد عند طلب الملف وعند إصدار
رابط مؤقت. GUID أو signed URL لا يستبدلان هذا الفحص. الرابط المؤقت يمنح
حامله وصولًا ضمن مدته؛ لا تعد بسحب فوري بعد إصدار الرابط دون آلية مزود.
استخدم مسار تنزيل عبر الخادم عندما تتطلب السياسة تحققًا عند كل قراءة.
حدد هل سحب الصلاحية يمنع بدء طلب جديد أم يتطلب إيقاف stream جارٍ؛
صمم إعادة التحقق والإلغاء حسب ذلك، ولا تعد باسترجاع bytes وصلت للعميل.

اضبط Content-Disposition وContent-Type وnosniff وcache headers؛ اعزل
عرض HTML/SVG أو محتوى نشط غير موثوق. لا تعرض filesystem paths أو tokens
في errors/logs. تحقق من Range requests إن لزم دون تجاوز الصلاحية.

حدد encryption وkey management والاحتفاظ والحذف والنسخ الاحتياطي حسب
التصنيف المعتمد. اختبر استعادة bytes مع metadata واتساقهما، وانقطاع upload
وامتلاء القرص وتزامن replace/delete ومحاولة وصول من tenant آخر.

## مرجع رسمي

- [ASP.NET Core file uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)

راجع وثائق storage الفعلي للـconditional writes وversioning وsigned URLs
وضمانات الاتساق؛ لا تنقل ضمان مزود إلى مزود آخر.
