# المصادر وحدود المرجع

الفهرس: [الإصدار](#version) · [أنواع الأدلة](#evidence) · [التعارضات](#discrepancies) ·
[تغطية الدليل](#coverage) · [سلامة الأصول](#asset-integrity).

## Version

- اسم المرجع: **EF Brand Guidelines**؛ المعرف الثابت `ef-brand-guidelines`.
- إصدار هذه الحزمة: **1.0.1**، حُدثت في **2026-09-28**.
- تحديث الحزمة: تصنيف الخلفيات التسع ضمن العروض التقديمية وتوثيق الاستخدامات
  المقترحة؛ محتوى ملفات الصور وبصماتها محفوظ كما هو.
- إصدار الهوية المطبوع في المصدر: **Version 01, November 2024**، 115 صفحة.
- تاريخ التصدير أو تعديل الملف لا يثبت إصدار هوية جديدًا أو اعتمادًا مؤسسيًا محدثًا.
- أساس العمل: نسخة العرض الكاملة، النص المستخرج من الأصل، المختصر، والأصول
  الموجودة في حزمة `ef-brand-identity` المقدمة من المستخدم. لا يحتاج المستهلك
  إلى تلك الحزمة أو ملفات PDF لتطبيق هذا المرجع.
- النسخة الكاملة المفحوصة PDF مصور: 115 صورة بحجم 1920×1080، دون طبقة نص أصلية
  أو رسوم متجهة قابلة للاستخراج. النص المصاحب استُخدم للبحث ثم روجعت الأدلة البصرية.
- المختصر 14 صفحة يحفظ نصوصًا ورسومًا متجهة، مع عنصر صوري داخل إحدى الصفحات؛
  موضوعاته موجودة في الكامل. فائدته الفنية محفوظة في الأرشيف الأصلي؛ لا نستبدله
  بمزاعم أن صور هذه الحزمة متجهة أو قوالب قابلة للتحرير.
- أبقيت المصادر الأصلية في موضعها خارج الحزمة الجديدة. الأسماء والبصمات أدناه
  للتتبع الأرشيفي، وليست ملفات مطلوبة وقت الاستخدام أو روابط محلية مفقودة.

| المصدر المفحوص مباشرة | البايتات | SHA-256 |
| --- | ---: | --- |
| `ef-visual-identity-guideline.pdf` | 24611055 | `84b59d7599b803615db50f2ae044ec03a144332e6b201a22e979c3775fc1c40a` |
| `ef-visual-identity-mini-guideline.pdf` | 1225727 | `00311d44ea6427ee914b1aa928f39089597b5d38e04f1fb318a64aafba9a5ee0` |
| `guideline-source-text.txt` | 115120 | `42aa3e054b4fcb73bfa0f89c4318f7e758d2159dd7268b1c513df4c253c1dedd` |

الأصل السابق الموصوف في فهرس الحزمة: `EF_Visual_Identity_Guideline.pdf`، 70421123
بايت، SHA-256: `d71bccadb09eabaa62f7c14f9055e4f8e42d4e6569ba1e637463773a6cafe51b`. هذه بيانات موروثة من فهرس المصدر؛
لا تمثل فحصًا جديدًا لملف الأصل الذي أنشئت منه نسخة العرض.

## Evidence

| النوع | معناه وطريقة استخدامه |
| --- | --- |
| قاعدة موثقة | نص أو قياس صريح في الدليل؛ يحفظ مصدره وسياقه |
| مثال بصري | تكوين أو معالجة معروضة؛ لا يستنتج منها رقم إلزامي غير موضح |
| خاصية مرصودة | ما يحتويه الملف الفعلي: لونه أو صيغة الرسم أو بيانات الخط |
| توصية تطبيق | قرار مقترح لتطبيق الهوية؛ يتكيف مع طلب المستخدم وقرارات المشروع |

عند التعارض، استخدم المصدر الملائم للسؤال: قيمة اللوحة من الدليل، ورسم الشعار
من ملفه الأصلي. اتبع طلب المستخدم مع توضيح التخصيص، ولا تجعل قرار المشروع
قاعدة رسمية جديدة. راجع أثر التعارض على الجزء المعني وأكمل بقية العمل.
وجود أصل أو ملاحظة عامة عن Adobe Fonts لا يثبت جميع حقوق التضمين والاستضافة
وإعادة التوزيع. لا تدّع حقًا أو اعتمادًا أو اختبارًا غير موثق.

## Discrepancies

| المسألة | حقيقة المصدر | التعامل |
| --- | --- | --- |
| أزرق اللوحة وأزرق الشعار | ص22 مقابل ملفي الشعار الأزرقين: قيمتان مختلفتان | قيم التصميم في brand-rules؛ ألوان الأصول الأصلية محفوظة |
| HEX غير صالح في ص24 | الدرجة المحايدة مطبوعة بسبعة محارف بعد # | تطبيع موضح في قسم Color اعتمادًا على RGB؛ لا ينسب الرقم المصحح إلى النص المطبوع |
| درجة الأزرق الداكن في ص24 | HEX لا يطابق RGB وCMYK بجواره | يوضح قسم Color قرار الاستخدام الرقمي؛ الطباعة تحتاج تحققًا من مواصفة صحيحة |
| CMYK للون الأساسي الداكن | ص22: 0/0/0/100؛ ص24: 56/29/0/87 | حفظ السياقين وعدم الادعاء بتحويل لوني معتمد واحد |
| تفضيل تركيب الشعار | ص11 وص12 تصفان نسختين بصياغة تفضيل | لا تُفرض أولوية حصرية؛ اختر حسب الموجز والأصل المتاح |
| موضع الشعار | ص17 يفضل نصًا الركنين الأيمنين، ويعرض رسمًا متمركزًا رأسيًا | حفظ المثال وسياقه دون فرض موضع واحد على كل وسيط |
| المساحة العامة وصورة الحساب | ص8/13 مقابل مخطط ص81 | حفظ النسبة العامة ونسبة مثال الحساب منفصلتين؛ لا نعمم الثانية |
| تسلسل الخطوط | نسب ص31 وأمثلة ص32/33 فيها فروق تقريب وسياق | تحفظ الأمثلة كما هي؛ لا نفرض سلم UI رسميًا مستنتجًا |
| Light مقابل الملفات | الدليل يعرض Light؛ الملفات المتاحة تشمل Hair ولا تشمل Light | لا تبديل صامت؛ البديل المناسب يوضح في التطبيق |
| أسماء pattern القديمة | الملفان يحتويان قصات شعاعية صورية داخل SVG | الأسماء الجديدة تصف المحتوى؛ بلاطة النمط المتكرر غير مرفقة |
| أسماء navy للخلفيات 07/09 | المظهر أزرق رغم الاسم التاريخي | افحص الصورة ولا تستنتج قيمة HEX من الاسم |
| وصف الموضع في اسم الخلفية 06 | العنصر الخافت كبير ويمتد من الأسفل عبر الوسط | وصف الفهرس مبني على الصورة؛ لا يحدد الاسم التاريخي مساحة النص الآمنة |
| القيم المؤسسية في النماذج | تسميات في بعض أمثلة النشرة تختلف عن قائمة ص5 | استخدم ص5 لسياق القيم؛ النموذج لا يثبت تحديثها |
| بيانات النماذج | موظفون وعناوين وأرقام ومحتوى توضيحي في دليل 2024 | لا تعتمدها كحقائق راهنة أو نصوص نشر معتمدة |

## Coverage

تغطي النصوص القواعد القابلة للاستخدام، وتحفظ الصور المرجعية جميع الصفحات
ذات المحتوى الموضوعي المحددة أدناه. الصور الـ101 كاملة وغير مقصوصة؛ صفحة
الصورة توافق صفحة PDF الكامل. ملفات JPEG نُقلت من نسخة العرض كما هي؛ صفحات
الصور الأخرى حُفظت WebP دون فقد. تحققت مطابقة البكسلات المفكوكة للصفحات الـ101
مع نسخة العرض، مع بقاء المقاس 1920×1080. هذا يحفظ النسخة المقدمة ولا يعيد
تفاصيل متجهة أو جودة كانت قد فُقدت عند إعداد نسخة العرض السابقة.

افتح فقط الصورة ذات الصلة، ولا تحمل الفهرس كاملًا لمهمة بسيطة. الأرقام
والكتابات الصغيرة في نماذج مركبة قد تحتاج تكبيرًا؛ لا تخمّن بعدًا غير مقروء.
صور المرجع ليست أصولًا قابلة للتحرير ولا إثباتًا لتوفر قوالبها الأصلية.

| صفحات المصدر غير المرفقة كصور | المعالجة وسبب عدم تكرارها |
| --- | --- |
| 1 | غلاف؛ بيانات العنوان والإصدار موثقة أعلاه |
| 2 | فهرس؛ حل محله فهرس التغطية هذا وروابط القواعد |
| 3 | مقدمة عن التعرف والاتساق واتباع الهوية؛ الغرض محفوظ في SKILL.md |
| 6،20،27،35،51،55،71،80،94،103 | فواصل أبواب؛ أسلوب عناصرها مغطى في الرسوم والتكوينات |
| 115 | صفحة ختامية؛ لا تضيف قاعدة |

كل صف أدناه يربط الصورة بمجالها. الأمثلة المكتبية والبيئية والهدايا توضح
المظهر؛ مواصفات التصنيع غير المذكورة لا تُستنتج من الموك أب.

| صفحة | الموضوع والصورة | موقع تفسير القاعدة أو سياق التطبيق |
| ---: | --- | --- |
| 4 | [منطلق الهوية والغاية](visual-examples/p004.webp) | [سياق الهوية](brand-rules.md#brand-context) |
| 5 | [القيم والوعد ومنطلق الرمز](visual-examples/p005.jpg) | [سياق الهوية](brand-rules.md#brand-context) |
| 7 | [الرمز](visual-examples/p007.webp) | [الشعار](brand-rules.md#logo) |
| 8 | [المساحة الآمنة للرمز](visual-examples/p008.webp) | [الشعار](brand-rules.md#logo) |
| 9 | [الحد الأدنى وحفظ النسب](visual-examples/p009.webp) | [الشعار](brand-rules.md#logo) |
| 10 | [رموز التطبيقات والتواصل](visual-examples/p010.webp) | [الشعار](brand-rules.md#logo) |
| 11 | [التركيب الأفقي](visual-examples/p011.webp) | [الشعار](brand-rules.md#logo) |
| 12 | [التركيب العمودي](visual-examples/p012.webp) | [الشعار](brand-rules.md#logo) |
| 13 | [المساحة الآمنة للتركيب](visual-examples/p013.webp) | [الشعار](brand-rules.md#logo) |
| 14 | [معالجات الشعار اللونية](visual-examples/p014.webp) | [الشعار](brand-rules.md#logo) |
| 15 | [الشعار على الخلفيات](visual-examples/p015.webp) | [الشعار](brand-rules.md#logo) |
| 16 | [الاستخدامات الخاطئة](visual-examples/p016.jpg) | [الشعار](brand-rules.md#logo) |
| 17 | [مواضع الشعار](visual-examples/p017.webp) | [الشعار](brand-rules.md#logo) |
| 18 | [الشراكات](visual-examples/p018.jpg) | [الشعار](brand-rules.md#logo) |
| 19 | [شعارات الإدارات](visual-examples/p019.webp) | [الشعار](brand-rules.md#logo) |
| 21 | [سياق لوحة الألوان](visual-examples/p021.jpg) | [الألوان](brand-rules.md#color) |
| 22 | [الألوان الأساسية](visual-examples/p022.webp) | [الألوان](brand-rules.md#color) |
| 23 | [الألوان الثانوية](visual-examples/p023.webp) | [الألوان](brand-rules.md#color) |
| 24 | [درجات الألوان](visual-examples/p024.webp) | [الألوان](brand-rules.md#color) |
| 25 | [الشعار على ألوان الهوية](visual-examples/p025.webp) | [الألوان](brand-rules.md#color) |
| 26 | [توازن الألوان](visual-examples/p026.webp) | [الألوان](brand-rules.md#color) |
| 28 | [العائلة الأساسية وملاحظة الخطوط](visual-examples/p028.webp) | [الخطوط](brand-rules.md#typography) |
| 29 | [أوزان Aktiv](visual-examples/p029.webp) | [الخطوط](brand-rules.md#typography) |
| 30 | [Tahoma](visual-examples/p030.webp) | [الخطوط](brand-rules.md#typography) |
| 31 | [نسب التسلسل النصي](visual-examples/p031.webp) | [الخطوط](brand-rules.md#typography) |
| 32 | [المثال العربي](visual-examples/p032.webp) | [الخطوط](brand-rules.md#typography) |
| 33 | [المثال الإنجليزي](visual-examples/p033.webp) | [الخطوط](brand-rules.md#typography) |
| 34 | [التكوين ثنائي اللغة](visual-examples/p034.webp) | [الخطوط](brand-rules.md#typography) |
| 36 | [مفهوم العناصر الشعاعية](visual-examples/p036.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 37 | [استخدام الربع والنصف](visual-examples/p037.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 38 | [معالجات العناصر](visual-examples/p038.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 39 | [تكوينات رسومية](visual-examples/p039.jpg) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 40 | [تكوينات مع صور](visual-examples/p040.jpg) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 41 | [القص والتكبير](visual-examples/p041.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 42 | [تطبيق قص الصور](visual-examples/p042.jpg) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 43 | [مثال لوحة](visual-examples/p043.jpg) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 44 | [النمط المتكرر](visual-examples/p044.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 45 | [أسلوب الأيقونات](visual-examples/p045.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 46 | [أمثلة الأيقونات](visual-examples/p046.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 47 | [أيقونات القطاعات](visual-examples/p047.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 48 | [رسم بيئي](visual-examples/p048.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 49 | [رسم بحري](visual-examples/p049.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 50 | [الإنفوجرافيك](visual-examples/p050.webp) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 52 | [اتجاه الصور](visual-examples/p052.jpg) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 53 | [معالجة الصور الرسمية](visual-examples/p053.jpg) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 54 | [التصوير الرسمي](visual-examples/p054.jpg) | [الرسوم والصور](brand-rules.md#graphics-and-imagery) |
| 56 | [بطاقة العمل](visual-examples/p056.jpg) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 57 | [عرض بيانات اتصال على الجوال](visual-examples/p057.jpg) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 58 | [ورق المراسلات](visual-examples/p058.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 59 | [شهادة](visual-examples/p059.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 60 | [ظرف DL](visual-examples/p060.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 61 | [ظرف A5](visual-examples/p061.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 62 | [ظرف C4](visual-examples/p062.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 63 | [مجلد A4](visual-examples/p063.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 64 | [مجلد VIP](visual-examples/p064.jpg) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 65 | [مفكرة A5](visual-examples/p065.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 66 | [بطاقات موظف وزائر](visual-examples/p066.jpg) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 67 | [جدول اجتماع](visual-examples/p067.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 68 | [دعوة](visual-examples/p068.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 69 | [دبوس](visual-examples/p069.jpg) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 70 | [أختام](visual-examples/p070.webp) | [المستندات](applications.md#documents) و[المطبوعات](applications.md#physical-applications) |
| 72 | [شبكة الإعلان](visual-examples/p072.webp) | [الإعلانات](applications.md#advertising) |
| 73 | [الإعلان العمودي](visual-examples/p073.webp) | [الإعلانات](applications.md#advertising) |
| 74 | [الإعلان الأفقي](visual-examples/p074.webp) | [الإعلانات](applications.md#advertising) |
| 75 | [الشريط العريض](visual-examples/p075.webp) | [الإعلانات](applications.md#advertising) |
| 76 | [حملات عرضية وتعليمات القوالب](visual-examples/p076.jpg) | [الإعلانات](applications.md#advertising) |
| 77 | [بروشور](visual-examples/p077.jpg) | [الإعلانات](applications.md#advertising) |
| 78 | [لوحة خارجية](visual-examples/p078.jpg) | [الإعلانات](applications.md#advertising) |
| 79 | [رول أب](visual-examples/p079.jpg) | [الإعلانات](applications.md#advertising) |
| 81 | [صورة الحساب والقص](visual-examples/p081.webp) | [التواصل](applications.md#communications) |
| 82 | [X](visual-examples/p082.jpg) | [التواصل](applications.md#communications) |
| 83 | [LinkedIn](visual-examples/p083.jpg) | [التواصل](applications.md#communications) |
| 84 | [YouTube](visual-examples/p084.jpg) | [التواصل](applications.md#communications) |
| 85 | [توقيع البريد](visual-examples/p085.jpg) | [التواصل](applications.md#communications) |
| 86 | [نشرة بريدية](visual-examples/p086.jpg) | [التواصل](applications.md#communications) |
| 87 | [تواصل داخلي 1](visual-examples/p087.jpg) | [التواصل](applications.md#communications) |
| 88 | [تواصل داخلي 2](visual-examples/p088.jpg) | [التواصل](applications.md#communications) |
| 89 | [تواصل داخلي 3](visual-examples/p089.jpg) | [التواصل](applications.md#communications) |
| 90 | [تواصل داخلي 4](visual-examples/p090.jpg) | [التواصل](applications.md#communications) |
| 91 | [تكوين موقع](visual-examples/p091.jpg) | [المنتجات الرقمية](applications.md#digital-products) |
| 92 | [عرض الموقع](visual-examples/p092.jpg) | [المنتجات الرقمية](applications.md#digital-products) |
| 93 | [العرض التقديمي](visual-examples/p093.jpg) | [العروض](applications.md#presentations) |
| 95 | [مخطط مواضع اللافتات](visual-examples/p095.webp) | [التطبيقات المادية](applications.md#physical-applications) |
| 96 | [شعار خارجي](visual-examples/p096.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 97 | [شعار داخلي 1](visual-examples/p097.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 98 | [شعار داخلي 2](visual-examples/p098.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 99 | [مكعبات](visual-examples/p099.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 100 | [معالجة الزجاج](visual-examples/p100.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 101 | [جناح](visual-examples/p101.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 102 | [الزي](visual-examples/p102.webp) | [التطبيقات المادية](applications.md#physical-applications) |
| 104 | [كوب](visual-examples/p104.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 105 | [قاعدة كوب](visual-examples/p105.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 106 | [فنجان قهوة سعودية](visual-examples/p106.webp) | [التطبيقات المادية](applications.md#physical-applications) |
| 107 | [حامل بطاقة](visual-examples/p107.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 108 | [حزمة ترحيب](visual-examples/p108.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 109 | [دفتر](visual-examples/p109.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 110 | [قبعة](visual-examples/p110.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 111 | [غطاء جوال](visual-examples/p111.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 112 | [بطارية متنقلة](visual-examples/p112.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 113 | [قارورة ماء زجاجية](visual-examples/p113.jpg) | [التطبيقات المادية](applications.md#physical-applications) |
| 114 | [حامل بطاقات](visual-examples/p114.jpg) | [التطبيقات المادية](applications.md#physical-applications) |

المختصر الأرشيفي يطابق الموضوعات التالية من الكامل بالترتيب: 22،23،24،26،28،29،30،
36،37،38،39،41،44،50. ترقيمه المطبوع يختلف في بعض الصفحات؛ جميع إحالات هذه
الحزمة تستخدم أرقام الكامل، ولا يوجد offset واحد للتحويل بينهما.

## Asset integrity

الأصول الأربعة والعشرون طابقت بصماتها ملفات المصدر عند النسخ. الجدول التالي
سجل ثابت للتحقق من التغيير، و[الفهرس](asset-catalog.md) يحدد المسارات الحالية
لكل معرف. عند استبدال أصل أو تحديث الهوية، حدّث القاعدة والفهرس والإصدار
والبصمة ذات الصلة معًا، ثم افحص الروابط والمظهر. تحديث إصدار الحزمة لا يغيّر
تلقائيًا إصدار الهوية المنقول من الدليل.

| معرف الأصل | البايتات | SHA-256 |
| --- | ---: | --- |
| `EF-LOGO-KSA-BLUE` | 29129 | `b7953a024f8b172d31f737a7386c9633443275ff1848a2a68d9476d7dce71f16` |
| `EF-LOGO-HORIZONTAL-BLUE` | 20609 | `026f7f22ecdb794df6596b71dec20acf91a31f1d3860dcc9be76f789298fdf76` |
| `EF-LOGO-HORIZONTAL-WHITE` | 34601 | `232125b1d42d8fa20baa17fd0efebe3e0894bfa4f87ec5a2d706ef3d6a657878` |
| `EF-LOGO-SYMBOL-WHITE` | 19953 | `ba5c156a0f9e048de4ba192bd8cc9050d0a99c58f7c742357282a7bd550c97b1` |
| `EF-RADIAL-MASTER` | 40545 | `97d537f1cfb31d5ace6abe126521ae979e56fdd6d18db353d74e663e239e5588` |
| `EF-RADIAL-CROP-BLUE` | 413525 | `667d59bb88e4e720e747ee19d072ca0e1698be931157973c3e18c2f51d3db6d0` |
| `EF-RADIAL-CROP-BLUE-GREEN` | 423801 | `ab1d10ea7e192328211db46004daf1e7d91766c8bad363ad4ec1b89770feb3e4` |
| `EF-BG-01` | 69158 | `5839bfa69dd1bfeb16ead041e18862319d1675afc13de44122079fe2c8eced2e` |
| `EF-BG-02` | 67171 | `835e916c61a585bb187f7730e6b3bf46b4a33bbcd4b51249d411df043119c16b` |
| `EF-BG-03` | 62696 | `5db3ad5f51c0a7c0beb4876f4b93173e0bf16ace0a2b4385983cf29612be5907` |
| `EF-BG-04` | 95891 | `e03296e331403579af8936e9002e36673bf0b2a663d0b3b5bed7d97689443d23` |
| `EF-BG-05` | 100742 | `cd668af5ffafc964c7c56b246a8171fd78a0c42382a7a1c751a5026dd70398bc` |
| `EF-BG-06` | 110081 | `92840fa7bc3a4ba86d3f8ba0a34bff18da1439e4c0573f65934df0a32b86873f` |
| `EF-BG-07` | 30453 | `674d31209c4e6bbea73272966ce4d35da2c410de426e23999e7bfe49f049f0b2` |
| `EF-BG-08` | 202743 | `72358d189554f9c0c28f482ce47a2abe0cf0ad8b8aa2339f79123653acd02425` |
| `EF-BG-09` | 77010 | `caa14efd0172af42849f860739369d5f0576c337d09190f81569d976c5231dc3` |
| `EF-FONT-BLACK` | 1023608 | `11aae0c591565716a1e14108966b98814cbc30c404da88e303bba99022cc4366` |
| `EF-FONT-BOLD` | 1033924 | `dd6c9e9b141f824c8b471584f3202ab52df19e1e63e5e24acd0ef88cde5a688b` |
| `EF-FONT-HAIR` | 1028596 | `e7e46396cbb988106ceb853e590c1e8beeaf369bb3134a9ca2a306c1b2faef51` |
| `EF-FONT-MEDIUM` | 1038468 | `89e23787598c96632f2138d0bcc474a97e40bd70a3813411fa28b6c737012b63` |
| `EF-FONT-REGULAR` | 1033280 | `de69665f38570b848a94a6b8573e6ef7db2f5637deecebd0d1cfa14c5c51c1bc` |
| `EF-FONT-SEMIBOLD` | 1036048 | `59a9a15714cb1ff9ae9592bbbffb1ae25ccbeb4fe4c6d17bab2aa9816f87915e` |
| `EF-FONT-THIN` | 1038172 | `a3e9c141621bf9f7e26cb4148822e17cda1d5e2a5f4b469e5d69c27087484b59` |
| `EF-FONT-XBOLD` | 1031264 | `5a36b001736f02daa1c4526d74a2bdc63c168d2f9442a204461fb26e3bbcd140` |

الحزمة لا تحتوي على أيقونة قائمة المهارة القديمة؛ تلك الأيقونة واجهة للمنصة
وليست أصلًا من هوية EF. هذا المرجع يوثق المصادر المقدمة ولا يمنح اعتمادًا
مؤسسيًا أو شهادة إتاحة أو جودة طباعة شاملة.
