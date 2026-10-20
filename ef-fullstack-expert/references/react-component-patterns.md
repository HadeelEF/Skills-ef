# أنماط تصميم المكونات ونظام التصميم

اقرأ عند بناء مكون مشترك أو مكتبة مكونات أو مراجعة API مكون. القاعدة: أبسط نمط يحل المشكلة
الحالية؛ كل نمط هنا يصبح تعقيدًا إذا استُخدم بلا حاجة.

## سلّم الاختيار

1. **children وprops بسيطة.** معظم المكونات.
2. **slots** (props تقبل `ReactNode`: `header`, `actions`) عندما تختلف أجزاء ثابتة الموضع.
3. **compound components** (`<Tabs><Tabs.List/><Tabs.Panel/></Tabs>`) عندما تشترك أجزاء متعددة في حالة
   ويحتاج المستهلك ترتيبها بحرية. حالة مشتركة عبر context داخلي، وخطأ واضح عند استخدام جزء خارج أبيه.
4. **headless hook أو primitive** (Radix، React Aria، Downshift) لعناصر تفاعلية معقدة: combobox، menu،
   dialog، date picker، tabs. لا تبنِ combobox من الصفر؛ أنماط ARIA ولوحة المفاتيح فيه واسعة.
5. **render props** لحالات يحتاج فيها المستهلك قيمًا من المكون لرسم الأجزاء (virtualizer، drag)، أو slot
   يحتاج حالة (`renderGuard(isDirty)` في المثال الذهبي). hook غالبًا بديل أبسط.
6. **HOC** للكود القديم أو تغليف عرضي لمكتبات طرف ثالث؛ لا تستخدمه في كود جديد: يخفي props ويصعّب الأنواع.

## عقد controlled/uncontrolled

اتبع اصطلاح العناصر الأصلية: `value` + `onValueChange` للتحكم، و`defaultValue` لغير المتحكم، ولا
تقبل الاثنين معًا. نفّذ ذلك بـhook واحد (`useControllableState`) لا بمنطقين. سمّ callback بالحدث
الدلالي (`onValueChange`, `onOpenChange`) لا بالتفاصيل (`onClickItem`).

## variants وtokens

- tokens (لون، مسافة، خط، نصف قطر، ظل) كمتغيرات CSS من نظام تصميم EF؛ المكونات تستهلك tokens دلالية
  (`--color-danger`) لا قيمًا خامًا.
- variants محدودة ومسماة (`variant: 'primary' | 'secondary' | 'danger'`, `size`)، عبر data attributes أو
  أداة مثل cva؛ لا 20 prop منطقية تتصادم.
- `className` نقطة امتداد واحدة للتخطيط الخارجي (margin/موضع) لا لإعادة تصميم المكون من الداخل.
- الثيم الداكن: tokens بقيمتين وتبديل على `<html data-theme>` مع احترام `prefers-color-scheme`؛ امنع
  وميض الثيم عند التحميل بقراءة التفضيل قبل أول رسم. افحص التباين في الثيمين.

## Portals وطبقات العرض

- الأحداث في portal تنتشر عبر **شجرة React** لا شجرة DOM: نقرة داخل modal في portal تصل إلى `onClick`
  للمكون الأب في React. أوقفها عمدًا عند الحاجة.
- **RTL:** portal إلى `body` يخرج من حاوية عليها `dir="rtl"` فيفقد الاتجاه. ضع `dir` على `<html>`، أو مرره
  للـportal، أو استخدم `DirectionProvider` في Radix.
- استخدم primitive للـdialog/popover يدير focus والطبقات وإغلاق Esc والنقر خارجًا؛ native `<dialog>` مع
  `showModal()` خيار جيد للحالات البسيطة.

## Providers

قسّم context حسب معدل التغير والمسؤولية، وثبّت `value` (useMemo أو قيم مستقرة)؛ قيمة كائن جديدة في كل
render تعيد render كل المستهلكين. لا تجعل provider عامًا لحالة تخص شاشة واحدة. حقن التبعيات (عميل
API) عبر context مناسب للاختبار (المثال الذهبي `RequestsApiProvider`).

## Error Boundaries

ما زالت class component (`getDerivedStateFromError` و`componentDidCatch`) أو مكتبة `react-error-boundary`
مع `resetKeys`. ضعها حول route أو widget مستقل، لا حول كل مكون.

## نظام التصميم كمنتج

حزمة أو مجلد بإصدار وchangelog، ومكونات بأمثلة حالات (Storybook أو صفحة harness موجودة)، واختبارات
تفاعل وإتاحة، وvisual regression للمكونات الأساسية، ودعم RTL/LTR كحالة اختبار أساسية. تغيير token
مشترك يُراجع أثره على كل المكونات.

## علامات التعقيد الزائد

مكون عام بأكثر من ~10 props منطقية؛ مكون "Universal" يرسم جداول ونماذج وبطاقات؛ context لكل مكون؛ HOC
فوق HOC؛ abstraction لاستخدام واحد. أعد التقسيم إلى مكونات أصغر بتركيب.
