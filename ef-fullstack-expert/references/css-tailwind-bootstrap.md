# هندسة CSS وTailwind وBootstrap

## صمم وافحص CSS من القواعد الأساسية

افهم box model وcascade وspecificity وinheritance وlayers، وراجع
computed styles لمعرفة القاعدة الفائزة. عالج أصل التعارض بدل تراكم
!important. استخدم tokens/CSS variables ومكونات قابلة لإعادة الاستخدام
تستند إلى هوية EF أو نظام تصميم المشروع، مع scopes واضحة.

اختر Grid للتوزيع ثنائي الأبعاد وFlex للمحور الواحد وفق الحاجة. راجع
min-width:0 وoverflow وintrinsic sizing وstacking contexts وz-index
عند قص جدول أو قائمة أو modal. اختبر الخط العربي وحالات النص الطويل
والتكبير وإعادة التدفق. استخدم logical properties لدعم RTL/LTR.

حدد breakpoints من احتياج المحتوى، واستخدم container queries وميزات
CSS الحديثة فقط عند توافق المتصفحات المستهدفة. احفظ focus-visible
والتباين وreduced-motion، ورسائل الخطأ التي لا تعتمد على اللون وحده.
ضع أنماط طباعة إذا كانت ضمن رحلة العمل، وافحص التصدير على نحو مستقل.

## نفذ Tailwind وفق الإصدار

افحص major الفعلي ومسار البناء قبل التعديل. Tailwind v3 وv4 لهما
اختلافات في import/configuration وCLI/PostCSS/Vite والتوافق؛ لا تجمع
تعليمات الإصدارين. تحقق من متصفحات الجهة قبل ترقية major أو استخدام
ميزات CSS يعتمد عليها الإصدار الجديد.

في Razor أو MVC اختر CLI أو PostCSS أو أدوات المشروع، واضبط build/watch
وproduction output والنسخ إلى wwwroot وdotnet publish. Tailwind لا
يتطلب React، ولا يستلزم خادم Node في الإنتاج إذا كانت النتيجة CSS ثابتة.
استخدم tooling مناسبًا للإنتاج بدل الاعتماد على Play CDN.

افحص اكتشاف ملفات .cshtml وHTML وJS/TS والمكونات المشتركة حسب الإصدار
ومجلد تشغيل البناء. المصدر يُقرأ نصيًا؛ class مثل bg-@Model.Color-500
أو string interpolation قد لا ينتج CSS. استخدم mapping إلى أسماء
كاملة ثابتة ومحدودة، أو source/safelist mechanisms الموافقـة للإصدار.
تجنب إنشاء قوائم واسعة غير ضرورية أو إدخال أصناف مباشرة من مستخدم.

حدد design tokens والألوان والمسافات وأنماط المكونات داخل نظام المشروع.
راجع Preflight وأثره على عناصر HTML وplugins. افحص ملف CSS النهائي
بعد production build، وليس مظهر بيئة التطوير فقط.

## نفذ Bootstrap وفق الإصدار

افحص إصدار CSS وJS معًا. ميز Bootstrap 4 عن 5 في data attributes
وAPIs والتبعيات: Bootstrap 5 لا يشترط jQuery، مع إمكان وجوده لأسباب
أخرى في المشروع. لا تحذف jQuery قبل فحص plugins التي تعتمد عليه.

استخدم grid وutilities وcomponents وvalidation styles وفق الوثائق.
خصص Sass أو CSS variables حسب الإصدار والهدف، بدل تعديل ملفات vendor
أو تحميل نسخة ثانية. راجع تغييرات Sass مع toolchain المعتمد. عند
التعايش مع Tailwind v4 افصل معالجة Sass الخاصة بـBootstrap عن خط
Tailwind، وراجع توافق preprocessor بدل دمجهما في ملف Sass واحد تلقائيًا.

اختر bundle أو plugins محددة مع تبعياتها؛ راجع Popper للمكونات التي
تحتاجه. لا تحمل bundle ثم نسخة منفصلة من نفس plugin. أدر إنشاء modal/
tooltip/dispose والأحداث وفق API الإصدار؛ لا تمزج تهيئة data API
والتهيئة البرمجية المكررة دون حاجة.

استخدم Bootstrap RTL المطابق لإصدار CSS عندما يلزم، مع lang وdir
وقواعد اتجاه النص الصحيحة. افحص icon placement والقوائم وoffcanvas
والتركيز والجداول. لا تعتبر تغيير dir وحده اختبارًا كافيًا لـRTL.

## أدر التعايش والأصول

عند وجود Tailwind وBootstrap معًا، حدد نطاقهما وترتيب cascade/reset
وprefix أو تعطيل reset المناسب وفق الإصدار. احتفظ بمكونات واضحة
الملكية. لا تجعل إضافة framework كامل إصلاحًا لمشكلة تنسيق محلية.
افحص أولوية القواعد العادية خارج layers مقابل القواعد داخلها؛ ترتيب
ملفات CSS وحده قد لا يحسمها. راجع أيضًا انقلاب أولوية الطبقات مع
!important، خصوصًا عند تعارض utilities من إطارين على العنصر نفسه.

راجع ترتيب stylesheet/scripts وcache busting والمصادر الخارجية وCSP
وسياسة الشبكة. إذا كان CDN مسموحًا فحدد النسخة واستخدم SRI مناسبًا
للأصل الثابت عند الحاجة. لا تضف nonce ثابتًا أو توسع unsafe-inline
كحل افتراضي. افحص console/network و404 وCSS الناتج والتجاوب في المتصفح.

المراجع: [CSS specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity)،
[Tailwind installation](https://tailwindcss.com/docs/installation)،
[Class detection](https://tailwindcss.com/docs/detecting-classes-in-source-files)،
[Tailwind upgrades](https://tailwindcss.com/docs/upgrade-guide)،
[Bootstrap introduction](https://getbootstrap.com/docs/5.3/getting-started/introduction/)،
[Bootstrap JavaScript](https://getbootstrap.com/docs/5.3/getting-started/javascript/)،
[Bootstrap RTL](https://getbootstrap.com/docs/5.3/getting-started/rtl/).
