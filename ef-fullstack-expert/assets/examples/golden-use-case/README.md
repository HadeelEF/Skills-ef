# المثال الذهبي: اعتماد طلب شراء من الطرف إلى الطرف

**حالة الدليل:** كود مرجعي مراجَع ساكنًا. لم يُبنَ ولم يُشغَّل في بيئة إعداد المهارة
(لا SDK ولا وصول NuGet). أرقام الحزم `{{verify}}` عمدًا. اكتب الاختبارات لـxUnit v2
(في v3 تتغير توقيعات IAsyncLifetime). عند استخدامه: انسخه إلى معمل، ثبّت الإصدارات،
ابنِ، وشغّل الاختبارات على SQL Server حقيقي قبل الاعتماد عليه.

الغرض: إظهار ما تعنيه تعليمات المهارة في كود واحد مترابط، لا قالب يُنسخ كما هو.

## الملفات وما يثبته كل منها

| الملف | الضمان المعروض |
| --- | --- |
| `Domain/PurchaseRequest.cs` | invariants الانتقال وفصل المهام داخل aggregate بلا اعتماد على HTTP أو EF |
| `Infrastructure/RequestsDbContext.cs` | schema لكل module، rowversion، CHECK، decimal بدقة، فهرس من query shape، outbox وaudit في نفس السياق |
| `Authorization/RequestAuthorization.cs` | resource-based authorization (صلاحية + نطاق الإدارة)، deny by default، هوية من `oid` |
| `Features/ApproveRequest.cs` | ETag قوي و428/412، ترتيب: وجود → تفويض → نسخة → قاعدة أعمال، OriginalValue لنسخة العميل، commit ذري للتغيير+audit+outbox |
| `Infrastructure/OutboxDispatcher.cs` | at-least-once بنسخ متعددة عبر READPAST/UPDLOCK وlease، تعليم مشروط بالملكية، backoff مع jitter، رسائل parked |
| `Notifications/RequestApprovedConsumer.cs` | inbox والأثر في معاملة واحدة، قيد فريد كخط دفاع ثانٍ |
| `Api/Program.cs` | ترتيب middleware، ProblemDetails مع traceId، fallback policy، rate limiting بالمستخدم، liveness مقابل readiness، OpenTelemetry، options validation |
| `tests/ApproveRequestTests.cs` | SQL Server حقيقي بـTestcontainers، 404 لنطاق آخر، 428، 409، وسباق متزامن ينتج نجاحًا واحدًا وأثرًا واحدًا |

## قرارات مقصودة وحدودها

- **404 بدل 403 خارج النطاق**: سياسة عدم كشف الوجود. إذا كانت سياسة المشروع غير ذلك فأعد 403.
- **commit بـ`CancellationToken.None`**: بعد اتخاذ القرار لا نلغي الالتزام بسبب انقطاع العميل.
  القراءات تحترم الإلغاء.
- **`EnableRetryOnFailure` ونتيجة الالتزام المجهولة**: إذا انقطع الاتصال أثناء commit ناجح ثم
  أعاد EF المحاولة، فقد يصطدم التحديث بـrowversion جديد فيعيد 412 رغم نجاح الاعتماد. العميل
  يعيد التحميل فيرى الحالة Approved. للعمليات التي لا تحتمل ذلك استخدم Idempotency-Key مخزنًا
  مع النتيجة، أو تحققًا بعد الفشل (verify-on-retry).
- **rate limiter داخل الذاكرة**: الحد لكل نسخة. مع 5 نسخ يصبح الحد الفعلي ×5؛ استخدم مخزنًا
  مشتركًا أو حدًا على البوابة إذا كان الحد أمنيًا.
- **`AuthorizationHandler` بلا CancellationToken**: اجعل استعلام النطاق قصيرًا ومفهرسًا، أو
  حمّل النطاقات مرة لكل طلب في خدمة scoped.
- **الـdispatcher يعمل في Worker Service** (Windows Service)، لا داخل موقع IIS قد يُعاد تدويره.
- **الترتيب**: best effort داخل الدفعة فقط؛ للترتيب الصارم per aggregate تحقق من version في المستهلك.
- **رسائل parked** (بلغت MaxAttempts): أنذر عليها وأعد تشغيلها يدويًا بإجراء مصرح ومدقق.

## ما ليس في المثال عمدًا

لا MediatR، لا Repository فوق EF، لا مشروع لكل طبقة، لا broker محدد. أضفها فقط عند حاجة
مثبتة كما تنص المهارة.
