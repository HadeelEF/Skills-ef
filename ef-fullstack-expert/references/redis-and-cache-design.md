# Redis وإدارة التخزين المؤقت

## ابدأ بعقد cache واضح

حدد المصدر الموثوق، والبيانات المخزنة، والمالك، والـTTL، وأقصى stale مقبول،
وحجم العناصر وعددها، وآلية الإبطال، وسلوك الانقطاع. قِس latency وhit rate
وحمل المصدر؛ لا تضف Redis باعتباره شرطًا لمعمارية احترافية.

| التقنية | الاختيار المناسب | القيد المؤثر |
| --- | --- | --- |
| IMemoryCache | بيانات محلية صغيرة، أو نسخة واحدة، أو stale مقبول | لكل process؛ يلزم حد للذاكرة، ولا تتشارك النسخ الإبطال |
| IDistributedCache + Redis | cache مشترك متعدد النسخ | serialization وشبكة وعمليات واجهة محدودة؛ لا يضمن atomic workflow كاملًا |
| HybridCache | L1 محلي وL2 اختياري وتوحيد تحميل البيانات | تحقق من توافق الحزمة؛ حدود الإبطال وstampede بين النسخ |
| StackExchange.Redis | primitives أو عمليات Redis متخصصة تحتاجها فعلًا | عمر الاتصال وatomicity وcluster/slot semantics مسؤولية التصميم |

## صمم المفاتيح والبيانات

- استخدم namespace يشمل البيئة والتطبيق ونسخة schema والـtenant ومعرف
  المورد، وأبعاد query/locale/permission عندما تغير النتيجة. مثال منطقي:
  `app:env:v2:tenant:{id}:report:{id}:view:{scope}`، دون PII خام أو tokens.
- اشتق tenant والصلاحية من سياق موثوق، لا من query أو header غير متحقق.
  لا تستخدم response cache عامًّا لردود شخصية؛ راجع HTTP cache headers أيضًا.
- خزّن DTO محدودًا، لا tracked entity أو DbContext أو كائنًا mutable مشتركًا.
  حدد serializer وتوافق النسخ وحجم payload وسلوك corrupt value وnegative cache.
- ضع TTL محدودًا وjitter مناسبًا، وميز absolute عن sliding؛ تجنب مفاتيح
  cardinality غير محدودة من input المستخدم أو caching لصفحات بحث عشوائية بلا حد.

## عالج الإبطال والسباقات

ابدأ بـcache-aside عند ملاءمته: read cache، ثم المصدر، ثم fill بمدة صلاحية.
أبطل بعد نجاح commit؛ عند أهمية عدم فقد الإبطال استخدم رسالة دائمة/outbox.
ناقش سباق قارئ قديم يملأ cache بعد invalidate: versioned keys أو تحقق
نسخة أو تصميم read model/اتساق مناسب، وليس مجرد حذف المفتاح حلًا عامًا.

HybridCache ينسق factory لنفس المفتاح داخل instance؛ لا تفترض distributed
single-flight. الإبطال لا يمس تلقائيًا L1 لكل الخوادم الأخرى. حدد TTL محليًا
يتوافق مع stale المقبول، أو آلية تنسيق مناسبة، أو تجنب L1 لهذا النوع.
تحقق من هذه الضمانات من وثائق الإصدار المستخدم.

لا تعتمد على cache قديم لإثبات صلاحية حساسة أو رصيد أو شرط فريد. إذا
طلب المنتج إبطال وصول فوريًا، صمم تحققًا موثوقًا يناسب هذا الضمان.
Pub/Sub وحده ليس سجل تسليم دائمًا بعد الانقطاع.

## خطط لفشل Redis وتشغيله

- أعد استخدام ConnectionMultiplexer طويل العمر عبر DI؛ لا تنشئ اتصالًا
  لكل request. اضبط timeouts وreconnect وفق الحمل، دون retries متضاعفة.
- cache قراءات اختياري يمكن تجاوزه مع حد لحمل DB وstampede protection؛
  لا تحوّل فشل sessions أو locks أو rate-limit أمني إلى سماح تلقائي.
- ميز eviction cache عن التخزين الدائم للوظائف والجلسات وData Protection
  keys؛ عزل أسماء المفاتيح أو Redis logical databases لا يعزل الذاكرة
  والسياسة والفشل. اختر instances وسياسات durability مناسبة عند الحاجة.
- راقب memory/eviction/latency/connections/hit-miss وpayload size؛ حدد
  maxmemory والسياسة وخطة capacity وTLS/ACL ومنع exposure خارجي.
- لا تستخدم KEYS واسعة أو FLUSHALL/FLUSHDB في إنتاج كحل روتيني. استخدم
  invalidation مستهدفًا أو namespace version؛ SCAN مضبوط إذا لزم تشغيليًا.
- لا تبنِ invariant ماليًا أو exactly-once على قفل Redis بسيط؛ قيّم lease
  expiration وownership/release وfencing وبدائل قيود/معاملات قاعدة البيانات.

تحقق من cold cache وتزامن fills وانقطاع Redis وتغير permissions/tenant
وإبطال من instance آخر وفساد payload وفشل commit قبل الإبطال.

## مراجع رسمية

- [HybridCache](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid)
- [StackExchange.Redis basics](https://seredis.dev/Basics.html)
- [Redis eviction](https://redis.io/docs/latest/develop/reference/eviction/)
