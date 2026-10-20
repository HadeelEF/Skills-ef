# اختيار أنماط C# و.NET والمعمارية

## المحتويات
- عقد القرار
- أنماط GoF الثلاثة والعشرون
- أنماط التطبيق والمجال
- الأنظمة الموزعة والتحقق

## ابدأ بالمشكلة ثم النمط

لكل نمط مؤثر سجل: تغير أو خطر حقيقي، أبسط بديل، حدود الاستخدام، مالك
الحالة والمعاملة، الكلفة، ومثال من المشروع يثبت السلوك. لا تجعل عدد
الأنماط هدفًا. قد يحقق delegate أو switch صغير النتيجة دون class hierarchy.
هذا فهرس قرار، وليس ادعاء أن كل نمط مطلوب أو أن كل مكتبة تنفذه بالطريقة نفسها.

## أنماط الإنشاء

| النمط | تطبيق C# محتمل | حد الاستخدام والفحص |
| --- | --- | --- |
| Factory Method | إنشاء adapter حسب نوع مورد | تجنب factory تخفي DI كاملًا؛ اختبر unknown kind وأعمار الموارد |
| Abstract Factory | عائلة providers متوافقة للتخزين | استخدمها لعدة منتجات مترابطة فعلًا؛ لا تعمم مزودًا واحدًا |
| Builder | بناء طلب/مستند معقد متعدد الخيارات | يجب أن يمنع Build الحالة غير الصالحة؛ constructor يكفي للحالة البسيطة |
| Prototype | نسخ نموذج إعداد قابل للتعديل | حدد deep/shallow؛ record with لا ينسخ المجموعات الداخلية بعمق |
| Singleton | خدمة immutable مشتركة عبر DI | lifetime داخل العملية؛ لا يحقق singleton موزعًا؛ اختبر thread safety وscoped capture |

## الأنماط الهيكلية

| النمط | تطبيق محتمل | حد الاستخدام والفحص |
| --- | --- | --- |
| Adapter | تحويل عقد مزود خارجي إلى port | اختبر معاني الأخطاء والوحدات وtimeouts، لا أسماء الخصائص فقط |
| Bridge | فصل نوع notification عن وسيلة النقل | يلزم بُعدان مستقلان للتغيير؛ لا تضاعف abstractions لمسار واحد |
| Composite | شجرة قواعد/مكونات لها عمليات مشتركة | امنع cycles وحد عمق الشجرة؛ لا تحمل graph غير محدود من DB |
| Decorator | tracing أو سياسة حول handler | راجع ترتيب wrappers وأعمار DI؛ retry wrapper قد يكرر أثرًا جانبيًا |
| Facade | عملية مبسطة فوق عدة subsystems | لا تخفِ partial failure أو bypass للصلاحيات خلف واجهة ناجحة دائمًا |
| Flyweight | مشاركة metadata immutable كثيرة | قِس توفير الذاكرة؛ لا تشارك actor/tenant state بين الطلبات |
| Proxy | remote/lazy/protection boundary | وضح تكلفة الشبكة والفشل؛ lazy access لا ينبغي أن يخفي N+1 |

## الأنماط السلوكية

| النمط | تطبيق محتمل | حد الاستخدام والفحص |
| --- | --- | --- |
| Chain of Responsibility | سلسلة validators/handlers | حدد short-circuit وترتيبها وحالة عدم المعالجة؛ لا تنهِ authorization بنجاح افتراضي |
| Command | طلب أعمال واضح ومدخلات محدودة | command object ليس queue دائمًا؛ حدد idempotency ونتيجة إعادة التنفيذ |
| Interpreter | DSL قواعد محدود | امنع تنفيذ C#/SQL اعتباطي؛ ضع حدود تعقيد ووقت ومفردات مسموحة |
| Iterator | enumeration/async stream | اختبر الإلغاء ووقت تحرير الاتصال وعدم تعداد الاستعلام مرتين |
| Mediator | فصل orchestration عن المستهلكين | استدعاء مباشر بديل جدي؛ لا تجعل mediator يخفي tracing والمعاملة أو service locator |
| Memento | استعادة مسودة أو إعداد | احم snapshot من الأسرار وحد الحجم؛ undo أعمال ملتزمة قد يحتاج تعويضًا لا استبدال صف |
| Observer | notifications داخل العملية | lifecycle/unsubscribe والاستثناءات؛ .NET event ليس broker دائمًا |
| State | انتقالات Draft/Submitted/Approved | اجمع transition مع concurrency بالـDB؛ enum أو classes وحدها لا تمنع السباق |
| Strategy | اختلاف سياسة تسعير/تقييم | policy خالصة قابلة للاختبار؛ لا تختَر السياسة الموثوقة من body دون authorization |
| Template Method | workflow ثابت بخطوات قابلة للتخصيص | راجع inheritance coupling؛ composition أنسب عند تغير التسلسل نفسه |
| Visitor | عمليات متعددة فوق نموذج أنواع مستقر | إضافة نوع تغير الزوار؛ switch expression قد يكفي؛ راع اكتمال معالجة الحالات |

