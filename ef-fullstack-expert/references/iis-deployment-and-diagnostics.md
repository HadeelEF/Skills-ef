# نشر .NET وReact على Windows Server وIIS

## المحتويات
- عقد الاستضافة والنشر
- الهوية والملفات والجلسات
- نشر قابل للتراجع
- التشخيص وإثبات التشغيل

## ثبت عقد الاستضافة

اجرد OS وIIS وSDK/TFM وruntime وHosting Bundle/ANCM وRID وbitness ونمط
النشر الفعلي. دعم Windows تحدده نسخة .NET المستهدفة أيضًا، لا عمر IIS وحده.
لا تنسخ رقم إصدار من مثال. runtime مثبت لا يثبت وجود ASP.NET Core Module.
راجع إصلاح Hosting Bundle إذا سبق تثبيت IIS، وأثر أي restart على المواقع الأخرى.

| القرار | التنفيذ والتحقق |
| --- | --- |
| Framework-dependent | runtime مشترك متوافق على الخادم؛ راجع سياسة patching |
| Self-contained | runtime ضمن artifact ومسؤولية تحديثه على الفريق؛ IIS ما زال يحتاج ANCM |
| In-process | التطبيق داخل w3wp؛ افصل التطبيقات في app pools، وراجع توافق single-file |
| Out-of-process | ANCM يدير العملية ويوجه إلى Kestrel؛ افحص processPath/arguments والبدء |
| App Pool | هوية محدودة، bitness متوافق؛ No Managed Code لا يعني غياب CoreCLR |
| React SPA | assets إنتاجية وdeep-link fallback محدود؛ لا تعِد index.html لمسار /api أو ملف مفقود |
| React SSR | runtime مستقل وطريقة إدارة ونشر وproxy معلنة؛ Node للبناء وحده لا يكفي |

أنشئ publish artifact من المشروع المستهدف، لا تنسخ bin/Debug. احتفظ
بـweb.config الناتج وراجع transformations وhostingModel ومسار التجميع.
ميّز framework-dependent DLL عن executable. لا تعدل الملف لتخمين العطل.
في in-process تضبط حدود IIS/IISServerOptions؛ في out-of-process راجع
IIS ثم Kestrel أيضًا، إضافة إلى multipart وحدود التطبيق. الحد الفعال
قد يأتي من طبقة سابقة. افحص WebSockets إذا استخدم SignalR.

## اربط الهوية والتخزين والجلسات

افصل runtime identity عن deploy identity وحساب migration. امنح القراءة
لمجلد التطبيق، والكتابة لمجلدات محددة خارج release للملفات والسجلات
والـkeys؛ لا تمنح Everyone/Full Control ولا local admin لحل Access Denied.
لـUNC/SMB افحص share وNTFS وهوية الشبكة الفعلية؛ mapped drive للمطور ليس
دليل وصول app pool. صمم SQL integrated identity أو secret provider وفق البيئة.
اختبر الاتصال من سياق الخدمة دون عرض كلمات مرور أو connection strings.

حدد Data Protection key persistence والتشفير عند السكون وapplication
discriminator وصلاحيات القراءة والتدوير. عند web farm تحتاج النسخ المتعاونة
مفاتيح متوافقة؛ اعزل التطبيقات والبيئات المختلفة. افحص استمرار cookie
بعد recycle وانتقال الطلب إلى نسخة أخرى. sticky sessions ليست بديلًا
عن تصميم الحالة. لا تحفظ keys أو uploads داخل artifact يستبدل في النشر.

اضبط bindings وTLS والشهادة واسم المضيف وOIDC callback بحسب عنوان المستخدم.
ثق بالـproxies المعروفة فقط؛ عالج scheme/path base دون تعطيل state/nonce.
اختبر /api وSPA routes وstatic cache headers معًا. اجعل index قابلًا للتحديث
وassets ذات أسماء محتوى ثابتة التخزين؛ لا تطبق cache عامًا على بيانات خاصة.

