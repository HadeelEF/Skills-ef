# اختيار حزم .NET وتحويلها إلى تكامل عامل

## المحتويات
- عقد اختيار الحزمة
- خريطة الحزم
- وصفات التنفيذ
- ملفات ومستندات

## ثبت الاعتماد قبل كتابة API

اقرأ technology-and-packages، ثم ملفات المشروع الفعلية. سجل package ID
والناشر ونسخة resolved وTFM وdependencies والترخيص والمصدر وتاريخ التحقق.
تحقق من NuGet والمستودع الرسمي للنسخة المستخدمة؛ الأسماء أدناه مرشحون
وليسوا ترتيب شهرة أو توصية بإضافتهم جميعًا. لا تثبت floating versions
ولا تنسب آخر stable إلى الذاكرة. استخدم Central Package Management
وlock/restore policy إذا اختارهما المشروع؛ فرق reference عن resolved graph.

لجرد ساكن دون restore استخدم scripts/dotnet_inventory.py من فهرس المهارة؛
لا يقيم MSBuild conditions ولا يثبت transitive resolution أو compatibility.

## خريطة مرشحين حسب المسؤولية

| المسؤولية | المرشحون | ما يحدد الاختيار |
| --- | --- | --- |
| DB | Microsoft.EntityFrameworkCore.SqlServer، Microsoft.Data.SqlClient، Dapper | tracking/schema/SQL والتحكم الفعلي والمعاملات |
| Validation | المدمج، FluentValidation | async validation وتكامل endpoint ورسائل الحقول |
| Mapping | manual، Mapperly، Mapster، AutoMapper | compile-time diagnostics وprojection والتوافق والترخيص |
| Use cases | استدعاء مباشر، MediatR | حاجة pipeline/dispatch فعلية؛ لا يساوي CQRS |
| Identity | JwtBearer/Identity، Microsoft.Identity.Web، OpenIddict، Duende | دور التطبيق وissuer وSSO والتشغيل والترخيص |
| HTTP resilience | Microsoft.Extensions.Http.Resilience، Polly | budgets وunsafe methods وتركيب السياسات |
| Cache | MemoryCache/HybridCache، StackExchange.Redis | topology وTTL وinvalidation وfailure model |
| Jobs | BackgroundService، Hangfire، Quartz | دوام العمل والجدولة والاستعادة |
| Messaging | MassTransit، Wolverine، Rebus، CAP أو SDK الوسيط | transport وoutbox/inbox وtransactions/versioning؛ تحقق من الدعم والترخيص |
| Logging | Microsoft.Extensions.Logging، Serilog.AspNetCore والسِّنكات المطلوبة | structured events وbounded buffering وredaction |
| Telemetry | OpenTelemetry hosting/instrumentation/exporters | traces/metrics/logs والـcollector والـsampling |
| API docs/versioning | Microsoft.AspNetCore.OpenApi، Scalar، Swashbuckle، Asp.Versioning | framework version وcontract lifecycle وأمان docs |
| Realtime/protocol | SignalR، gRPC/Protobuf | العميل وproxy/load balancer ودلالات إعادة الاتصال |
| Tests | xUnit/NUnit/MSTest، WebApplicationFactory، Testcontainers | SQL حقيقي وحدود HTTP والعزل والترخيص |
| Quality/performance | analyzers، BenchmarkDotNet، architecture-test library عند الحاجة | خطر محدد وبوابة تحقق يمكن تشغيلها |

## وصفات تنفيذ مترابطة

### Validation وMapping

سجل validators بالأعمار الصحيحة ثم استدعِ ValidateAsync في المسار
المستخدم. ترجم field errors إلى العقد؛ لا تجمع automatic validation
متزامنًا مع قواعد async. manual allowlist للتحديث الحساس، وprojection
للقراءة قبل materialization. اختبر malicious fields وnull/absent وSQL
translation، لا وجود profile/validator class فقط.

### HTTP وPolly

سجل typed/named client مع BaseAddress موثق وauth handler آمن. قرر
ميزانية العملية الكلية ثم per-attempt timeout وretry count/backoff/jitter
وconcurrency. عند استخدام AddStandardResilienceHandler افحص defaults
في الإصدار، واضبط DisableForUnsafeHttpMethods أو predicate مكافئ حيث يلزم.
لا تكرر POST إلا بعقد idempotency مع المزود. لا تركب retries داخل SDK
وفوقه دون جمع ميزانيتها؛ لا تحول cancellation إلى نجاح أو retry لانهائي.

