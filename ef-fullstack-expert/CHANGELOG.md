# سجل التغييرات — الترقية إلى مستوى Principal Backend

## SKILL.md
- تحديث الوصف ليشمل runtime/concurrency، المراسلة، تعدد المستأجرين، الحوادث، السعة، SLOs، المراجعة، والترحيل.
- قسم جديد «فكّر بمستوى النظام والسنوات القادمة»: ADR بالكلفة، تقدير كمي موسوم، مصفوفة فشل، اختبار 5 نسخ، شبكة غير موثوقة، إدارة الحوادث، مراجعة مرتبة بالخطورة، hot paths.
- 11 صفًا جديدًا في جدول المراجع، و4 صفوف في جدول القوالب.

## مراجع جديدة (11)
system-design-and-decisions، dotnet-runtime-and-concurrency، messaging-and-consistency،
realtime-streaming-and-grpc، production-incidents-and-capacity،
legacy-modernization-and-api-evolution، multi-tenancy-design، code-and-security-review،
slo-alerting-and-cicd، backend-testing-strategy، windows-server-operations.

## قوالب جديدة
failure-mode-matrix، capacity-estimate، postmortem.

## تقييم
assets/evals/principal-backend-scenarios.md — عشرة سيناريوهات لاختبار سلوك المهارة فعليًا.

## تعديلات على مراجع قائمة
- quality-and-operations وarchitecture-and-design: استبدال منع الأرقام بتقدير موسوم كافتراض.
- روابط متقاطعة في dotnet-engineering وdata-and-concurrency وbackground-jobs-and-scheduling وiis-deployment-and-diagnostics.
- agents/openai.yaml: تحديث الوصف المختصر والـprompt الافتراضي.

## الإصدار الثالث
- **مثال ذهبي** `assets/examples/golden-use-case`: اعتماد طلب شراء من الطرف إلى الطرف (domain،
  EF/SQL Server، تفويض بالمورد، ETag 428/412، audit+outbox ذري، dispatcher آمن لنسخ متعددة،
  inbox consumer، Program.cs بترتيب middleware، اختبارات تكامل بـTestcontainers تشمل السباق).
  مراجَع ساكنًا ولم يُبنَ في بيئة الإعداد؛ الإصدارات `{{verify}}`.
- مراجع جديدة: authorization-architecture، resilience-and-integration-recipes، cloud-and-platform-awareness.
- SKILL.md: قسم «افحص الإجابة قبل تسليمها»، وصفوف للمراجع والمثال.
- سيناريوهات التقييم أصبحت 20 مع ورقة تقييم ومعيار Elite.
- slo-alerting-and-cicd: منهج التشخيص من الـtelemetry.
- روابط متقاطعة في apis-security-integration وidentity-and-access-management.

## الإصدار الرابع — Principal Frontend / React (2026-10-05)

الدافع: تقييم صارم أعطى جانب الواجهة 6.0/10؛ الحكم الهندسي صحيح لكن التغطية والإثبات ناقصان
(لا مثال React ولا سيناريوهات تقييم للواجهة).

### مثال ذهبي للواجهة مُتحقق منه
`assets/examples/golden-react-feature` مكمل للمثال الذهبي في .NET. نجح فيه: typecheck بـTypeScript 7.0.2،
وESLint 10 typed مع react-hooks v7، وdependency-cruiser، و30 اختبارًا (Vitest 5 وTesting Library وMSW 3)،
وbuild بـVite 8 مع ميزانية JS أولي (130 KB gzip من 150). Playwright مكتوب ولم يُشغَّل.
كشف التحقق خللًا في الكود الأول (فشل refetch خلفي كان يمسح الشاشة)، وإعادة تسمية صامتة في MSW 3،
وغياب programmatic API في TypeScript 7، وعدم دعم jsx-a11y لـESLint 10؛ كلها موثقة في المراجع.

### مراجع جديدة (16)
react-server-state، react-state-and-library-decisions، react-forms-enterprise، react-routing-and-access،
react-enterprise-data-grid، react-realtime-client، frontend-security، frontend-observability-and-errors،
react-typescript-patterns، react-component-patterns، frontend-build-tooling، frontend-i18n-arabic،
react-code-review، react-legacy-migration، react-performance-diagnostics، frontend-testing-strategy.

### تقييم وقوالب
- `assets/evals/principal-frontend-scenarios.md`: 20 سيناريو بمعايير رسوب وورقة تقييم.
- `assets/templates/frontend-feature-design.md`.

### تعديلات
- SKILL.md: وصف يغطي الواجهة المؤسسية، قسم «فكّر في الواجهة بمستوى المؤسسة» بقرارات افتراضية،
  16 صفًا في جدول المراجع، 3 أصول جديدة، وبنود واجهة في فحص ما قبل التسليم.
- react-runtime-and-typescript: batching وانتشار render وContext وuseReducer وportals وError Boundaries.
- code-and-security-review: قسم الواجهة؛ technology-and-packages وfrontend-performance-and-verification
  وreact-advanced-fullstack: روابط متقاطعة.

### حدود معلنة
التقييم السلوكي بالسيناريوهات لم يُشغَّل بعد على نموذجين؛ هو شرط تأكيد مستوى Elite.
