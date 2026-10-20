# هندسة HTML وJavaScript وjQuery

## ابنِ HTML دلاليًا وقابلًا للاستخدام

حدد lang وdir وviewport وlandmarks وتسلسل العناوين. استخدم button
للإجراء وa للتنقل، وtype صريحًا للأزرار داخل forms. اربط label بالحقل،
وerrors وhints عبر علاقات مفهومة، وحدد autocomplete وinputmode عند
الفائدة. لا تستبدل عناصر أصلية بـdiv تفاعلي دون دعم لوحة المفاتيح.

راع caption وheaders وscope في الجداول، وحالات عدم وجود بيانات،
وoverflow أفقيًا عند الحاجة. تجنب ids المتكررة وforms المتداخلة عند
إضافة partials. استخدم textContent أو jQuery.text لبيانات نصية غير
موثوقة، وراجع أي استخدام لـinnerHTML أو .html وسياق التعقيم.

اجعل حالة busy/error/success قابلة للإدراك، وأدر التركيز بعد فتح modal
أو خطأ إرسال. حافظ على الوظيفة الأساسية دون JavaScript عندما يناسب
التصميم، ثم أضف التفاعل بصورة تدريجية.

## اكتب JavaScript حديثًا بحدود واضحة

استخدم ES modules حيث تدعمها البيئة، وconst/let وواجهات صغيرة وأسماء
معبرة. افصل الطلبات وتحويل البيانات عن معالجة DOM قدر الحاجة. يمكن
إضافة JSDoc/checkJs أو TypeScript إذا خدم المشروع؛ لا تحول لغة مشروع
قائم أو تنشئ bundler بلا حاجة مرتبطة بالمهمة.

افهم promises وasync/await وevent loop وscope وclosures وthis.
لا تجعل async callback في forEach وسيلة لانتظار مجموعة عمليات؛ اختر
تسلسلًا أو Promise.all مع حد للتوازي بحسب العملية. امنع تسرب listeners
وtimers، وراع teardown عند استبدال مقطع واجهة أو إزالته.

حدد مالك DOM لكل جزء. لا تجعل jQuery أو Bootstrap JS يعدل عناصر
تديرها React دون adapter ودورة حياة واضحة. لا تستخدم eval أو inline
handlers لتجاوز مشاكل wiring أو سياسات CSP.

## اربط Fetch بعقد HTTP حقيقي

افحص response.ok/status قبل إعلان النجاح؛ fetch لا يرفض Promise لمجرد
4xx/5xx. تعامل مع 204 والـContent-Type قبل parsing، والـHTML الناتج
عن انتهاء جلسة أو redirect، وأخطاء ProblemDetails/validation.

استخدم JSON.stringify مع Content-Type المناسب عند JSON. مع FormData
دع المتصفح يضع multipart boundary؛ لا تضبط Content-Type يدويًا. حدد
credentials بحسب الأصل ونمط الجلسة، ومرر CSRF عند الحاجة. لا تعالج
CORS بـno-cors أو توسيع الخادم دون فهم العقد.

استخدم AbortController أو تسلسل معرفات لحماية البحث المتلاحق من النتائج
القديمة. طبّق الحماية على success/error/finally أيضًا حتى لا يمحو طلب
قديم loading أو خطأ الطلب الحالي. debounce يقلل الطلبات ولا يضمن
ترتيبها. ميز abort المقصود عن فشل الشبكة الذي يستدعي رسالة للمستخدم.

## حافظ على jQuery المشروع وافهم plugins

افحص النسخة والبناء الفعليين والإضافات وترتيب scripts؛ لا تستنتج توفر
AJAX أو effects من وجود $. بعض التوزيعات تستبعد وظائف. استخدم وثائق
الإصدار عند تغيير API أو ترقية plugin.

استخدم delegated events على أقرب container مستقر للعناصر الديناميكية.
سمّ events بمساحة مثل click.feature، واجعل init قابلًا للاستدعاء دون
تكرار الربط. أزل listeners الخاصة بميزتك فقط؛ تجنب .off() العام الذي
يعطل ميزات أخرى. افحص $(this) وevent.currentTarget وtarget.

في $.ajax ميز contentType لترميز الطلب وdataType لتفسير الرد. حافظ
على form prefixes عند serialize، وانتبه لأن disabled inputs لا ترسل.
لرفع الملفات استخدم FormData والإعدادات الملائمة للإصدار. تعامل مع
jqXHR وdone/fail/always وفق API الحقيقي؛ ليس jqXHR كائن Fetch Response.

لا تسجل الحدث داخل كل callback أو تُدرج scripts تنفيذية مع كل partial.
هيئ plugin مرة واحدة، واستخدم dispose/destroy أو إعادة parse عند
حاجته وفق وثائقه. تحقق من توافق jQuery Validation وUnobtrusive
Validation وplugins الجداول/الاختيار مع النسخة الفعلية؛ صحة التحقق
الخادمي مستقلة عن نجاحها في المتصفح.

## تحقق من السلوك

افحص إرسالًا واحدًا للنموذج، وفتح/إغلاق modal ثم فتحه ثانية، واستبدال
partial، وفشل 400/401/403/409/500، وطلبًا متأخرًا بعد طلب أحدث، وabort،
وحالة شبكة منقطعة. اختبر DOM حقيقيًا أو بيئة ممثلة عندما يلزم؛ فحص
syntax وحده لا يثبت المتصفح أو تكامل Razor.

المصادر: [HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content)،
[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)،
[Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)،
[jQuery AJAX](https://api.jquery.com/jQuery.ajax/)، [jQuery events](https://api.jquery.com/on/).
