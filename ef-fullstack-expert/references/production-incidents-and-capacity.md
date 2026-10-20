# الحوادث الإنتاجية والسعة والتعافي

اقرأ عند عطل إنتاجي، أو تشخيص بطء، أو تصميم لحمل محدد، أو تشغيل نسخ متعددة،
أو تخطيط DR. القاعدة: الأدلة قبل الفرضية، وإيقاف النزيف قبل السبب الجذري.

## إدارة الحادث

1. **أكد الأثر** (الدقائق الأولى): أي رحلات وأي مستخدمين/جهات، منذ متى، هل
   يتسع؟ حدد الشدة (SEV1 توقف خدمة أساسية … SEV4 أثر محدود) ودور قائد الحادث
   والتواصل.
2. **ماذا تغير؟** نشر، config، شهادة منتهية، تحديث Windows، rebuild فهارس أو
   statistics، تغيّر حمل، اعتماد خارجي، تدوير مفاتيح. الارتباط الزمني أقوى دليل أولي.
3. **أوقف النزيف**: rollback للنشر الأخير إن كان متوافقًا مع البيانات، أو
   إطفاء feature flag، أو تقليل الحمل (rate limit/إيقاف jobs ثقيلة)، أو failover،
   أو فرض آخر خطة جيدة عبر Query Store. التخفيف المؤقت يُسجل ويُزال لاحقًا.
4. **احفظ الأدلة قبل إعادة التشغيل** عندما يكون آمنًا: dump، counters، الطلبات
   المحجوبة في SQL، deadlock graph، traces. restart يمحو الدليل.
5. **السبب الجذري** بفرضية واحدة واختبار واحد، ثم إصلاح دائم مع اختبار regression.
6. **Postmortem بلا لوم**: خط زمني، الأثر، الأسباب المساهمة، لماذا تأخر الاكتشاف،
   إجراءات بمالكين ومواعيد. الإنذار الذي لم يطلق هو نتيجة بحد ذاته.

## Playbooks

| العارض | الدليل الأول | الأسباب الشائعة | التخفيف ثم الإصلاح |
| --- | --- | --- | --- |
| بطء بعد نشر، SQL CPU مرتفع، الطلبات تتكدس | Query Store: الاستعلامات المتراجعة في نافذة النشر، وactual plan | شكل استعلام جديد من EF، فهرس مفقود، implicit conversion (nvarchar مقابل varchar)، predicate غير sargable، تغير خطة بسبب parameter sniffing | rollback أو فرض الخطة الجيدة؛ ثم إصلاح query/index وقياس قبل/بعد |
| latency مرتفع وCPU التطبيق منخفض | طابور ThreadPool وعدد threads، stacks محجوبة | sync-over-async، lock حول I/O، connection pool منتظر | إزالة blocking؛ زيادة min threads مؤقتًا فقط |
| «timeout obtaining a connection from the pool» | عدد الاتصالات المفتوحة، المعاملات الطويلة، readers غير مغلقة | تسرب اتصال، معاملة تنتظر HTTP، توازي غير محدود | إغلاق الموارد وحد التوازي؛ رفع Max Pool Size ليس إصلاحًا |
| blocking في DB | `sys.dm_exec_requests` (blocking_session_id) وhead blocker ونصه | معاملة طويلة، scan يأخذ locks كثيرة، escalation | إنهاء head blocker بقرار مسؤول؛ تقصير المعاملة والفهرسة |
| deadlocks | `system_health` XE وdeadlock graph | ترتيب وصول متعاكس، فهرس مفقود يوسع القفل | ترتيب ثابت للوصول، فهرس؛ retry للوحدة كلها إن كانت idempotent |
| ذاكرة تنمو | عدة dumps متباعدة، `dumpheap -stat`، gcroot | cache بلا حد، event handlers غير ملغاة، static collections، LOH fragmentation | حد/TTL، إلغاء الاشتراك؛ recycle مجدول مؤقت فقط |
| Redis timeouts | رسالة الاستثناء (طوابير الإرسال والاستقبال وحالة threads) | ThreadPool starvation في العميل، قيم كبيرة، hot key، شبكة | إصلاح starvation، تقليص القيم، تجاوز cache عند الفشل |
| تنفيذ job مكرر | سجل التنفيذ بالـinstance ID | عدة نسخ تشغل نفس الجدولة، lease منتهٍ، crash قبل التعليم | قفل/clustered scheduler + idempotency الأثر |
| رسائل مكررة | MessageId في inbox | at-least-once طبيعي | inbox/idempotent consumer |
| App Pool يتوقف | Event Viewer (WAS) وRapid-Fail Protection وسجل التطبيق | استثناء غير معالج في thread خلفي، stack overflow، startup failure، هوية | إصلاح الاستثناء؛ لا تعطيل Rapid-Fail لإخفائه |

