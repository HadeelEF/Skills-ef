# هندسة Razor Pages وMVC

## ابنِ الصفحة على مسؤوليات واضحة

تعرف على .cshtml وPageModel المقابل (.cshtml.cs) و@page وrouting
وOnGet/OnPost وnamed handlers. في MVC استخدم controllers وactions
وview models. سجل الخدمات والمسارات والأصول حسب إصدار ASP.NET Core
الفعلـي؛ لا تنسخ Startup أو إعداد static assets من مثال بإصدار مختلف.

اجعل PageModel ينسق حالة الاستخدام والنتيجة، وانقل القواعد المشتركة
إلى خدمة أعمال واضحة. اجعل .cshtml للعرض وTag Helpers والتنسيق الخفيف،
دون استعلامات قواعد بيانات أو منطق صلاحيات تجارية داخل markup.

استخدم _Layout و_ViewImports و_ViewStart وsections وفق دورها. اختر
partial لإعادة استخدام العرض، وView Component عندما يحتاج جزء مستقل
تحضير بيانات ملائمًا؛ لا تفترض أن partial ينفذ _ViewStart أو دورة
الصفحة كاملة. اجعل scripts المشتركة في layout وسلوك الميزة في ملفها.

## نفذ forms وbinding بصورة مقصودة

استخدم InputModel/ViewModel محدود الحقول بدل binding كيان التخزين
كاملًا. حدد مصدر id من route وبيانات العملية من form أو JSON، وافحص
أي تعارض بدل الثقة في hidden input. طبق BindProperty وSupportsGet
على ما تحتاجه فقط. HTTP GET للقراءة وليس لتعديل البيانات.

في POST افحص ModelState والتحقق الخادمي وقواعد الأعمال. عند إعادة
Page()/View() بسبب خطأ، أعد تحميل قوائم الاختيار وبيانات العرض الضرورية
ضمن نطاق المستخدم، واحتفظ بمحاولته ورسائل الحقول. لا تنفذ redirect
يمحو المدخلات عند فشل التحقق؛ بعد نجاح form العادي استخدم PRG عندما
يناسب العقد، وTempData لرسالة عابرة لا لبيانات عمل حساسة أو دائمة.

استخدم asp-for وasp-validation-for وvalidation summary وlabels متطابقة.
تحقق من أسماء الحقول وprefixes وقيم checkboxes وdisabled controls
ومجموعات العناصر ودقة الأرقام والتواريخ. لا تعتمد على client validation
لصحة المدخلات أو قواعد الأعمال.

## طبق الصلاحيات وCSRF على كل مسار معدل

ضع سياسة الوصول للصفحة على PageModel أو conventions المناسبة. لا
تفترض أن [Authorize] على OnPost handler يفرض حماية مستقلة؛ استخدم
تفويضًا صريحًا للعملية والمورد داخل handler أو endpoint مناسبًا.
أعد قراءة السجل ضمن نطاق المستخدم، وافحص قابلية التعديل وحالة النشر
والـversion في POST، حتى لو سبق فحصها أثناء GET.

احفظ antiforgery المدمج للنماذج ذات cookies. في AJAX أرسل request
token مع cookie المطابقة: في form المرمز ضم الحقل المخفي، وفي JSON
استخدم header مطابقًا لإعداد الخادم. وجود cookie وحدها أو X-Requested-With
لا يحقق الحماية. لا تعطل التحقق لحل خطأ 400 أو مشكلة AJAX.

راجع حدود returnUrl واستخدم إعادة توجيه محلية آمنة. اعتمد Razor encoding
الافتراضي للنصوص؛ لا تستخدم Html.Raw لمدخل مستخدم، ولا تحقن JSON
داخل script بدمج سلاسل غير آمن. استخدم تسلسلًا وترميزًا مناسبين للسياق.

## نفذ AJAX وpartials دون ازدواج قواعد الأعمال

أنشئ URL عبر routing/Tag Helpers أو data attributes موثوقة، مع الحفاظ
على PathBase وquery والـhandler. اتفق على نوع الرد: JSON أو partial.
ميز أخطاء validation و401/403 و409 والـHTML الناتج عن redirect للدخول.

عند تحميل form داخل modal، أعد تهيئة ما يحتاجه من client validation
وفق إصدارات plugins، وتجنب تحميل jQuery/Bootstrap أو تسجيل الأحداث
مرة أخرى مع كل partial. مرر antiforgery وversion الخاصين بالنموذج الحالي.
لا تحدث واجهة المستخدم قبل تأكيد الحفظ، وأعد القراءة لإثبات الاستمرار.

## افحص ما لا يغطيه استدعاء handler مباشرة

اختبر GET وعرض القيم، وPOST صحيحًا، وفشل المدخلات مع بقاء خيارات العرض،
والرمز المفقود/غير الصحيح، ومستخدمًا خارج النطاق، وتعارض النسخة. تحقق
من routing وbinding وantiforgery وauthorization عبر HTTP/متصفح عند
توفر البيئة؛ unit test للـhandler لا يثبت عمل filters وmiddleware.

المراجع الرسمية حسب إصدار المشروع:
[Razor Pages](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/)،
[Model binding](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding)،
[Validation](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation)،
[Partials](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/partial)،
[Page authorization](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/security/authorization/simple)،
[Antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery).
