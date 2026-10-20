# سيناريوهات تحقق قابلة لإعادة الاستخدام

## استخدم أدلة متدرجة

هذه سيناريوهات تشغيل وليست نتائج نجاح مسجلة. استخدم موارد معزولة
ومصرحًا بها. اختر الحالات المرتبطة بالتغيير؛ لا تشغّل الجميع لكل تعديل.
سجل نسخة الكود والأدوات والـprovider والأمر والنتيجة وما لم يثبت.

| المستوى | ما يثبت | ما لا يثبت |
| --- | --- | --- |
| Read/static parse | اتساق بنيوي وعقود ظاهرة | compilation أو سلوك DB |
| Build/typecheck | توافق الكود والأنواع في البيئة | صحة المعاملة أو الصلاحية |
| Unit/contract | سلوك الحدود المختبرة | ضمانات SQL Server عبر mocks |
| SQL/HTTP/browser integration | سلوك الرحلة على البيئة المحددة | capacity أو DR تلقائيًا |
| Fault/load/deployment | سيناريو فشل/حمل/نشر موثق | ضمان مطلق لكل الحالات |

## جرد .NET دون تشغيل المشروع

شغّل scripts/dotnet_inventory.py مع جذر المشروع. يقرأ csproj/props/targets
وglobal.json وpackages.lock.json فقط ولا يشغل MSBuild أو restore ولا يقرأ
appsettings أو credentials. يميز declared metadata عن locked versions.
فشل parse يعطي exit code غير صفري؛ وجود report ليس نجاح build أو حسم
conditions/imports. افحص MSBuild dependency graph بأدوات المشروع لاحقًا.

## معمل الاستضافة المرفق

assets/examples/ops-host مشروع ASP.NET Core تعليمي محدود بلا هوية أو
business endpoints أو DB أو durable jobs. لا تستخدمه كتطبيق إنتاج أو
كإثبات feature كاملة. net10.0 وLinux image اختيار هذا المثال، لا ترقية
تلقائية للمشروع. runtime image tags تحتاج تحققًا/digests عند استخدام فعلي.

انسخه إلى مجلد تجربة مستقل حتى لا تغير حزمة المهارة عند restore/build.
في المجلد المنسوخ وعند توفر SDK متوافق:

```sh
dotnet build OpsExample.csproj -c Release
dotnet run --project OpsExample.csproj -c Release --no-build --urls http://127.0.0.1:5087
```

من عميل آخر افحص / و/health/live و/health/startup و/health/ready، ثم SIGTERM. readiness
في المثال تعني بدء المضيف فقط؛ تطبيق فعلي يحتاج readiness خاصة باعتمادياته
ولا ينسخ النجاح الافتراضي على أنه دليل اتصال SQL. startup مستقلة حتى
لا تتحول إضافة DB إلى readiness لاحقًا إلى سبب restart أثناء startup.
افحص المنفذ المتاح أولًا.

عند توفر Docker daemon:

```sh
docker build -t ef-skill-ops-example:lab .
docker run --rm --name ef-skill-ops-lab --read-only --tmpfs /tmp:rw,nosuid,size=64m -p 127.0.0.1:5087:8080 ef-skill-ops-example:lab
```

الاسم والمنفذ أمثلة؛ لا تستبدل موردًا قائمًا. افحص endpoints وUID و
logs ثم shutdown. Dockerfile يحدد APP_UID للصورة المختارة؛ تحقق من
UID الفعلي إذا غيرت الصورة. خصص موارد container واختبر الحمل بحسب النطاق.

deployment.yaml.template نموذج Linux Deployment/Service فقط. استبدل
{{IMAGE_DIGEST}} بصورة فعلية، وافحص UID/requests/limits والسياسات في
namespace اختبار مخول. لا يوفر Ingress/TLS/NetworkPolicy أو تطبيقًا
متكاملًا. لا تنفذ kubectl apply ضمن مهمة فحص ملف. server dry-run يحتاج
وصولًا وعقدًا مع cluster؛ YAML parsing ليس schema/admission verification.

## حالات provider والفشل

| السيناريو | الإعداد والتجربة | معيار قبول مفيد |
| --- | --- | --- |
| EF + Dapper | كتابة EF وكتابة Dapper بنفس transaction ثم fault قبل commit | لا كتابة جزئية؛ التكرار لا يضيف أثرًا مزدوجًا |
| Constraint/scope | parent من workspace A وchild يحمل B؛ duplicate active code | رفض DB حقيقي، لا pre-check فقط |
| Concurrency | عميلان بنفس rowversion ثم no-op من النسخة القديمة | نتيجة conflict حسب العقد وعدم lost update |
| SQL tuning | بيانات skewed وحجم ممثل وquery predicates متطابقة | نفس النتائج وIO/time/plan قبل وبعد مع كلفة الكتابة |
| Hangfire/Quartz | نسختان وrestart بعد effect قبل success وmisfire | عدد الآثار صحيح والتعافي قابل للرصد |
| Files | storage ينجح وDB يفشل ثم العكس؛ scanner outage؛ revoke access | لا ready زائفة، orphan reconciliation ومنع الوصول حسب العقد |
| Audit | rollback وretry وsink down وعامل نيابة عن مستخدم | نجاح ملتزم واحد وهوية صحيحة وعدم فقد audit إلزامي |
| React/.NET | login وedit/save/reload، 403، conflict، تبديل workspace أثناء fetch | persistence صحيحة ولا stale data من نطاق آخر |
| IIS | deploy/recycle/rollback، cookie وSMB/private download | هوية الخدمة والصلاحيات والجلسات والملفات مستقرة |
| Containers/K8s | image run ثم restart/drain/scale وDB outage | probes لا تصنع restart storm؛ jobs/keys تتحمل النسخ |

fault injection داخل مشروع اختبار معزول؛ لا تقتل worker إنتاجي لاختبار
توصية. نفذ على SQL Server الفعلي لا SQLite لإثبات rowversion/locks.
إذا غاب SDK/DB/Windows/Docker، نفذ المتاح وسم البقية «لم تنفذ»، مع
خطوة تشغيل واضحة. لا تستبدل اختبار SQL بمحاكاة Python وتسمّه مكافئًا.
