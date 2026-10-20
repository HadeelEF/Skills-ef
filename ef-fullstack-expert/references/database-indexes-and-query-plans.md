# تصميم الفهارس وتحليل الاستعلامات

## المحتويات

- [عبء العمل](#ابدأ-بالاستعلام-والبيانات)
- [اختيار الفهرس](#صمم-الفهرس-من-شكل-الوصول)
- [قراءة الخطة](#اقرأ-الخطة-مع-القياس)
- [التنافس والحجم](#افصل-بطء-الاستعلام-عن-التنافس)
- [دليل التحسين](#أثبت-التحسين-وسلامة-التغيير)

اقرأ عند اختيار indexes أو تحسين SQL/EF queries أو تصميم قاعدة تتطلب
أداءً محددًا. استخدم وثائق المحرك والإصدار الفعليين؛ لا تتعامل مع EF
بوصفه محرك البيانات ولا تعتبر وجود index برهانًا على سرعة الاستعلام.

## ابدأ بالاستعلام والبيانات

اجمع أهم query shapes مع WHERE/JOIN/ORDER BY/projection/pagination،
وتكرارها وحجم نتائجها وتوزيع القيم ونسبة الكتابة. افحص SQL الفعلي الصادر
من EF/driver وأنواع parameters، لا LINQ أو SQL يدويًا بمدخلات مختلفة فقط.
احم البيانات الحساسة عند جمع خطط أو traces؛ لا تسجل secrets أو payloads كاملة.

حدد baseline بأحجام وparameters ممثلة، تشمل tenant كبيرًا وآخر صغيرًا
وقيمًا شائعة ونادرة. افصل DB duration وCPU/reads/locks عن network وحجم
serialization وrender في React. اربط هدف التحسين بمقياس منتج معلن،
ولا تخترع SLO أو نسبة تحسن من عدد الفهارس أو شكل الخطة.

## صمم الفهرس من شكل الوصول

- رتب keys وفق predicates والـjoins والفرز والنطاقات وتوزيع البيانات.
  لا تطبق «الأكثر تميزًا أولًا» أو «كل equality قبل range» كقانون مطلق؛
  اختبر الاستخدامات الفعلية وترتيب الفرز وكلفة الخطة.
- في استعلام ثابت النطاق والحالة يرتب CreatedAt ثم Id، قد يكون
  (TenantId, Status, CreatedAt, Id) مرشحًا؛ حذف فلتر Status قد يغير
  ملاءمته للفرز. قِس shapes الفعلية قبل اعتماد فهرس لكل توليفة فلاتر.
- فرق key columns التي تخدم الوصول والترتيب عن INCLUDE لتغطية قراءات
  مختارة عند دعم المحرك. راجع الفهارس الموجودة والمكررة، وحجم المفتاح
  والصف وكلفة INSERT/UPDATE/DELETE والذاكرة والتخزين؛ لا تغط كل DTO تلقائيًا.
- استخدم filtered/partial indexes لمجموعة ذات معنى عندما يدعمها المحرك؛
  تحقق من predicate المدعوم ومن قابلية optimizer لإثباته مع parameters
  التي يرسلها التطبيق فعلًا، ومن أثرها على uniqueness وعمليات الحذف.
- لا تفترض إنشاء فهرس لكل FK على مستوى المحرك؛ افحص schema الفعلية
  وما أنشأه EF، وحدد الحاجة من joins والحذف والقفل. لا تحذف index قليل
  الاستخدام دون فحص دوره في قيود أو حمل موسمي أو فترة القياس.
- حافظ على predicates قابلة للاستفادة من الفهرس: راجع الدوال على العمود
  وimplicit conversions وتوافق types/collation. مثلًا نطاق تاريخ نصف
  مفتوح قد يخدم الفهرس أفضل من تحويل العمود إلى date لكل صف؛ احفظ semantics.
- بحث substring بـ%term% ليس lookup عاديًا بفهرس B-tree. قيّم آلية بحث
  مناسبة عند الحاجة، مع semantics العربية والـprefix/tokenization، ولا
  تستبدل بحثًا جزئيًا بـfull-text وتدّعي أنه يعطي النتائج نفسها.
- للـpagination حافظ على ترتيب حتمي، ومفتاح كاسر للتعادل، وعقد cursor
  يطابق أنواع وترتيب الحقول والنطاق. ترتيب ثابت لا يضمن snapshot عبر
  طلبات متعددة؛ حدد سلوك قائمة حية مقابل export ثابت دون معاملة مفتوحة
  طوال تصفح المستخدم. راجع offset/keyset بحسب نمط التنقل الفعلي.
  احفظ دقة حقول cursor الأصلية؛ لا تختزل كسور timestamp أو bigint عند
  تحويلها في JavaScript. قيّم cursor معتمًا يولده الخادم ويعيد التحقق من نطاقه.

## اقرأ الخطة مع القياس

| الدليل | ما يوضحه | الحد الذي يجب احترامه |
| --- | --- | --- |
| Estimated plan | توقع optimizer للعمليات والصفوف والكلفة | لا يثبت زمن تشغيل أو actual rows |
| Actual plan مع IO/time | الصفوف والموارد وتحذيرات التشغيل ضمن تجربة فعلية | تشغيل query قد ينفذ write أو عملًا مكلفًا |
| Query Store/monitoring قائم | تغير الخطط والأداء عبر فترات وparameters | تحقق من التفعيل والاحتفاظ والدعم والصلاحيات |
| PostgreSQL EXPLAIN ANALYZE | قياس execution مع تفاصيل الخطة | ينفذ الاستعلام؛ ليس تحليلًا ساكنًا |

استخدم بيئة اختبار معزولة مناسبة للكتابات والقياس؛ rollback ليس حماية
شاملة من كل أثر جانبي. لا تشغّل تحليل write أو حمل إنتاجي خارج التفويض.
راجع actual مقابل estimated rows، ونوع access وjoin، وlookups والـsorts
وspills وmemory grants والإحصاءات وتوزيع parameters. scan قد يكون مناسبًا،
وseek متكرر مع آلاف lookups قد يكون مكلفًا؛ نسب كلفة الخطة ليست أزمنة فعلية.

افحص stale statistics وskew وحساسية الخطة للـparameters عند وجود دليل.
تحقق من أدوات المعالجة في الإصدار قبل plan forcing أو hints أو recompile؛
لا تجعلها إصلاحًا عامًا لكل query. لا تفرغ caches أو تعيد بناء كل indexes
في الإنتاج لتصنيع baseline؛ وثق ظروف cache وتأثير القياس نفسه.

## افصل بطء الاستعلام عن التنافس

ميز blocking العادي عن deadlock وعن CPU/I/O pressure. تتبع المعاملات
المتداخلة وترتيب الوصول والـlock footprint؛ استخدم deadlock graph عند
توفره. قلل مدة المعاملة وراجع الفهارس وترتيب الكتابة قبل توسيع timeouts.
إعادة محاولة deadlock يجب أن تحترم idempotency وحدود المعاملة والآثار
الخارجية؛ لا تكرر خطوة فقط من عملية تحتاج إعادة تقييم كاملة.

لا تستخدم NOLOCK لإصلاح سلامة أو أداء مسار يحتاج بيانات موثوقة. قيّم
isolation/snapshot وفق guarantees المطلوبة وكلفة تخزين النسخ ودعم المحرك،
واقرأ مرجع البيانات والتزامن للـinvariants التي تمتد عبر الصفوف.

اختر partitioning أو compression أو columnstore عند خدمة workload أو
retention/maintenance محددة وبإثبات مناسب؛ ليست ترقيات افتراضية لجدول كبير.
تحقق من edition/version وقيود المفاتيح والفهارس وسلوك partition pruning.
خطط للأرشفة والحذف على دفعات والسجلات ومساحة النمو وفق بيئة المشروع.

## أثبت التحسين وسلامة التغيير

قدم query shape، وفرضية التحسين، وDDL/index diff صغيرًا، وقياس قبل/بعد
بنفس البيانات والـparameters وظروف التشغيل مع كلفة الكتابة المتأثرة.
تحقق من بقاء النتائج والترتيب والصلاحيات والعقود؛ query أسرع بمعنى مختلف
ليست إصلاحًا ناجحًا. لا تكتف ببيانات قليلة موزعة بالتساوي لإثبات حمل مؤسسي.

لـindex أو schema change على بيانات قائمة راجع مدة القفل والمساحة والـlog
وتوافق التطبيق وخطة العودة أو forward fix. تحقق من دعم ONLINE/resumable
إن أردتهما؛ لا تعد بأن التغيير لا يقفل شيئًا لمجرد استخدام خيار ONLINE.
راجع migration SQL الناتج بدل الاستدلال من EF model وحده.

إذا لم تتوفر قاعدة أو خطة أو قياس، قدم فهرسًا مرشحًا وخطوات تحقق محددة
وسم النتيجة «غير مقاسة». لا تنقل timings من benchmark عام أو SQLite إلى
SQL Server/PostgreSQL، ولا تعد سرعة متحققة من مراجعة نص الاستعلام فقط.

## المصادر

- [SQL Server index design](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide)
- [Actual execution plans](https://learn.microsoft.com/en-us/sql/relational-databases/performance/display-an-actual-execution-plan)
- [Query Store](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store)
- [EF efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying)
- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [SQL Server deadlocks](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide)
