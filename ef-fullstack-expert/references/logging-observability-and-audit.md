# Logging وObservability وAudit Trail

## ميز الهدف قبل اختيار المكتبة

| السجل | الغرض | الضمان المطلوب |
| --- | --- | --- |
| diagnostic logs | فهم الخطأ والتشغيل | searchable structured events مع مستويات وتكلفة مضبوطة |
| traces وmetrics | تتبع الرحلة والاعتماديات والأداء | correlation وsampling وcardinality تناسب الحمل |
| security events | محاولات دخول ورفض وتغيير صلاحيات | حماية البيانات ورصد المحاولات بما فيها الفاشلة |
| business audit trail | من نفذ تغييرًا مهمًا وعلى أي سجل | ارتباط بحقيقة التغيير وسياسة حفظ ووصول واسترجاع واضحة |

ملف Serilog أو trace ليس audit ledger تلقائيًا. ابدأ بـILogger؛ اختر
Serilog أو OpenTelemetry/providers حسب structured sinks وtracing والبيئة،
دون فرض عدة pipelines متكررة لنفس الحدث.

## صمم diagnostic logging

- استخدم message templates وحقول ثابتة وEventId عند الحاجة بدل بناء
  strings ديناميكية. سجل exception مرة في boundary مناسب دون تكرار مزعج.
- اربط request وDB والخدمات والـworker بـActivity/trace context مدعوم؛
  correlation ID لا يمنح ثقة أو authorization. تحقق من قيم العميل وحدودها.
- امنع passwords/tokens/cookies/secrets وconnection strings والملفات
  وrequest bodies الحساسة. redaction allowlist أفضل من تسجيل الكل ثم الأمل
  أن filter يغطيه. لا تجعل تفعيل Debug يغير هذه القاعدة.
- استخدم UTC ومدة مقاسة وحدات واضحة، وتجنب user IDs أو URLs ذات معرفات
  كـmetric labels عالية cardinality. اضبط sampling وretention بحسب الغرض.
- حدد ماذا يحدث إذا تعطل sink: buffering محدود، backpressure أو فقد معلن
  حسب الأهمية. لا تجعل log loop يستهلك القرص أو يضاعف استثناء التشغيل.

## صمم audit للأعمال والهوية

حدد schema يتضمن EventId، وقت الحدث، actor ثابتًا مع issuer/tenant عند
الحاجة، نوع actor، initiatedBy وexecutedBy للمهام، operation، resource/type/id،
نتيجة العملية، correlation، وسبب مسموحًا أو حقول changed مع redaction.
لا تعتمد على اسم المستخدم المعروض وحده، ولا على header يحدده العميل.

ميز الطلب والمحاولة والنجاح الملتزم. للتغيير الذي يجب تدقيقه بصورة
مضمونة، اكتب audit record أو outbox في نفس معاملة تغيير الأعمال، ثم
صدره؛ audit خارجي بعد commit فقط يمكن أن يضيع. إذا كان التدقيق إلزاميًا
وفشل سجل المعاملة، لا تبلغ عن نجاح العملية دون الضمان المطلوب.
سجل محاولات الرفض والفشل في قناة مستقلة مناسبة؛ rollback معاملة الأعمال
لا يجب أن يمحو دليل محاولة أمنية مطلوب الاحتفاظ بها.

استخدم interceptors للحقول التقنية عند فائدتها، لكن لا تعتبر ChangeTracker
مرجعًا كاملًا للمعنى: raw SQL/bulk updates/ExecuteUpdate وخدمات أخرى قد
تتجاوز المسار. للأحداث المهمة صمم business event صريحًا واختبر التغطية.
امنع تكرار audit عند retry باستخدام EventId/operation identity مناسب.

## احمِ السجل وشغّله

اجعل الكتابة append-only بصلاحيات منفصلة قدر الإمكان، وقيّد القراءة
والتصدير. سجل وصول الإداريين وعمليات التغيير الحساسة. راجع retention
وحذف PII والتصنيف حسب المتطلبات الفعلية، دون اختراع مدة قانونية.
tamper-evident أو WORM يحتاج آلية مثبتة؛ جدول لا يسمح UI بتعديله لا يثبت
أنه immutable. صمم مفاتيح وتحققًا مستقلًا إذا كانت سلامة السجل مطلبًا.

اختبر نجاح/رفض/rollback/retry وعملية worker نيابة عن مستخدم وانقطاع sink
ومحاولات log injection وتسريب الأسرار. اربط alert بسبب قابل للتصرف،
واشرح أين يجد المشغل trace والسجل وكيف يشخصه دون كشف بيانات حساسة.

## مراجع رسمية

- [.NET logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/overview)
- [OWASP logging guidance](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
