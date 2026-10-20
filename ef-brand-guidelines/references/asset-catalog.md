# فهرس الأصول المتاحة

الفهرس: [الشعارات](#logos) · [الرسوم](#graphics) · [خلفيات العروض](#backgrounds) ·
[الخطوط](#fonts) · [الأصول الناقصة](#availability).

المسارات المكتوبة نسبية إلى جذر `ef-brand-guidelines`. معرفات EF الواردة أدناه
معرفات فهرسة لهذه الحزمة، وليست أرقامًا رسمية صادرة عن الصندوق. جميع ملفات
الإنتاج الـ24 محفوظة بمحتواها الأصلي؛ إعادة التنظيم تخص المسارات فقط.
صور شرح الدليل موجودة في [فهرس المصادر](sources.md#coverage) وتُفتح عند الحاجة.

## Logos

| المعرف | الملف الفعلي | النوع وviewBox | الاختيار بحسب السياق |
| --- | --- | --- | --- |
| `EF-LOGO-KSA-BLUE` | [assets/logos/ef-logo-primary-horizontal-ksa-blue.svg](../assets/logos/ef-logo-primary-horizontal-ksa-blue.svg) | Vector SVG; `0 0 442.82 158.36` | أفقي أزرق مع سطر المملكة العربية السعودية؛ مناسب لسياق رسمي على سطح فاتح |
| `EF-LOGO-HORIZONTAL-BLUE` | [assets/logos/ef-logo-horizontal-blue.svg](../assets/logos/ef-logo-horizontal-blue.svg) | Vector SVG; `0 0 487.12 162.46` | أفقي أزرق عادي؛ سطح فاتح واضح |
| `EF-LOGO-HORIZONTAL-WHITE` | [assets/logos/ef-logo-horizontal-white.svg](../assets/logos/ef-logo-horizontal-white.svg) | Vector SVG; `0 0 300 64` | أفقي أبيض شفاف؛ يحتاج خلفية متباينة داكنة |
| `EF-LOGO-SYMBOL-WHITE` | [assets/logos/ef-logo-symbol-white.svg](../assets/logos/ef-logo-symbol-white.svg) | Vector SVG; `0 0 86 86` | رمز أبيض مستقل؛ لصورة الحساب أو موضع يناسب الرمز وحده |

هذه توصيات اختيار، وليست إلزامًا بتوزيع النسخ على أنواع مستندات محددة.
الشعاران الأزرقان يحتويان اللون المرصود `#283477`؛ يُحفظ كما هو.
قواعد الموضع والحجم والتباين في [Logo](brand-rules.md#logo).
لا تستخدم أبعاد viewBox بدل ارتفاع الرمز المرئي عند حساب المساحة الآمنة؛
الفراغ الداخلي مختلف بين الملفات. افحص النسخة البيضاء فوق خلفية داكنة.

## Graphics

| المعرف | الملف الفعلي | حقيقة الملف وحدوده |
| --- | --- | --- |
| `EF-RADIAL-MASTER` | [assets/graphics/ef-radial-master.svg](../assets/graphics/ef-radial-master.svg) | SVG متجه مع تدرجاته الأصلية؛ viewBox: 0 0 409 414 |
| `EF-RADIAL-CROP-BLUE` | [assets/graphics/ef-radial-crop-blue.svg](../assets/graphics/ef-radial-crop-blue.svg) | PNG شفاف 4096×1900 داخل SVG؛ viewBox: 0 0 2607 2746؛ صورة شعاعية مقصوصة |
| `EF-RADIAL-CROP-BLUE-GREEN` | [assets/graphics/ef-radial-crop-blue-green.svg](../assets/graphics/ef-radial-crop-blue-green.svg) | PNG شفاف 4096×1906 داخل SVG؛ viewBox: 0 0 5151 4985؛ صورة شعاعية مقصوصة |

القصتان الشعاعيتان كانتا تحملان اسم pattern في الحزمة السابقة؛ أُعيدت تسميتهما
هنا لوصف محتواهما، دون تغيير البايتات. غلاف SVG يضبط القص والتحويل؛ استخراج
PNG الداخلي وحده قد يغيّر المظهر. لا تعد بتكبير غير محدود أو تلوين متجه لهما.
النمط الهندسي المتكرر الظاهر في الدليل **غير متاح كأصل مستقل**.
المعالجة والتكوين في [Graphics and imagery](brand-rules.md#graphics-and-imagery).

## Backgrounds

### Presentation backgrounds

التصنيف: **خلفيات عروض تقديمية**، محفوظة في `assets/backgrounds/presentations/`.
الاستخدامات التالية توصيات تصميمية بحسب التكوين، وليست قواعد رسمية إضافية
أو تخصيصًا إلزاميًا لكل خلفية:

| الاستخدام المقترح | معرفات الخلفيات | ما يراعى عند الاختيار |
| --- | --- | --- |
| غلاف، فاصل قسم، ختام أو عنوان قصير | EF-BG-01، EF-BG-02، EF-BG-07، EF-BG-08، EF-BG-09 | ضع النص في المساحة الهادئة وافحص التباين |
| محتوى مختصر على خلفية فاتحة | EF-BG-03، EF-BG-06 | افحص موضع النص وتداخل العنصر الشعاعي |
| شريحة بصرية قليلة النص | EF-BG-04، EF-BG-05 | التكوين كثيف؛ استخدم نصًا محدودًا |

للجداول والرسوم والنصوص الكثيفة، تفضَّل خلفية بيضاء أو هادئة مع استخدام محدود
لعناصر الهوية. تختار مهارة العروض الخلفية وتبني تخطيط الشريحة ومحتواها القابل
للتحرير. تُصمم تطبيقات Word والويب والجوال بتكوين يناسب أبعادها ومحتواها، ولا
تُعمم عليها خلفيات العروض تلقائيًا.

| المعرف | الملف الفعلي | الأبعاد بالبكسل | التكوين المرصود واستخدامه المحتمل |
| --- | --- | --- | --- |
| `EF-BG-01` | [assets/backgrounds/presentations/ef-ppt-bg-01-green-blue-radial-left.jpg](../assets/backgrounds/presentations/ef-ppt-bg-01-green-blue-radial-left.jpg) | 2047×1152 | أخضر مع عنصر شعاعي أزرق/أخضر يسارًا؛ اليمين أهدأ للمحتوى |
| `EF-BG-02` | [assets/backgrounds/presentations/ef-ppt-bg-02-brown-cream-radial-bottom.jpg](../assets/backgrounds/presentations/ef-ppt-bg-02-brown-cream-radial-bottom.jpg) | 2047×1152 | بني مع عنصر كريمي أسفل؛ يناسب محتوى قليلًا مع فحص التباين |
| `EF-BG-03` | [assets/backgrounds/presentations/ef-ppt-bg-03-warm-white-radial-corners.jpg](../assets/backgrounds/presentations/ef-ppt-bg-03-warm-white-radial-corners.jpg) | 2047×1151 | فاتح دافئ وعناصر عند الجانبين؛ وسط مفتوح |
| `EF-BG-04` | [assets/backgrounds/presentations/ef-ppt-bg-04-blue-white-geometric-crop.jpg](../assets/backgrounds/presentations/ef-ppt-bg-04-blue-white-geometric-crop.jpg) | 2047×1152 | أزرق وأبيض مع قص هندسي كبير؛ مساحة هادئة محدودة |
| `EF-BG-05` | [assets/backgrounds/presentations/ef-ppt-bg-05-white-blue-geometric-crop.jpg](../assets/backgrounds/presentations/ef-ppt-bg-05-white-blue-geometric-crop.jpg) | 2047×1152 | أبيض وأزرق مع قص هندسي؛ افحص موضع النص قبل الاختيار |
| `EF-BG-06` | [assets/backgrounds/presentations/ef-ppt-bg-06-white-soft-radial-top-left.jpg](../assets/backgrounds/presentations/ef-ppt-bg-06-white-soft-radial-top-left.jpg) | 2047×1151 | أبيض بعنصر شعاعي كبير وخافت يمتد من الأسفل عبر الوسط؛ افحص موضع النص ولا تعتمد وصف الموضع في الاسم |
| `EF-BG-07` | [assets/backgrounds/presentations/ef-ppt-bg-07-navy-radial-bottom-left.jpg](../assets/backgrounds/presentations/ef-ppt-bg-07-navy-radial-bottom-left.jpg) | 2047×1152 | أزرق وعنصر خافت أسفل اليسار؛ كلمة navy في الاسم تاريخية |
| `EF-BG-08` | [assets/backgrounds/presentations/ef-ppt-bg-08-bright-blue-radial-top-left.jpg](../assets/backgrounds/presentations/ef-ppt-bg-08-bright-blue-radial-top-left.jpg) | 2047×1152 | أزرق ساطع وعنصر واضح أعلى اليسار؛ أبعد النص عن الجزء النشط |
| `EF-BG-09` | [assets/backgrounds/presentations/ef-ppt-bg-09-navy-radial-left.jpg](../assets/backgrounds/presentations/ef-ppt-bg-09-navy-radial-left.jpg) | 2047×1152 | أزرق وعنصر واضح يسارًا؛ كلمة navy في الاسم تاريخية |

الخلفيات JPEG بنسبة قريبة من 16:9، وليست جميعها 1920×1080 ولا ماستر PowerPoint.
حافظ على النسبة وافحص الاقتصاص والمحتوى في المقاس النهائي. الأسماء لا تحدد
قيم اللوحة اللونية؛ يُرجع إلى [Color](brand-rules.md#color).

## Fonts

العائلة الأساسية Aktiv Grotesk. البيانات التالية مقروءة من ملفات OpenType
المنقولة؛ `usWeightClass` قيمة فعلية، وليس وزنًا مستنتجًا من اسم الملف.

| المعرف / الوجه | الملف | الوزن الفعلي | Legacy family / style | PostScript name |
| --- | --- | --- | --- | --- |
| `EF-FONT-HAIR` / Hair | [assets/fonts/aktiv-grotesk-hair.otf](../assets/fonts/aktiv-grotesk-hair.otf) | 250 | `Aktiv Grotesk Hair` / `Regular` | `AktivGrotesk-Hair` |
| `EF-FONT-THIN` / Thin | [assets/fonts/aktiv-grotesk-thin.otf](../assets/fonts/aktiv-grotesk-thin.otf) | 275 | `Aktiv Grotesk Thin` / `Regular` | `AktivGrotesk-Thin` |
| `EF-FONT-REGULAR` / Regular | [assets/fonts/aktiv-grotesk-regular.otf](../assets/fonts/aktiv-grotesk-regular.otf) | 400 | `Aktiv Grotesk` / `Regular` | `AktivGrotesk-Regular` |
| `EF-FONT-MEDIUM` / Medium | [assets/fonts/aktiv-grotesk-medium.otf](../assets/fonts/aktiv-grotesk-medium.otf) | 500 | `Aktiv Grotesk Medium` / `Regular` | `AktivGrotesk-Medium` |
| `EF-FONT-SEMIBOLD` / SemiBold | [assets/fonts/aktiv-grotesk-semibold.otf](../assets/fonts/aktiv-grotesk-semibold.otf) | 600 | `Aktiv Grotesk SemiBold` / `Regular` | `AktivGrotesk-SemiBold` |
| `EF-FONT-BOLD` / Bold | [assets/fonts/aktiv-grotesk-bold.otf](../assets/fonts/aktiv-grotesk-bold.otf) | 700 | `Aktiv Grotesk` / `Bold` | `AktivGrotesk-Bold` |
| `EF-FONT-XBOLD` / XBold | [assets/fonts/aktiv-grotesk-xbold.otf](../assets/fonts/aktiv-grotesk-xbold.otf) | 800 | `Aktiv Grotesk XBold` / `Regular` | `AktivGrotesk-XBold` |
| `EF-FONT-BLACK` / Black | [assets/fonts/aktiv-grotesk-black.otf](../assets/fonts/aktiv-grotesk-black.otf) | 900 | `Aktiv Grotesk Black` / `Regular` | `AktivGrotesk-Black` |

عند وجود typographic names (name IDs 16/17) فهي تصف العائلة/الوجه؛ وإلا تستخدم
legacy names (1/2). مثال: Medium له legacy style باسم Regular، لكنه وجه Medium
ووزنه 500. Hair وThin وزنهما 250 و275؛ لا تغيرهما إلى 100 و200 تلقائيًا.

تتضمن الملفات تغطية عربية وجداول تشكيل، لكن صحة كل نص ومحرك إخراج تُختبر في
المهمة نفسها؛ وجود الحروف لا يضمن تشكيل كل تركيب أو سلامة كل تصدير.
التسلسل البصري وLight غير المتاح والخط الثانوي وسياق الترخيص في
[Typography](brand-rules.md#typography). لا تحل الخطوط الفرعية المضمنة في PDF
محل ملف خط كامل مفقود، ولا تثبت صلاحية استضافة أو توزيع غير موثقة.

## Availability

المتوفر للإنتاج: 4 شعارات، 8 خطوط OTF، 3 عناصر شعاعية، 9 خلفيات.
الصور المرجعية الـ101 توضح الدليل، وتبقى منفصلة عن أصول الإنتاج.

| المطلوب | حالة التوفر |
| --- | --- |
| الشعارات العمودية والأسود والمعدني والإدارات والرمز الأزرق المستقل | تظهر أمثلة لها؛ الملفات المستقلة غير مرفقة |
| النمط الهندسي المتكرر | مثال مرئي؛ لا توجد بلاطة أصلية مستقلة جاهزة للتكرار |
| مكتبة الأيقونات والرسوم التوضيحية والصور الفوتوغرافية | أمثلة مرجعية؛ لا توجد مكتبات أصول مستقلة |
| Aktiv Grotesk Light، Tahoma، WOFF/WOFF2 | غير مرفقة |
| PowerPoint master وWord templates | غير مرفقة؛ إنشاء ملف متوافق جديد لا يجعله القالب الأصلي |
| ملفات Illustrator/InDesign ومخططات التصنيع | غير مرفقة |
| مكتبة Figma والمكونات وأيقونات التطبيقات الجاهزة للتصدير | غير مرفقة |

عند الحاجة إلى أصل غير متوفر، حدد أثر النقص واختر حلًا ملائمًا لموجز المشروع
مع وصفه بوضوح؛ لا تعِد رسم شعار مفقود تلقائيًا ولا تسمِّ البديل أصلًا رسميًا.
الشعارات والصور الموجودة في صور الدليل تشمل أمثلة شركاء ونماذج بيانات؛
لا تستخرجها وتقدمها على أنها حزمة أصول إنتاج موثقة جديدة.
