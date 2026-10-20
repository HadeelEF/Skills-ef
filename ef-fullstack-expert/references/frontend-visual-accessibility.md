# التنفيذ البصري والإتاحة والعربية

اقرأ عند إنشاء واجهة أو مراجعة CSS/RTL/accessibility أو تحويل تصميم إلى
كود. اجمعه مع مرجع CSS/Tailwind/Bootstrap للـpipeline وإعداد framework.
نفّذ هذه المسؤوليات داخل Fullstack؛ مهارة Frontend المتخصصة اختيارية.
لطلب Pixel-perfect أو نقل Figma/screenshot، اقرأ أيضًا مرجع
design-to-code-and-visual-fidelity من فهرس المهارة ونفّذ دورة المقارنة
والتصحيح فيه؛ المراجعة العامة للتصميم وحدها لا تثبت دقة المطابقة.

## حوّل التصميم إلى نظام قابل للصيانة

- استخرج layout وspacing وtypography وcolors وstates من المصدر المعتمد،
  ثم نظم tokens وcomponents المناسبة. لا تفترض أن ألوان framework تمثل
  هوية EF. استخدم brand/UX وأصول المشروع الفعلية؛ لا تخترع شعارًا رسميًا.
- انقل الأصول المطلوبة إلى موقع يخدمه التطبيق وتحقق من URL وتحميلها.
  حافظ على نسبة الشعار والـclear space؛ افصل حجم الرسم عن مساحة الضغط.
- طابق ملف الخط ووزنه ولغته مع font-face وما يظهر فعليًا؛ افحص fallback
  وsynthetic bold وارتفاع السطر والحركات العربية. لا يكفي ذكر اسم الخط.
- ابن حالات loading/empty/error/disabled/focus/validation والنجاح،
  وليس screenshot لحالة مثالية فقط. استخدم نصوصًا وأطوالًا ممثلة للمنتج.

## عالج سبب مشكلات CSS

- استخدم Grid/Flex والتدفق الطبيعي قبل الإحداثيات المطلقة. افحص intrinsic
  sizing وmin-width/min-inline-size وminmax(0,1fr) عندما يمنع المحتوى
  الانكماش؛ لا تخفِ overflow عامًّا لإخفاء زر أو نص مقصوص.
- تتبع computed styles وcascade وspecificity وsource order وlayers
  وتداخل reset/framework قبل إضافة !important. CSS Modules لا تلغي
  inheritance أو قواعد global؛ عالج مصدر التعارض.
- اختر breakpoints بحسب انكسار المحتوى. استخدم container queries عند
  اعتماد المكون على حاويته مع اختيار ancestor مناسب ودعم متصفح متحقق.
  اختبر narrow/wide وzoom ونصوصًا طويلة ولوحة مفاتيح الجوال عند الحاجة.
- افحص stacking contexts وscroll ancestors وcontaining blocks عند فشل
  z-index أو sticky أو fixed. لا تعالجها برقم z-index ضخم فقط؛ راجع
  portal/clipping، واحم focus من الاختفاء خلف رأس ثابت.
- خصص scroll للجداول الواسعة أو تصميمًا بديلًا يحفظ معنى الأعمدة.
  لا تستخدم ارتفاعًا ثابتًا يقص العربية أو تفرض nowrap على كل المحتوى.
- اجعل الحركة تخدم التفاعل واحترم reduced motion؛ تجنب transition: all
  وwill-change الشامل. aria-disabled وpointer-events وحدهما لا ينفذان
  تعطيل فعل لوحة المفاتيح؛ طابق الدلالة والسلوك.

## نفّذ العربية وLTR/RTL دون تشويه المعنى

- اجعل locale مصدرًا محددًا متوافقًا بين routing وSSR/client؛ حدد أولوية
  تفضيل المستخدم وURL والقيمة الافتراضية. اضبط lang/dir على المستوى الصحيح.
- استخدم logical properties، وراجع DOM/tab order مع الاتجاهين. لا تعكس
  جميع الأيقونات؛ اعكس الدلالات الاتجاهية عند الحاجة واحفظ logos/media.
- استخدم bdi أو اتجاهًا محددًا للمعرّفات والبريد والأرقام المختلطة؛
  راجع menus/portals ومكونات الطرف الثالث التي قد تحتاج إعداد RTL مستقلًا.
- استخدم مفاتيح ترجمة وصيغ plural وIntl المناسبة، لا وصل كلمات قد يفسد
  ترتيب الجملة. ميز date-only عن instant؛ حدد calendar/timezone/currency
  بحسب المجال ولا تغير اليوم بتحويل تاريخ أعمال محلي إلى UTC بلا حاجة.
- احفظ الإدخال والفلاتر والمسار عند تغيير اللغة. تحقق من النص العربي
  الحقيقي ورسائل API والتحقق، لا screenshot بأسماء إنجليزية فقط.

## اجعل التفاعل دلاليًا وقابلًا للوصول

- ابدأ بـHTML native: button للفعل، link للتنقل، label/input مرتبطان،
  headings وlandmarks واضحة، وtable للعلاقات الجدولية. placeholder ليس
  label. استخدم ARIA لتكميل النمط الصحيح، لا لإصلاح عنصر غير مناسب عشوائيًا.
- اربط خطأ الحقل به، واجعل summary والتنبيه بالحفظ مفهومين لقارئ الشاشة.
  أعلن async status بقدر الحاجة دون live region مزعجة تتكرر مع كل render.
- في modal اختر native dialog أو primitive موثوقًا وفق المشروع. نفّذ
  initial focus مناسبًا، وحصر Tab داخل modal، وخلفية غير تفاعلية، وإغلاق
  لوحة المفاتيح وإرجاع focus إلى موضع منطقي. role وaria-modal وحدهما
  لا يقدمان هذه السلوكيات. راجع portal وفتح/إغلاق متكرر وnested overlays.
- نفّذ نمط keyboard كاملًا للمكون المركب المختار؛ لا تضف role=menu إلى
  قائمة روابط عادية دون حاجة. احفظ focus مرئيًا وترتيبًا منطقيًا، دون
  tabindex موجبة أو معلومات مهمة لا تظهر إلا بالـhover/اللون.
- حدد معيار الإتاحة المطلوب وراجع النسخة الرسمية عند تقييم الامتثال.
  افحص contrast وzoom/reflow وtarget size وkeyboard والحركة؛ نتائج axe
  أو Lighthouse وحدها لا تثبت امتثالًا كاملًا.

## تحقق بصريًا وسلوكيًا

شغّل الصفحة الفعلية وافحص screenshots بعد اكتمال الخطوط والأصول في
الأحجام واللغات والحالات المتأثرة. قارن المرجع والنتيجة وحدد الفروق ثم
أصلحها. افحص keyboard وfocus ورسائل الأخطاء؛ قياس scrollWidth وحده لا
يكشف تراكبًا أو قصًا داخليًا. اذكر صراحة إن لم يتوفر browser/visual check.

## المصادر

- [Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
