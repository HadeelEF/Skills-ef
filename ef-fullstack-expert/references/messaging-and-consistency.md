# المراسلة والاتساق الموزع

اقرأ عند إضافة broker، أو نشر حدث بعد حفظ، أو تكامل غير متزامن بين أنظمة،
أو عملية تمتد عبر أكثر من مالك بيانات. افترض دائمًا: الشبكة تفشل جزئيًا،
والرسائل تتكرر وتتأخر وتصل بغير ترتيب، والعملية قد تُقتل بين أي خطوتين.

## قرر الحاجة قبل الوسيط

- جدول outbox/queue في SQL Server مع worker يكفي لكثير من أنظمة الصندوق
  (حجم معتدل، فريق واحد، نظام واحد مالك). broker يضيف تشغيلًا ومراقبة ونسخًا
  احتياطيًا وترخيصًا ومهارات. اذكر هذه الكلفة في ADR قبل إضافته.
- اختر الوسيط المعتمد في بنية المؤسسة وتحقق من الخدمة المدارة المتاحة فعلًا.

| الخاصية | Queue broker (مثل RabbitMQ / Service Bus) | Log مقسم (مثل Kafka) |
| --- | --- | --- |
| النموذج | queues/topics واشتراكات، competing consumers | partitions بترتيب داخلها، consumer groups وoffsets |
| الترتيب | per queue/session؛ يتكسر مع التوازي وإعادة التسليم | داخل partition بالمفتاح فقط |
| إعادة التشغيل | الرسالة تُحذف بعد ack | replay ضمن retention |
| فشل المعالجة | DLQ/DLX مدمج غالبًا | يجب تصميم retry/DLQ topics |
| الملاءمة | أوامر ومهام وتكامل مؤسسي | تدفقات أحداث كبيرة، تحليلات، إعادة بناء read models |

تحقق من ترخيص المكتبات: بعض مكتبات .NET الشائعة في هذا المجال انتقلت أو
أعلنت انتقالها إلى ترخيص تجاري في إصداراتها الحديثة. وثّق الإصدار والترخيص.

## دلالات التسليم

- exactly-once عبر الشبكة ليس ضمانًا end-to-end. ضمانات «exactly-once» داخل
  بعض الوسطاء لا تشمل قاعدة بيانات خارجية. صمم at-least-once + معالجة idempotent.
- ack قبل الأثر = احتمال فقد. ack بعد commit الأثر = احتمال تكرار. اختر الثاني
  وصمم للتكرار.
- الترتيب: حدد هل المطلوب ترتيب per aggregate. استخدم partition/session key
  = AggregateId، وضع رقم version في الرسالة؛ المستهلك يرفض أو يؤجل نسخة أقدم من
  المحفوظة بدل الاعتماد على ترتيب الوسيط. retries تكسر الترتيب.
- الرسالة تحمل: MessageId ثابت، Type، SchemaVersion، OccurredAt، CorrelationId،
  traceparent، والحد الأدنى من البيانات أو مرجعًا (Claim Check) لا بيانات حساسة كاملة.

## Transactional Outbox بالتفصيل

```sql
CREATE TABLE dbo.OutboxMessages (
    Id            uniqueidentifier NOT NULL PRIMARY KEY,
    OccurredAt    datetime2(3)     NOT NULL,
    Type          nvarchar(200)    NOT NULL,
    SchemaVersion int              NOT NULL,
    AggregateId   nvarchar(100)    NOT NULL,
    Payload       nvarchar(max)    NOT NULL,
    TraceParent   varchar(55)      NULL,
    Attempts      int              NOT NULL DEFAULT 0,
    LockedUntil   datetime2(3)     NULL,
    ProcessedAt   datetime2(3)     NULL,
    LastError     nvarchar(2000)   NULL
);
CREATE INDEX IX_Outbox_Pending ON dbo.OutboxMessages (OccurredAt)
    INCLUDE (LockedUntil) WHERE ProcessedAt IS NULL;
```

- اكتب الرسالة في نفس المعاملة/SaveChanges مع تغيير الأعمال.
- dispatcher يحجز دفعة بعقد lease حتى تعمل عدة نسخ بأمان، مثل:

