# وصفات الخدمات الخلفية والملفات والتدقيق

## Worker أصلي

سجل AddHostedService لعامل singleton يحقن IServiceScopeFactory، ثم أنشئ
CreateAsyncScope لكل iteration واستخرج processor scoped. استخدم
PeriodicTimer وawait للتسلسل؛ لا timer callback async void. احترم
stoppingToken وافصل الإلغاء المتوقع عن exception تتطلب fail/retry.
الـtimer لا يحفظ المهمة؛ اجعل المصدر جدولًا/queue دائمًا إذا كان الفقد ممنوعًا.

اختبر processor من scope جديد وبسياق خادمي محدود؛ لا تحتفظ بـHttpContext
أو DbContext في singleton. حدد سياسة crash وcheckpoint وpoison item؛
catch/log/continue مع loop ساخن قد يحجب عطلًا دائمًا. تحقق من سلوك
BackgroundService في إصدار runtime، ومن فصل العامل عن IIS عند الحاجة.

## Hangfire مع SQL Server

اربط Hangfire.AspNetCore وHangfire.SqlServer بإصدارات متوافقة. اقرأ
compatibility/serializer settings للنسخة القائمة قبل تغييرها؛ مثال
new installation لا يجيز ترقية مخطط قائم تلقائيًا. سجل AddHangfire مع
UseSqlServerStorage ثم AddHangfireServer في process الذي سيستهلك jobs.
موقع enqueue فقط لا يحتاج server إذا كان worker آخر يستهلك التخزين نفسه.

حدد schema وconnection identity ووقت ترحيل schema مسبقًا. يمكن تعطيل
schema preparation وفق خيارات الإصدار بعد تجهيزها؛ runtime محدود لا
يحتاج DDL دائمًا. خصص queues وWorkerCount وtimeouts بحسب قدرة SQL
والمزودات؛ لا تختَر القيمة الافتراضية دليل sizing.

استخدم job arguments صغيرة ثابتة النسخة: OperationId/ResourceId بدل
entities أو streams أو tokens. لا تفترض أن AddOrUpdate تعني upsert
لنتيجة العمل؛ استخدم recurring IDs ثابتة وtimezone معلنة. افحص dashboard
authorization filters مع endpoint policy: default local-only قد يبقى
فعالًا حتى مع RequireAuthorization، ولا تحذفه لتفتح اللوحة للعامة.
افصل صلاحية العرض عن replay/delete، ودقق تشغيل jobs نيابة عن مستخدم.

لا تفترض transaction مشتركة بين DB الأعمال وHangfire storage. عند
وجوب التسليم سجل outbox intent مع التغيير ثم dispatcher؛ امنع تكرار
الأثر بمفتاح أعمال دائم. DisableConcurrentExecution أو lock ليس ضمانًا
كافيًا لعدم تكرار side effect بعد crash أو فقد اتصال التخزين.

## Quartz.NET

ثبت major version قبل نسخ APIs؛ وثائق 3.x لا تثبت توقيع API في 4.x.
سجل scheduler وخدمات DI والـhost integration وفق النسخة؛ عرّف JobKey
وTriggerKey ثابتين وjob data بسيطة قابلة للتسلسل. cancellation من
context يُمرر للـI/O؛ لا تجعل WaitForJobsToComplete يتجاوز مهلة المضيف.

للدوام اختر AdoJobStore مع serializer ومخطط موافقين للإصدار، وافصل DDL
عن تشغيل الخدمة. في cluster استخدم scheduler name/config متسقين
وinstance IDs مختلفة وتوقيتًا صحيحًا؛ لا تشارك الجداول مع instances
غير clustered. DisallowConcurrentExecution يخص JobKey نفسه.

صمم cron/timezone/misfire من معنى العمل: تعويض كل فترة، أو مرة واحدة،
أو تخطي الفائت. اختبر DST وrestart بعد فترة انقطاع. Quartz scheduling
لا يضمن سياسة retries للأعمال مماثلة لـHangfire؛ عرفها صراحةً وتجنب
refireImmediately loop غير محدود. recovery ليس exactly-once.

## مثال تصميم Export مترابط

1. API تتحقق من actor/resource scope وتكتب ExportOperation + intent
   ضمن معاملة، وتعيد 202 مع status URL مخول، لا نجاح تنزيل وهمي.
2. worker يقرأ intent، يتحقق من سياسة الصلاحية والـsnapshot المطلوبة،
   ويولد ملفًا محدود الموارد إلى storage key مخصص للمحاولة/النسخة.
3. يسجل metadata وحالة Pending/Scanning/Ready بحسب الفحص؛ ready فقط
   بعد استيفاء الشروط. crash يترك reconciliation ينظف orphan أو يستأنف.
4. بعد commit يربط النتيجة بـOperationId ثابت. dedup يمنع نشر نتيجتين
   فعالتين؛ lease منتهي يحتاج fencing/conditional update لمنع عامل قديم.
5. download يفحص الوصول الحالي والجاهزية والانتهاء. notification
   لا يحمل رابطًا عامًا دائمًا؛ signed URL له مدة ومخاطر معلنة.
6. audit يميز initiatedBy وexecutedBy والمحاولة والنجاح والرفض؛ duplicate
   retry لا يكرر نجاح العملية. تنظيف الملف job idempotent يحترم retention.

## اختبار القبول

شغّل نسختين، اقتل العامل بعد كتابة الملف وقبل commit، وبعد commit قبل
تأكيد job، ثم أعد المحاولة. تحقق من عدد الآثار النهائية وصحة audit
وتنظيف orphan. جرّب sink/scanner/storage outage وسحب صلاحية المستخدم
ومدخلًا كبيرًا. افصل evidence تصميم عن تنفيذ وتشغيل فعليين.

## مصادر
- [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Hangfire ASP.NET Core](https://docs.hangfire.io/en/latest/getting-started/aspnet-core-applications.html)
- [Hangfire best practices](https://docs.hangfire.io/en/latest/best-practices.html)
- [Quartz documentation](https://www.quartz-scheduler.net/documentation/)

استخدم روابط إصدار المشروع ولا تفترض أحدث major من أمثلة الوثائق وحدها.
