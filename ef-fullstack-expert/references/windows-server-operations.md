# تشغيل Windows Server للتطبيقات وخدمات .NET

اقرأ مع مرجع IIS عند تشغيل Worker Services أو تشخيص خادم Windows أو تجهيز
بيئة استضافة. تحقق من صلاحيات التنفيذ قبل أي تغيير على خادم إنتاجي.

## الهويات والصلاحيات

- App Pool Identity (`IIS AppPool\<name>`) للتطبيقات المحلية؛ gMSA عند الحاجة
  لوصول شبكي (SQL Integrated، مشاركات SMB) دون كلمة مرور يديرها البشر.
- Windows Service بحساب مخصص بأقل صلاحية، لا LocalSystem ولا حساب مستخدم شخصي.
- NTFS: قراءة لمجلد الإصدار، وكتابة لمجلدات محددة (logs، temp، keys) خارجه.
  المفتاح الخاص لشهادة في مخزن الجهاز يحتاج صلاحية قراءة صريحة للهوية.

## Worker Service كـWindows Service

- `UseWindowsService()` في الـhost، وتثبيت بـ`sc.exe create` أو أداة النشر، مع
  `start= delayed-auto` عند اعتماده على خدمات أخرى.
- Recovery: `sc.exe failure <name> reset= 86400 actions= restart/60000/restart/60000//`
  أو ما يعادله، مع إنذار عند تكرار الإقلاع؛ إعادة التشغيل لا تخفي سبب الانهيار.
- Graceful shutdown: `HostOptions.ShutdownTimeout` يتوافق مع أطول وحدة عمل
  قابلة للتوقف، والعمل غير المكتمل يُستأنف من حالة دائمة.
- Event Log: سجل مصدرًا خاصًا أو اكتب إلى سجل التطبيق المنظم؛ تأكد من صلاحية إنشاء المصدر.

## أين تبحث

| المصدر | ما يكشفه |
| --- | --- |
| System log، مصدر WAS | 5002 تعطيل App Pool بسبب Rapid-Fail، 5009/5011 انتهاء أو فشل عملية العامل، 5013 تجاوز مهلة الإيقاف |
| Application log | `.NET Runtime` 1026 استثناء غير معالج، `Application Error` 1000 تعطل العملية، رسائل ANCM |
| Service Control Manager | توقف خدمة غير متوقع وإجراءات الاسترداد |
| HTTPERR وسجلات IIS | رفض قبل الوصول للتطبيق، status/substatus وtime-taken |
| PerfMon | Processor، Memory\Available MBytes، PhysicalDisk queue/latency، Network، `W3SVC_W3WP` وASP.NET Core counters وطوابير الطلبات |

اجمع counters بـData Collector Set مجدول خلال فترة المشكلة، لا لقطة واحدة.

## الشبكة والشهادات

- افتح المنافذ المطلوبة فقط في Windows Firewall وبنطاق مصدر محدد.
- راقب انتهاء الشهادات وأنذر قبل 30 يومًا على الأقل؛ وثّق مالك التجديد وخطوات
  الربط في IIS. عطّل بروتوكولات TLS والـciphers الضعيفة وفق سياسة المؤسسة.

## التهيئة والمهام المجدولة

- متغيرات البيئة على مستوى App Pool أو الخدمة (`ASPNETCORE_ENVIRONMENT` وغيرها)
  لا على مستوى الجهاز لكل التطبيقات. الأسرار في مخزن أسرار أو ملف محمي بـACL.
- Task Scheduler مقبول لمهمة بسيطة؛ حدد الحساب، و«لا تشغل نسخة جديدة إن كانت
  السابقة تعمل»، وسجل نتيجة كل تشغيل وأنذر على الفشل.

## التحديثات والصيانة

نسق Windows Update وإعادة التشغيل مع نوافذ الصيانة وتوزيع الخوادم خلف LB؛ تحقق
من توافق Hosting Bundle بعد ترقية .NET، واختبر بعد إعادة التشغيل أن الخدمات
والـApp Pools تبدأ وأن الرحلات الأساسية تعمل.
