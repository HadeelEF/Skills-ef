# هيكلة كود .NET والـBackend

لتصميم ميزة جديدة أو تغيير سلوكها، اجمع هذا المرجع مع backend-design-to-code
من فهرس المهارة: حدد العقد والقواعد والضمانات أولًا، ثم خريطة الملفات.

## اختر حجم الفصل من حجم المسؤولية

| سياق المشروع | تنظيم مناسب للتقييم | الضابط |
| --- | --- | --- |
| API صغير أو وحدة محدودة | host واحد وFeatures تجمع حالات الاستخدام | endpoint واضح، صلاحيات وقواعد وبيانات قابلة للتتبع |
| منتج مؤسسي متعدد المجالات | modules، وfeatures/vertical slices داخل كل module | ملكية بيانات وعقود معلنة، لا اتصال داخلي عشوائي |
| domain معقد أو عدة adapters | فصل application/domain/infrastructure عند الحاجة | dependency inversion حقيقي وحماية invariants |

لا تختَر أحد Modular Monolith وVertical Slices وClean Architecture
وFeature-based كأنها بدائل متنافية؛ الأول حدود نشر/وحدات، والثاني حالات
استخدام، والثالث اتجاه اعتماد، والرابع تجميع الملفات. طبق الجزء الذي
يخدم المشروع، مع احترام التصميم القائم قبل تغييره.

## اكتب خريطة ملفات ذات مسؤوليات

مثال قابل للتقليص لميزة Grants؛ سمّ المسارات وفق المستودع ولا تنشئ
مجلدًا أو مشروعًا فارغًا لمجرد مطابقة المثال:

| المسار النسبي | المسؤولية |
| --- | --- |
| `src/Portal.Api/Program.cs` | composition root وتسجيل modules/middleware/endpoints |
| `src/Modules/Grants/Features/RenameGrant/Endpoint.cs` | binding وقراءة سياق الطلب وترجمة نتيجة use case إلى HTTP |
| `src/Modules/Grants/Features/RenameGrant/Handler.cs` | orchestration والصلاحية والقواعد وحد المعاملة للعملية |
| `src/Modules/Grants/Features/RenameGrant/Contracts.cs` | request/response محليان للحالة حين لا توجد عقود مشتركة حقيقية |
| `src/Modules/Grants/Features/RenameGrant/Validator.cs` | قواعد مدخلات منفصلة عندما يكون الفصل مفيدًا |
| `src/Modules/Grants/Domain/` | سياسات وinvariants/كيانات معقدة مستقلة عن HTTP |
| `src/Modules/Grants/Infrastructure/` | persistence/integration adapters وفق اتجاه الاعتماد المختار |
| `src/Modules/Grants/Contracts/` | السطح العام الذي تحتاجه وحدات أخرى بالفعل |
| `tests/Grants/` | اختبارات حالات الاستخدام والعقود/SQL والصلاحيات المتأثرة |

يمكن جمع endpoint وhandler وDTOs في ملف feature صغير إذا بقي واضحًا.
لا تفرض MediatR ولا request pipeline ولا repository لتمرير استدعاء واحد.
في slicing عملي قد يستخدم handler EF مباشرة؛ إن اخترت عزل application
عن EF فعرّف port مناسبًا، ولا تدّعِ العزل مع بقاء اعتماد EF داخلها.

## اجعل الاعتماديات قابلة للفرض

host يربط الخدمات؛ transport يعتمد على use case؛ domain/policies لا
تعتمد على ASP.NET أو infrastructure. عرّف port في الجانب المستهلك الذي
يحتاجه وتنفيذه في adapter، إذا كانت له فائدة. لا تعكس المرجع لإرضاء DI.
لا تصدّر DbContext أو entities الداخلية بين modules، ولا تستخدم Shared
أو Common مستودعًا لكل dependencies. namespace وحده ليس عزل assembly.

حدد visibility وpublic contracts وproject references؛ عالج circular
references بإصلاح المسؤولية. استخدم architecture checks للحدود التي
قد تتآكل، مع استثناءات موثقة ومحدودة. اختبر عقودًا مهمة بدل اسم مجلد بعينه.
لا تجعل كل طبقة نسخة مطابقة من النوع والخدمة نفسيهما تمرر الطلب فقط.

## نفّذ حالة استخدام مكتملة

حدد المدخل المسموح والسياق الموثوق وauthorization ومصدر البيانات
والقواعد وexpected version، ثم العملية الذرية والآثار اللاحقة والاستجابة.
أبق API adapter رفيعًا نسبيًا؛ نقل جسم controller كاملًا إلى Service
ضخم باسم آخر لا يحسن التصميم. استخدم أسماء أفعال واضحة لكل use case.

تحقق من البنية والشكل عند boundary، ومن ملكية المورد والقواعد قبل
التغيير؛ صمم ترتيبًا لا يكشف بيانات محمية. افصل policy الخالصة عندما
تستحق الاختبار، لكن طبّق ضمانات السباق والـuniqueness في DB أيضًا.
حافظ على async وCancellationToken وأعمار DI؛ لا تمرر HttpContext عميقًا
في domain. مرر سياق actor/tenant محدودًا من مصدر خادمي موثوق.

لأخطاء الأعمال استخدم النمط القائم أو result صغيرًا خاصًا بالنطاق.
اختر HTTP mapping واضحًا لـnot-found/forbidden/validation/conflict؛
لا تخترع framework أخطاء عامة لكل التطبيق لإصلاح endpoint واحد.
دع الاستثناء غير المتوقع يصل لمعالج آمن، دون catch يعيد success أو يخفي
DB failure. طبّق mapping وvalidation ضمن المسار الفعلي لا كملفات غير مسجلة.

أعد response DTO محدودًا بعد commit، مع concurrency token الجديد عند
الحاجة. استخدم projection للقراءات، وحدود query/paging واضحة، واختبر
SQL الذي يهم الصحة/الأداء. راجع outbox وcache invalidation وaudit
عند وجود آثار خارجية؛ إعادة تنظيم الكود لا يجب أن تغير ضماناتها خفية.

## انقل الهيكل دون كسر المنتج

انقل feature واحدة، وحدّث namespaces وreferences وDI واكتشاف validators
وmappers وroutes وOpenAPI. احفظ سلوك endpoint وcontract المعتمد، أو وثق
التغيير المقصود وهجرة المستهلكين. افحص generation/migrations والـassembly
scanning؛ الملف الذي نُقل صحيحًا نحويًا قد لم يعد يُسجل وقت التشغيل.

أثبت النتيجة بـbuild واختبارات الوحدة والتكامل المناسبة المتاحة. عند غياب
SDK أو DB لا تقدم فحص نصوص C# بوصفه build؛ حدد الفحص المتبقي بدقة.

## مرجع رسمي

- [.NET web architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