## تقدير السعة (قدّم أرقامًا موسومة كافتراضات)

- المستخدمون المتزامنون ليسوا RPS. مثال: 10,000 مستخدم نشط، طلب كل 30 ثانية
  ≈ 333 طلبًا/ث متوسطًا؛ ذروة ×3 ≈ 1,000 طلب/ث. اذكر الافتراضات صراحة.
- Little's Law: التزامن = المعدل × الزمن. 1,000 طلب/ث × 20ms زمن DB لكل طلب
  ≈ 20 اتصالًا نشطًا في المتوسط؛ الذروة والتذبذب أعلى. قارن مع حد pool لكل
  connection string لكل process ومع عدد النسخ.
- حجم البيانات: صفوف/يوم × سنوات الاحتفاظ × حجم الصف + الفهارس + audit.
  جدول 500 مليون صف يغيّر استراتيجية migration والفهرسة والأرشفة.
- ثبت التقدير باختبار حمل (k6 أو JMeter أو NBomber) على بيانات ممثلة، مع p95/p99
  ونقطة التشبع الأولى (DB، CPU، pool، اعتماد خارجي).

| المستوى | ما يكفي غالبًا | أين يبدأ الانكسار |
| --- | --- | --- |
| 100 مستخدم | نسخة واحدة + SQL Server | أخطاء منطقية لا سعة |
| 1,000 متزامن | نسختان خلف LB، فهارس صحيحة، jobs خارج الويب | N+1، صفحات بلا حد، in-memory state |
| 10,000 متزامن | NLB متعدد، Redis مشترك، read replicas للتقارير، backplane | DB writes وlocks، hot rows، تقارير على قاعدة المعاملات |
| 100,000+ | تقسيم الحمل حسب المجال، queues للتسوية، caching متعدد الطبقات، فصل read models | قاعدة واحدة للكتابة، تنسيق النشر، كلفة التشغيل والفريق |

## اختبار النسخ المتعددة (5 نسخ)

راجع: `IMemoryCache` غير متسق بين النسخ؛ `BackgroundService` يعمل 5 مرات؛ ملفات
محلية لا تراها النسخ الأخرى؛ `lock`/`SemaphoreSlim` تحمي process واحدًا؛ مفاتيح
Data Protection غير مشتركة (cookies تفشل)؛ SignalR بلا backplane؛ rate limiter داخل
الذاكرة يضاعف الحد ×5؛ migrations عند startup ×5؛ dispatcher outbox بلا حجز؛
سجلات على قرص محلي؛ اختلاف config بين الخوادم.

## مصفوفة الفشل

| الاعتماد يتعطل | السلوك المطلوب | الآلية |
| --- | --- | --- |
| SQL Server | رفض الكتابات بوضوح (503)، readiness يفشل، لا فقد ملتزم | execution strategy للعابر، timeouts، لا قبول طلب لا يمكن حفظه |
| Redis | الاستمرار من المصدر بحمل محدود | cache-aside اختياري، حد استعلامات، عدم فتح أقفال أمنية |
| API خارجية بطيئة | timeout قصير، فشل معزول، استكمال لاحق | per-attempt timeout، retry budget، circuit breaker، outbox |
| recycle/restart | لا فقد عمل مقبول | عمل دائم في جدول/وسيط، graceful shutdown |
| الوسيط | استمرار قبول الطلبات | outbox يتراكم ويُصرف لاحقًا مع إنذار عمر |
| قتل العملية وسط عملية | لا حالة نصفية | معاملة واحدة، state machine، idempotency، reconciliation |

## التعافي من الكوارث

- عرّف RPO/RTO لكل فئة بيانات مع المالك؛ لا تخترعها. اربط نموذج recovery
  وجدول backups (full/diff/log) بها.
- اختبر restore فعليًا ودوريًا إلى بيئة معزولة، وقِس زمنه مقابل RTO؛
  `RESTORE VERIFYONLY` لا يثبت قابلية الاستعادة الكاملة.
- احفظ ما يلزم للاستعادة غير قاعدة البيانات: مفاتيح Data Protection، شهادات
  TDE/TLS، أسرار، ملفات التخزين وmetadata متسقة، تهيئة IIS.
- availability replica ليست backup. خيارات HA تعتمد على edition والخدمة المدارة.

## الكلفة

لكل مكوّن مقترح اذكر: البنية، والترخيص (مثل ميزات SQL Server المتاحة في
Enterprise دون Standard كبعض عمليات الفهرسة online)، وكلفة التشغيل والمراقبة،
والمهارات المتوفرة في الفريق. الحل الأرخص تشغيلًا الذي يحقق المتطلبات أفضل غالبًا.

## مصادر

- [Query Store regressed queries](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store)
- [Google SRE: Postmortem culture](https://sre.google/sre-book/postmortem-culture/)