```sql
WITH batch AS (
    SELECT TOP (@BatchSize) *
    FROM dbo.OutboxMessages WITH (ROWLOCK, READPAST, UPDLOCK)
    WHERE ProcessedAt IS NULL
      AND (LockedUntil IS NULL OR LockedUntil < SYSUTCDATETIME())
    ORDER BY OccurredAt)
UPDATE batch
SET LockedUntil = DATEADD(second, @LeaseSeconds, SYSUTCDATETIME()),
    Attempts = Attempts + 1
OUTPUT inserted.Id, inserted.Type, inserted.Payload, inserted.TraceParent;
```

- انشر، وانتظر تأكيد الوسيط (publisher confirm/ack)، ثم علّم ProcessedAt.
  crash بين النشر والتعليم يعيد النشر؛ لهذا المستهلك idempotent.
- الترتيب per aggregate مع عدة dispatchers يحتاج حجزًا per AggregateId أو
  dispatcher واحد لكل partition؛ قرر ذلك صراحة.
- نظف الرسائل المعالجة بدفعات وفق retention. راقب عمر أقدم رسالة معلقة،
  وعدد المحاولات، ومعدل الفشل؛ هذه إشارات إنذار لا مجرد لوحات.

## Inbox / Idempotent Consumer

- `InboxMessages(MessageId, ConsumerName)` بمفتاح أساسي مركب. في نفس معاملة
  الأثر: أدرج سجل inbox ثم نفذ الأثر. مخالفة المفتاح = رسالة مكررة → ack وتجاهل.
- إذا كان الأثر خارجيًا بلا معاملة مشتركة: idempotency key يدعمه المزود، أو
  state machine (Pending → Sent → Confirmed) مع reconciliation دوري.
- لا تعتمد على dedup window في الوسيط وحده؛ نافذته محدودة ولا تغطي replay.

## Retry وDLQ وPoison Messages

- صنّف الخطأ: transient (timeout، deadlock، 503) → retries قليلة فورية ثم
  delayed retries مع backoff/jitter. permanent (deserialization، validation،
  صلاحية) → DLQ مباشرة دون إعادة.
- DLQ يحفظ السبب والـheaders وعدد المحاولات. وفر أداة replay مصرحة ومدققة،
  ومراجعة دورية؛ DLQ غير مراقب = فقد صامت.
- backpressure: اضبط prefetch/QoS وتوازي المستهلك بما يتوافق مع DB pool
  وحدود المزود. backlog متزايد إشارة سعة، لا مشكلة رسائل.
- تطور العقود: تغييرات additive، وtolerant reader، وSchemaVersion، وupcasting؛
  لا تحذف حقلًا قبل ترحيل كل المستهلكين.

## الاتساق والمعاملات الموزعة

- CAP/PACELC عمليًا: عند انقسام الشبكة اختر لكل عملية التوافر أو الاتساق؛
  وفي الحالة العادية اختر بين latency والاتساق. الرصيد والودائع والصلاحيات:
  اتساق قوي داخل قاعدة واحدة. الإشعارات والتقارير والبحث: eventual مقبول بحد stale معلن.
- read-your-writes بعد عمل غير متزامن: أعد 202 مع مورد حالة، أو اعرض الحالة
  المحلية الملتزمة، ولا توهم المستخدم بالاكتمال.
- لا dual write (DB ثم broker، أو DB ثم API) بلا outbox أو reconciliation.
- Saga: orchestration بحالة مخزنة وtimeouts صريحة عندما تحتاج رؤية العملية؛
  choreography لتدفقات بسيطة. التعويض قد يفشل؛ صمم حالة «تحتاج تدخلًا» ومالكًا.
- لا تستخدم 2PC/MSDTC عبر الأنظمة إلا بقيد قائم موثق.

## اختبر الضمانات لا المسار السعيد

broker حقيقي في Testcontainers أو بيئة معزولة؛ قتل المستهلك بعد الأثر وقبل
ack؛ نسختا dispatcher؛ رسالة مكررة وخارج الترتيب؛ poison message؛ تغيير schema
N/N-1؛ تعطل الوسيط عشر دقائق ثم تصريف backlog مع قياس الزمن.

## مصادر

- [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html)
- [Cloud design patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/)
