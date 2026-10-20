# تشخيص أداء React عمليًا

اقرأ مع مرجع أداء الواجهة والتحقق عند بطء تفاعل أو تحميل أو ذاكرة. المنهج: قِس، حدد عنق الزجاجة،
أصلح السبب، أعد القياس بنفس الظروف. لا memo ولا virtualization ولا تقسيم قبل دليل.

## حدد نوع البطء أولًا

| العرض | القياس | المشتبه الأول |
| --- | --- | --- |
| فتح الصفحة بطيء | Network waterfall، Coverage، حجم JS الأولي | حزمة كبيرة، طلبات متسلسلة، API بطيء |
| الكتابة في حقل متقطعة (INP سيء) | Performance panel أثناء الكتابة، React Profiler | re-render لشجرة كبيرة، حساب ثقيل متزامن |
| التمرير في قائمة بطيء | Performance panel، عدد عقد DOM | آلاف الصفوف، خلايا مكلفة |
| الصفحة تبطؤ مع الوقت | Memory heap snapshots متتالية | listeners/timers/subscriptions لا تُنظف، cache بلا حد |
| شاشة "تومض" أو تقفز | Layout Shift regions، CLS | أبعاد صور غائبة، محتوى يُحقن فوق المحتوى |

اختبر بـproduction build (لا dev وStrictMode) وبجهاز ممثل لأجهزة الموظفين وتقييد CPU في DevTools.

## React Profiler خطوة بخطوة

1. سجّل التفاعل البطيء فقط. 2. رتّب commits حسب المدة. 3. لكل commit مكلف: أي المكونات رُسمت ولماذا
("Why did this render" في الإعدادات). 4. صنّف السبب:

| السبب | العلاج |
| --- | --- |
| state في مكان أعلى من اللازم | انقلها إلى أقرب مالك (colocation) |
| Context بقيمة متغيرة يستهلكها الكثير | قسّم الـcontext، ثبّت القيمة، أو store مع selectors |
| props بمراجع جديدة كل render لمكون `memo` | ثبّت المراجع، أو أزل memo إن لم يفد |
| قائمة كبيرة تعاد كلها لتغير عنصر | مكون صف مستقل + مفتاح ثابت + memo للصف |
| حساب ثقيل في render | خوارزمية أفضل، `useMemo` مقاسًا، أو Worker لحساب مستقل |
| تحديث عاجل يحجب العرض غير العاجل | `useTransition`/`useDeferredValue` للعرض غير العاجل (لا يلغي الطلبات) |

**React Compiler** (مستقر منذ 2025) يضيف memoization تلقائيًا للكود الذي يحترم قواعد React؛ فعّله بقرار
وقياس، وراقب قواعد eslint-plugin-react-hooks التي تكشف ما يمنعه. لا تفترض تفعيله لمجرد الإصدار.

## الحزمة والتحميل

- حلّل ما في الـentry chunk (source map أو visualizer). في المثال الذهبي: react-dom ثم zod ثم react-router ثم
  SignalR؛ تحميل SignalR كسولًا خفّض JS الأولي من 148 إلى 130 KB gzip.
- lazy route لكل ميزة؛ لا lazy لمكونات صغيرة تظهر فورًا.
- طلبات متسلسلة: ابدأ المستقل منها معًا (loader أو prefetch)؛ اجمع بيانات الشاشة في endpoint واحد عندما
  يكون الـround-trip هو الكلفة.
- خطوط عربية: subset وwoff2 و`font-display` مدروس وpreload للخط الأساسي فقط.
- صور: أبعاد صريحة، `loading="lazy"` لما تحت الطية، صيغ حديثة.

## الذاكرة والتسربات

- خذ heap snapshot، كرر الإجراء (فتح وإغلاق الشاشة) 5–10 مرات، خذ snapshot آخر، وقارن ما ينمو. ابحث عن
  عقد DOM منفصلة (Detached) ومستمعين.
- الأسباب الشائعة: listeners على window بلا إزالة، `setInterval` بلا cleanup، اشتراكات realtime لا تلغى،
  closures تمسك بيانات كبيرة، cache يدوي بلا حد، infinite queries بلا `maxPages`.
- تحذير "update on unmounted component" أُزيل من React 18؛ غيابه لا يعني عدم وجود تسرب.

## الشبكة والخادم

بطء "الواجهة" كثيرًا ما يكون API: افتح Server-Timing أو traces الخادم بالـtraceId. لا تعالج استعلامًا بطيئًا
بتقسيم الحزمة أو بـuseMemo.

## سجّل الدليل

السيناريو، والجهاز وتقييد CPU والشبكة، والإصدار، والقياس قبل/بعد (median لعدة تشغيلات)، وما لم يُقس.
