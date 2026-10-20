# مراجعة الكود والأمان وقاعدة البيانات

اقرأ عند طلب مراجعة كود .NET أو API أو schema أو PR، أو تدقيق أمني للخادم.
الهدف: إيجاد ما سيكسر الإنتاج أو يسرب بيانات، مرتبًا بالخطورة، مع إصلاح واختبار.

## ترتيب المراجعة

1. **الصحة والأمان**: التفويض، الحقن، التسريب، سلامة المعاملات والتزامن.
2. **البيانات بالحجم**: N+1، تحميل غير محدود، فهارس، خطط، قفل.
3. **الموثوقية**: الإلغاء، المهلات، إعادة المحاولة، التكرار، الحالات النصفية.
4. **التشغيل**: السجلات والأسرار والرصد والتهيئة.
5. **قابلية الصيانة**: المسؤوليات والحدود والتسمية والتكرار.

لا تقدم ملاحظات الأسلوب قبل خلل التفويض. لا تُغرق النتائج بملاحظات Low.

## مقياس الخطورة

| الخطورة | التعريف | أمثلة |
| --- | --- | --- |
| Critical | استغلال مباشر أو فقد/فساد بيانات أو توقف محتمل | IDOR، SQL injection، secret في المستودع، تجاوز تفويض، كتابة بلا concurrency على رصيد |
| High | يظهر تحت حمل أو تزامن أو نسخ متعددة، أو تسريب محدود | N+1 على قائمة كبيرة، sync-over-async، retry لـPOST غير idempotent، cache خاص مشترك |
| Medium | يضعف الموثوقية أو الصيانة أو الرصد | استثناءات مبتلعة، غياب CancellationToken، سجلات بلا correlation |
| Low | أسلوب ووضوح | تسمية، تكرار بسيط |

لكل نتيجة اكتب: الموقع، المشكلة، **شرط الظهور** (حجم، تزامن، نسخ، فشل اعتماد)،
الأثر الإنتاجي، الإصلاح (كود)، والاختبار الذي يثبت الإصلاح.

## قائمة فحص الخادم

- **Authorization**: كل endpoint يفحص العملية والمورد والنطاق في الخادم؛ لا
  userId/tenant/role من العميل؛ endpoints المرفقات والتصدير والبحث مشمولة.
- **Mass assignment**: DTO بحقول مسموحة؛ لا ربط مباشر إلى entity.
- **Injection**: parameters دائمًا؛ dynamic SQL بـallowlist؛ `Process.Start` بلا
  shell ووسائط منفصلة؛ لا تمرير مسار من المستخدم إلى نظام الملفات.
- **Deserialization**: لا `BinaryFormatter` (أزيل في .NET الحديث)، ولا
  `TypeNameHandling` غير `None` مع بيانات غير موثوقة، وحدود حجم وعمق JSON.
- **SSRF**: URLs من المستخدم بـallowlist للمضيفين، ومنع العناوين الداخلية وإعادة التوجيه.
- **Crypto**: لا MD5/SHA1 لكلمات المرور (PBKDF2 من Identity أو مكافئ)، تشفير
  مصادق مثل `AesGcm`، Data Protection للحماية داخل التطبيق، مقارنة ثابتة الزمن للأسرار.
- **Replay/brute force**: webhooks بتوقيع وtimestamp ونافذة وnonce؛ rate limiting
  لكل حساب وIP على login/reset/OTP؛ lockout لا يسهل حجب الآخرين.
- **Tokens**: issuer/audience/lifetime/signing keys؛ refresh rotation مع reuse
  detection؛ لا tokens في URLs أو logs.
- **Secrets**: لا connection strings أو مفاتيح في appsettings المتعقب أو الصور أو السجلات.
- **Files**: حدود حجم، فحص المحتوى، أسماء مولدة، تفويض عند كل تنزيل.
- **Logging**: لا كلمات مرور/tokens/PII كاملة؛ لا log injection من مدخلات بلا ترميز.

## الواجهة

لمراجعة React/TypeScript استخدم مرجع مراجعة كود React بنفس مقياس الخطورة، ومرجع أمان الواجهة.
أبرز ما يُصنّف Critical في الواجهة: `dangerouslySetInnerHTML` أو روابط من بيانات بلا تعقيم، tokens في
localStorage، سر في متغيرات `VITE_*`، returnUrl غير متحقق، بيانات جلسة سابقة تظهر بعد تبديل
المستخدم أو الجهة، وقرار صلاحية مطبق في الواجهة وحدها.

## قائمة فحص البيانات والأداء

- استعلام داخل حلقة؛ `ToList()` قبل التصفية؛ Include لمجموعات متعددة؛ صفحة بلا حد؛
  ترتيب غير حتمي؛ دالة على عمود مفهرس؛ implicit conversion؛ `%term%` على جدول كبير.
- معاملة تنتظر HTTP؛ `SaveChanges` داخل حلقة؛ DbContext مشترك بين threads أو
  singleton؛ قراءة ثم فحص ثم كتابة لـinvariant بلا قيد أو شرط.
- schema: غياب FK/UNIQUE/CHECK، `float` للأموال، `nvarchar(max)` افتراضي، soft
  delete يكسر uniqueness، فهارس مكررة، clustered key عشوائي على جدول كتابة كثيفة.
- migration على جدول كبير: تغيير نوع عمود أو NOT NULL مباشرة → expand/contract وbatching.

## قائمة فحص التزامن والموثوقية

`.Result`/`.Wait()`، `async void`، `Task.Run` حول I/O، fire-and-forget، gaps في
CancellationToken، `HttpClient` جديد لكل طلب، retry بلا budget، lock يحمي حالة
مطلوبة عبر النسخ، cache داخل الذاكرة لحالة مشتركة، `catch (Exception) { return null; }`.

## مثال نتيجة

> **Critical — IDOR في تنزيل المرفق** `AttachmentsController.Download(Guid id)`
> يقرأ الملف بالمعرف دون التحقق من انتماء الطلب الأب لنطاق المستخدم. يظهر لأي
> مستخدم مسجل يعرف أو يلتقط معرفًا (روابط مشاركة، سجلات). الأثر: كشف وثائق جهات
> أخرى. الإصلاح: تحميل metadata مع RequestId ثم `IAuthorizationService.AuthorizeAsync(user, request, "CanReadRequest")`
> قبل فتح الـstream، وإرجاع 404 وفق سياسة كشف الوجود. الاختبار: مستخدم من نطاق B
> يطلب مرفق نطاق A → 404، ومالك المرفق → 200.

## مراجعة قاعدة البيانات

اطلب أو قدّر حجم الجداول ونمط الحمل؛ كثير من المشكلات لا يظهر إلا مع الحجم.
لكل جدول كبير: مفتاح clustered وأثره على الكتابة، الفهارس مقابل query shapes،
القيود، الاحتفاظ والأرشفة، وخطة تغيير schema دون قفل طويل.
