# الخدمات الخلفية والمهام والجدولة

## اختر آلية التنفيذ من ضمانات المهمة

| الخيار | الاستخدام المناسب | ما يجب تصميمه صراحة |
| --- | --- | --- |
| IHostedService / BackgroundService | worker أو poller أو queue consumer وتحكم مباشر بالدورة | الاستمرارية والـcheckpoint والتكرار والتنسيق بين النسخ ليست تلقائية |
| Channel داخل العملية | buffering محدود وأعمال يمكن فقدها أو استعادتها من مصدر دائم | capacity وbackpressure؛ الذاكرة ليست طابورًا دائمًا |
| Hangfire | مهام تطبيق مخزنة، مؤجلة أو متكررة، retries ومتابعة تشغيل | storage متوافق، idempotency، حماية dashboard، وحدود workers |
| Quartz.NET | schedules وcalendars وtriggers وmisfires دقيقة | job store دائم عند الحاجة، clustering وسياسات كل trigger |
| broker + consumer | تكامل ورسائل مستقلة وإدارة ضغط بين خدمات | ack وإعادة التسليم والعقد وdead-letter والترتيب عند الحاجة |

لا تجمع Hangfire وQuartz لمجرد توفرهما. اسم المكتبة لا يضمن exactly-once.
حدد هل المطلوب تكرار زمني، أو تنفيذ بعد حدث، أو استمرار عملية طويلة.
تحقق من الإصدار والتخزين المدعوم والترخيص لكل حزمة أو إضافة مختارة.

## نفّذ دورة حياة سليمة

- أنشئ scope مستقلًا لكل job/iteration يحتاج خدمات scoped أو DbContext؛
  لا تحتفظ بخدمات الطلب أو HttpContext أو stream داخل مهمة مؤجلة.
- مرر cancellation، وانتظر العمل الفعلي، وتعامل مع shutdown وtimeout
  وفشل بدء التشغيل. لا تعتمد على StopAsync لتنفيذ حفظ حاسم عند crash.
- افحص سلوك BackgroundService في إصدار .NET المستهدف، ولا تعمم سلوك
  الجزء المتزامن من ExecuteAsync بين الإصدارات. اجعل البدء محدودًا.
- امنع overlap غير المقصود؛ timer لا يعني انتهاء التنفيذ السابق.
  حدد concurrency وpool والحدود لكل مزود خارجي، دون موازاة DbContext واحد.
- افصل worker عن web process عندما يحتاج العمل استمرارية أو توسعًا مستقلًا.
  راجع IIS idle/recycle أو container termination؛ مجرد hosted service داخل
  موقع لا يجعل الموقع daemon دائمًا. اضبط Windows Service/systemd حسب البيئة.

## صمم التسليم وإعادة المحاولة

حدد سجل العملية: معرف ثابت، tenant، نوع/نسخة الحمولة، initiatedBy، الحالة،
عدد المحاولات، lastError الآمن، ومواعيد الإنشاء والإنجاز. مرر معرفات صغيرة؛
اقرأ الحالة الدائمة عند التنفيذ، وحدد هل المقصود snapshot أم أحدث بيانات.

- اكتب تغيير الأعمال وoutbox/job-intent في معاملة واحدة عندما يلزم عدم
  فقد المهمة. dispatcher يعيد التسليم مع dedup؛ enqueue بعد commit وحده
  يترك نافذة فقد. لا تفترض أن transaction قاعدة التطبيق تشمل job store.
- اجعل الأثر idempotent بمفتاح عمل وقيود/انتقال حالة ذري. crash بعد الأثر
  وقبل تسجيل النجاح قد يعيد المهمة؛ قفل scheduler لا يحل هذا وحده.
- استخدم retries محدودة مع backoff/jitter للأخطاء العابرة. لا تعِد محاولة
  أخطاء الصلاحية أو المدخلات بشكل أعمى. وفر failed state وإعادة تشغيل مدققة.
- عند side effect خارجي، استخدم idempotency يدعمه المزود أو سجل reconciliation؛
  لا تعد بضمان منع التكرار إذا كان المزود لا يقدم آلية قابلة للتحقق.
- أعد فحص scope وسياسة الصلاحية عند التنفيذ والتنزيل للأعمال الحساسة؛
  فرق بين الخدمة المنفذة والمستخدم المبادر، دون حفظ access token في الحمولة.

## اضبط الجدولة والتشغيل

حدد timezone وDST ووقت العمل المطلوب؛ فرّق cron عن fixed interval وعن
«بعد انتهاء المهمة السابقة». عرّف misfire: تجاهل أم تنفيذ مرة أم تعويض محدد.
استخدم IDs ثابتة للجدول وتحديثًا idempotent كي لا تتكرر الوظائف بعد deploy.

في Quartz تحقق من RAMJobStore مقابل AdoJobStore، وإعدادات cluster المتسقة
وهوية كل instance وساعة النظام. لا تشغّل نسخًا غير clustered على الجداول
نفسها. افهم أن DisallowConcurrentExecution يرتبط بهوية JobDetail/JobKey؛
ليس قفلًا عامًا لكل عمليات الأعمال أو ضمان exactly-once.

في Hangfire راجع queues وأولوياتها وworkers والتخزين وسياسة retries
والاحتفاظ بالوظائف. امنع الوصول غير المصرح للـdashboard وعمليات replay؛
لا تفترض أن حماية واجهة التطبيق تحميه تلقائيًا.

تحقق من restart وسط العمل، duplicate delivery، توقف التخزين، تشغيل نسختين،
جدول فائت، تغير الحمولة بين إصدارات النشر، وسحب صلاحية المنشئ.
راقب queue age وlag والفشل والمدة وstuck jobs، مع trace مرتبط بالطلب.

## مراجع رسمية

- [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Hangfire best practices](https://docs.hangfire.io/en/latest/best-practices.html)
- [Quartz documentation — اختر إصدار المشروع](https://www.quartz-scheduler.net/documentation/)
- [Quartz job stores](https://www.quartz-scheduler.net/documentation/quartz-3.x/tutorial/job-stores.html)
- [Quartz configuration](https://www.quartz-scheduler.net/documentation/quartz-3.x/configuration/reference.html)

هذه نقاط دخول؛ اختر وثائق إصدار المشروع، ولا تعتبر رابط إصدار بعينه توصية دائمة.

عند تشغيل worker كـWindows Service اقرأ windows-server-operations، وعند
استهلاك broker اقرأ messaging-and-consistency من فهرس المهارة.