## نفذ نشرًا يمكن التراجع عنه

1. جهز artifact معرفًا وتهيئة خارجية ونسخة سابقة قابلة للاستعادة؛ أثبت
   توافق قاعدة البيانات مع الإصدارين قبل وصف rollback بأنه ممكن.
2. نفذ migration بخطوة واحدة مخولة منفصلة عن runtime. استخدم expand/contract
   عند نشر نسختين؛ لا تشغل migration على كل app startup.
3. لنشر نسخة واحدة صمم نافذة توقف مناسبة؛ app_offline.htm يوقف التطبيق
   عبر ANCM لكنه لا يضمن انعدام التوقف. انتظر تحرير الملفات، ولا تحذف
   بيانات المستخدم مع تنظيف مجلد الإصدار. لا تستخدم iisreset كإجراء روتيني.
4. لمتطلب توافر أعلى جهز blue/green أو عقدًا متعددة مع drain وفحص readiness
   وتبديل حركة موثق. ملفات جديدة فوق عملية قديمة ليست نشرًا ذريًا.
5. افحص /health ثم رحلة فعلية: login، صلاحية مرفوضة، كتابة/إعادة قراءة،
   download خاص، وdeep link. نجاح HTTP 200 وحده لا يكفي.
6. راقب الأخطاء بعد التحويل؛ للتراجع أعد artifact/config المتوافقين.
   لا تعكس migration فقدت بيانات اعتمادًا على استعادة binaries فقط.

اضبط idle timeout وrecycling وpreload/AlwaysRunning عند حاجة مثبتة، بعد
فحص Application Initialization وسياسة الخادم. هذه الإعدادات لا تجعل
job داخل الموقع مضمونة الاستمرار. للعمال الدائمين قيّم Worker Service
كـWindows Service مع recovery وshutdown وstorage دائم.

## شخّص من الدليل

ابدأ بزمن المشكلة وcorrelation وIIS status/substatus وEvent Viewer وسجل
التطبيق. استخدم stdout مؤقتًا لتشخيص startup مع ACL ومدة وcleanup؛ ليس
نظام logging دائمًا. لا تفعّل Development أو تعرض stack trace للمستخدمين.

| العارض | أول مسار فحص؛ ليس حكمًا وحيدًا |
| --- | --- |
| 500.30 | startup exception وconfiguration وruntime والهوية |
| 500.31 | runtime/native dependencies المطلوبة مقابل المثبتة |
| 500.32 | bitness وRID والتبعيات الأصلية |
| 500.35 | تطبيقات in-process متعددة في العملية نفسها |
| 502.5 | بدء عملية out-of-process ومسارها واعتمادياتها |
| login loop بعد proxy | scheme/host/callback وcookies وData Protection |
| 404 عند refresh لصفحة React | قواعد SPA fallback ومسارات API والملفات |
| worker يتوقف دوريًا | pool lifecycle وهوية worker وضمان دوام المهمة |

عند تجربة artifact خارج IIS، وضح أن تشغيله بحسابك لا يثبت صلاحيات
app pool. اجمع dump/counters عند الحاجة وفق تصنيف البيانات؛ dumps قد
تحتوي أسرارًا. غيّر سببًا واحدًا ثم أعد الحالة الأصلية واختبارًا مجاورًا.
سلّم runbook فعليًا من القالب المرتبط في فهرس المهارة، مع نتائج لا افتراضات.

## مصادر الإصدار

- [IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/)
- [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)
- [Advanced IIS configuration](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/advanced)
- [Startup diagnostics](https://learn.microsoft.com/en-us/aspnet/core/test/troubleshoot-azure-iis)

راجع الصفحات الموافقة لإصدار المشروع؛ راجعت نقاط الدخول في 2026-10-05.

لتشخيص الخادم نفسه (Event IDs وPerfMon والهويات والشهادات) اقرأ
windows-server-operations، ولإدارة العطل كاملًا اقرأ production-incidents-and-capacity.