### Serilog وOpenTelemetry

ابدأ ILogger وأضف Serilog provider عند الحاجة. في minimal hosting
نسق AddSerilog/ReadFrom.Configuration والخدمات والسِّنكات بحسب الإصدار؛
لا تسجل provider مرتين. إن استخدمت bootstrap logger عرّف انتقاله
إلى logger النهائي وflush عند الإغلاق دون تعريض secrets.

ضع UseSerilogRequestLogging في موضع يغطي ما تريد قياسه قبل handlers؛
حدد الأحداث التي تستثنيها وredaction. أضف ASP.NET/HttpClient وSQL
instrumentation المناسبة للإصدار، وActivitySource/Meter للعمليات
المهمة، وOTLP endpoint من إعداد آمن. لا تسجل SQL parameters أو bodies
حساسة تلقائيًا؛ افحص exporters وcardinality/retention وcollector outage.
اختبر trace من request إلى worker بتسليم سياق مدعوم، دون حفظ bearer token.

### API documentation وcontracts

اختر مولد OpenAPI واحدًا متوافقًا مع نوع endpoints. عرف ProblemDetails
وvalidation وauth schemes وresponses/files/202 operation status. افحص
schema generation وclient compilation وbreaking diff عند تغيير DTO.
UI مثل Scalar لا تنشئ security enforcement؛ احم docs التشغيلية بحسب
سياسة البيئة، ولا تضع أمثلة tokens فعلية في OpenAPI.

### Messaging

تحقق من semantics للوسيط والمكتبة: durable queue/subscription، ack،
retry/error queue وschema versions وترتيب الرسائل. publisher confirm
لا يثبت تنفيذ business effect. اربط inbox/dedup بنفس معاملة الأثر؛
اختبر crash بعد الأثر وقبل ack وpoison message وإعادة التشغيل المدققة.

## أدوات الملفات والمستندات

| الحاجة | مرشح للتحقق | ضابط التنفيذ |
| --- | --- | --- |
| object storage | SDK المزود، AWS SDK for .NET، Alibaba Cloud OSS SDK، S3-compatible SDK | توافق البروتوكول ليس تطابق كل ضمانات S3؛ اختبر conditional writes وsigned URLs |
| private local/SMB | System.IO وملكية خدمة محدودة | path containment وreparse points وACL ومساحة وbackup |
| antivirus | scanner المؤسسة/ClamAV adapter مناسب | quarantine، timeout، scan unavailable لا يعني clean |
| DOCX/XLSX | DocumentFormat.OpenXml، ClosedXML | حجم الذاكرة والصيغ الخبيثة وtemplates والخطوط؛ لا Office COM في web worker |
| PDF | QuestPDF أو PDFsharp أو حل المؤسسة | العربية/RTL/font embedding والترخيص والإصدار وأمان المحتوى |
| images | ImageSharp أو SkiaSharp أو أداة معتمدة | pixels/decompression/native libs والتراخيص ومحو metadata عند الحاجة |
| email | MailKit/MimeKit أو API المؤسسة | queue/idempotency وattachment limits وretry وتدقيق بدون محتوى سري |

لا تعد بدعم العربية بناء على اسم المكتبة؛ أنتج عينة وافحص glyph shaping
وRTL والتفاف النص والتصدير فعليًا. bounds على dimensions/page count/ZIP
expansion والـCPU مهمة حتى لو كان حجم upload صغيرًا. اختبر فشل storage
والـscanner وتزامن replace/delete وانتهاء صلاحية الرابط وسحب الوصول.

## مصادر قبل تثبيت الحزمة
- [NuGet](https://www.nuget.org/)
- [Serilog ASP.NET Core](https://github.com/serilog/serilog-aspnetcore)
- [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/)
- [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)
- [Open XML SDK](https://github.com/dotnet/Open-XML-SDK)

افتح repository/license الرسمي لكل حزمة مختارة؛ هذه الصفحة ليست سجل توافق دائمًا.