## أنماط التطبيق والمجال

| النمط | متى يخدم | الضابط |
| --- | --- | --- |
| DI/Composition Root | ربط السياسات بالتنفيذ | تسجيل مركزي وأعمار صحيحة؛ لا BuildServiceProvider داخل التسجيل |
| Options | إعدادات typed متعددة البيئات | تحقق عند startup؛ فرق singleton IOptionsMonitor عن scoped IOptionsSnapshot |
| Result/ProblemDetails | أخطاء أعمال متوقعة وعقد HTTP | لا تبتلع exceptions غير متوقعة ولا تعرض stack/SQL |
| Specification | شروط مجال/استعلام يعاد استخدامها | فرق predicate خالص عن IQueryable expression؛ اختبر ترجمة EF وtenant scope |
| Repository | تجريد له قيمة فوق persistence | لا Generic CRUD يمحو projection/transactions؛ EF وحده مناسب لكثير من الحالات |
| Unit of Work | عدة كتابات تلتزم معًا | DbContext يوفر وحدة عمل؛ لا تُنشئ معاملة وهمية تشمل files/mail |
| DDD aggregate/value object | قواعد مجال مترابطة | aggregate يحمي invariants؛ لا aggregate لكل جدول أو كائن لكل scalar |
| Domain event | إعلان حقيقة مجال | حدد قبل/بعد commit؛ integration event عقد مستقل ذو version وتسليم |
| CQRS | اختلاف احتياجات القراءة والكتابة | ابدأ داخل التطبيق وقاعدة واحدة؛ event sourcing ليس شرطًا |
| Event Sourcing | حاجة صريحة لسجل أحداث كمصدر الحقيقة | version/upcasting/replay/projections والخصوصية؛ audit table ليس event store |

### مثال قرار مترابط

في مسار اعتماد طلب، ابدأ بـApprove use case + resource authorization +
conditional state/version update ومعاملة audit. أضف Strategy فقط إذا
اختلفت قواعد الاعتماد فعليًا بين أنواع الطلب. Adapter للتكامل الخارجي
يعزل عقد المزود؛ Outbox يربط نية الإرسال بالـcommit عند وجوب التسليم.
Decorator للمراقبة يجب أن يحافظ على cancellation ولا يكرر الاعتماد.
حدد لكل جزء ملفه وعقده واختباره؛ لا تُدخل mediator لمجرد تطبيق CQRS.

## أنماط الأنظمة الموزعة

| الحاجة | النمط المرشح | حالة فشل يجب تصميمها |
| --- | --- | --- |
| كتابة وإرسال موثوق | Outbox + Inbox/idempotent consumer | crash بعد الإرسال وقبل تعليم النجاح؛ dedup داخل معاملة الأثر |
| عملية عبر عدة ملاك بيانات | Saga/Compensation | التعويض قد يفشل أو يحتاج تدخلًا؛ ليس rollback لزمن العالم الخارجي |
| حمل يفوق قدرة التنفيذ | Queue load leveling/Competing Consumers | backlog وpoison messages وترتيب داخل key وbackpressure |
| مزود متذبذب | Retry/Timeout/Circuit Breaker/Bulkhead | ميزانية كلية وترتيب policies وتجنب retry storm |
| قراءة مكلفة | Cache-aside/Materialized View | stale data وعزل tenant وإبطال متعدد النسخ وإعادة البناء |
| payload كبير | Claim Check | صلاحية الملف وعمره واتساق metadata وتسليم المرجع |
| تطبيق قائم يحتاج انتقالًا | Strangler/Anti-Corruption Layer | ملكية الكتابة ومصالحة البيانات والرجوع؛ لا dual-write غير محمي |
| عميل مختلف أو حماية tokens | BFF/Gateway | لا يُسقط تفويض المورد؛ راع failure fan-out والـCSRF |

للـlease/leader election صمم انتهاء المدة ومالكًا متأخرًا وfencing أو
conditional write؛ distributed lock وحده ليس دليل exactly-once. ميز
orchestration عن choreography من حيث رؤية العملية وملكيتها والتعافي.

## نفذ واختبر النمط المطلوب

قدم مثالًا صغيرًا من domain الفعلي، ثم اربطه بالـcomposition root
والـendpoint/storage. اختبر تغيير policy دون تعديل transport، واختبر
DI scope وdecorator order وسلوك transition متزامن. للـoutbox اختبر
crash/retry ونسختين، لا mock publisher ناجحًا فقط.

اربط Architecture Decision Record بالمتطلب والبديل والاختبار. لا تخلط
pattern للكود مع deployment architecture. لا تجعل استخدام CQRS أو
DDD أو microservices شرطًا لتوصيف التطبيق بأنه مؤسسي.

## مصادر
- [.NET DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)
- [DDD/CQRS](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)
- [Distributed patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/)

أمثلة Azure في المرجع لا تفرض Azure على المشروع؛ استخدم الأنماط مع البنية المعتمدة.
