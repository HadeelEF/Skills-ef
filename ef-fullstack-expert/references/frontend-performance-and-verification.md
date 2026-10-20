# أداء الواجهة والتحقق من الرحلة

اقرأ عند بطء الواجهة أو إضافة تفاعل مؤثر أو تسليم feature. استخدم مع
مرجع الجودة والتشغيل لربط السلوك بـ.NET والبيانات، ومرجع React المتقدم
لسباقات الطلبات والجلسات. اجعل كل فحص يعالج خطرًا ملموسًا ضمن التغيير.

## شخّص قبل التحسين

1. حدد السيناريو والجهاز وحجم البيانات ونسخة التطبيق وحالة cache؛ سجل
   baseline قابلة للتكرار. ميز تجربة التطوير وStrictMode عن production.
2. تتبع network waterfall ووقت API/DB وJavaScript وReact commits وlayout
   وpaint. لا تصف كل تأخر بأنه rerender أو تفترض أن Backend هو السبب.
3. أصلح عنق الزجاجة المدعوم بالدليل، وأعد القياس في نفس الظروف مع فحص
   صحة السلوك. اذكر measured/estimated وغير المقاس بوضوح.

## اختر العلاج المتناسب

| الدليل | اتجاه الإصلاح | ما يجب حمايته |
| --- | --- | --- |
| طلبات متسلسلة بلا تبعية | loaders/prefetch أو بدء مستقل | auth/cancellation وعدم تكرار العمل |
| API أو query بطيء | projection/index/pagination وقياس الخادم | نفس semantics، لا تحميل كل البيانات للمتصفح |
| JS أولي ضخم | تحليل bundle وroute/feature lazy loading | لا lazy عشوائيًا يخلق waterfall جديدًا |
| commits مكلفة | state ownership وcontext/selectors وحدود المكونات | memo بعد قياس، دون إخفاء stale values |
| main thread مشغول بحساب | خوارزمية أفضل أو Worker لحساب مناسب | تكلفة النقل والإلغاء ودقة النتيجة |
| جدول كبير | pagination أو virtualization مدروسة | keyboard/focus/selection وإتاحة الصفوف |
| layout shift أو صورة/خط متأخر | dimensions وloading/font strategy | المحتوى المهم وإتاحة النص وعدم الإفراط في preload |

استخدم LCP/INP/CLS عندما تلائم الصفحة مع مقاييس المنتج مثل زمن البحث
والحفظ. ميز lab عن field data؛ نتيجة جهاز واحد ليست أداء جميع المستخدمين.
تحقق من التعريفات والأهداف الحالية عند اعتماد budget؛ لا تخترع نسبة تحسن.
لا تستخدم transitions بوصفها Worker، ولا ترسل 100 ألف سجل للمتصفح ثم
تعالجها بـuseMemo باعتبار ذلك تصميمًا افتراضيًا سليمًا.

للتشخيص العملي (Profiler خطوة بخطوة، الذاكرة، تحليل الحزمة) اقرأ مرجع تشخيص أداء React،
ولتوزيع الاختبارات ومصفوفة الصلاحيات اقرأ مرجع استراتيجية اختبار الواجهة.

## اختر فحوصًا تمثل الاستخدام

- اختبر domain/pure transformations عند وجود منطق غير تافه، وcomponents
  عبر role/label/name وإدخال المستخدم. تجنب اختبارات أسماء الدوال الداخلية
  أو snapshots ضخمة لا تتحقق من سلوك. استخدم أدوات المشروع قبل إضافة أخرى.
- مع API mocks مثل MSW مثل العقود الفعلية والأخطاء والتأخير، وميّز ذلك
  عن تكامل خادم حقيقي. لا تستنتج سلامة authorization أو transaction من mock.
- اختبر للمسار المتأثر النجاح والvalidation/failure وإعادة المحاولة
  ذات المعنى. بعد فقد استجابة write قد تكون النتيجة غير معلومة؛ لا تعرض
  «فشل الحفظ» يقينًا أو تعيد POST تلقائيًا دون reconciliation/idempotency.
- غط السباق الذي يسمح به التغيير: response قديم بعد جديد، refetch أثناء
  dirty form، logout/tenant switch أثناء الطلب، conflict/rollback، أو
  العودة إلى route. لا تكتب كل هذه الحالات لإصلاح CSS محدود.
- في رحلة كاملة اختبر UI → API → persistence → reload/read-back حيث
  تسمح البيئة. افحص auth/session وstatus/content type؛ صفحة login HTML
  أو 404 من proxy ليست JSON API ناجحة لمجرد وصول استجابة.

## نفّذ فحص المتصفح بدقة

- تحقق من URL والصفحة الحقيقية والمحتوى المتوقع قبل screenshot؛ راقب
  console/network من بداية الرحلة. شغّل controls والتنقل والحفظ والتحقق،
  ولا تعتبر ظهور static mock رحلة كاملة.
- افحص المقاسات والـRTL/keyboard والحالات المؤثرة. عند SSR راقب hydration
  وإعادة التحميل المباشر والبيانات الأولية وعزل طلبين مختلفين.
- ثبّت fixtures والوقت واللغة والخطوط والحركة والبيئة عند visual tests.
  راجع الصورة/diff بنفسك؛ لا تحدث baseline تلقائيًا لإخفاء regression.
  وضّح حدود فحص Chromium إذا لم تُفحص بقية المتصفحات المستهدفة.
- استخدم انتظارًا على حالة أو نتيجة ذات معنى، لا sleep طويلًا أو
  retries تخفي race. احتفظ بأثر فشل مفيد دون tokens أو بيانات حساسة.

## سلّم بأدلة قابلة للفهم

ميّز lint وtypecheck وproduction build وunit/component وbrowser/E2E
وvisual وintegration مع .NET. Node الذي يزيل TypeScript types لا يثبت
type safety؛ build لا يثبت keyboard أو صحة البيانات. سجل الأوامر والنتائج
والقيود المؤثرة، وأصلح فشلًا مرتبطًا بالتغيير. إذا نقصت أداة، أكمل الفحص
المتاح واذكر ما لم ينفذ دون تحويل القيد إلى نجاح أو تعطيل الاختبارات.
لا توسع الاختبارات بعد حسم الخطر أو تضف أدوات مراقبة لا يحتاجها المشروع.

## المصادر

- [React Profiler](https://react.dev/reference/react/Profiler)
- [Web Vitals](https://web.dev/articles/vitals)
- [Testing Library principles](https://testing-library.com/docs/guiding-principles/)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)
