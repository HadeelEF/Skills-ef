# معمارية كود React وتنفيذه

## المحتويات

- [حدود الميزة](#صمم-feature-تعمل-من-route-إلى-api)
- [تصميم الشاشة والتفاعل](#صمم-الشاشة-والتفاعل-قبل-تفكيكهما)
- [نظام المكونات](#ابن-نظام-مكونات-قابلًا-للتنفيذ)
- [اتجاه الاستيراد](#اضبط-الاستيراد-والسطح-العام)
- [عقود المكونات](#اكتب-المكون-والعقد-معًا)
- [المنطق وHooks](#نفّذ-ui-logic-وhooks-دون-تكرار-مصادر-الحقيقة)
- [الربط والتفاعل](#أكمل-المسار-البصري-والوظيفي)
- [التحقق](#تحقق-من-الكود-الذي-سيستهلكه-المشروع)

## صمم feature تعمل من route إلى API

اقرأ routing وrendering ونظام التصميم والعقد والاعتماديات الموجودة.
اختر حدود feature حسب رحلة المستخدم والمسؤولية، لا عدد الصفحات. استخدم
TypeScript في مشروع React جديد مناسب؛ احترم JavaScript القائم، ولا
تفرض ترحيلًا واسعًا أو Next.js أو state library كشرط لـClean Code.

| مسار مثال داخل `src/` | ما يملكه |
| --- | --- |
| `app/` | composition وroutes وproviders والإعداد العام وحدود أخطاء التنقل |
| `features/grants/pages/` | ربط route بالرحلة والتخطيط وحالات الوصول/التحميل |
| `features/grants/components/` | form/list/details ذات عقود props واضحة |
| `features/grants/model/` | types وسياسات تحويل/حساب خالصة وstate transitions عند الحاجة |
| `features/grants/api/` | endpoint functions وtransport DTOs وتحويل الأخطاء والعقد |
| `features/grants/hooks/` | query/mutation أو سلوك React محدد عندما يفيد استخراجه |
| `shared/ui/` | primitives عامة لا تعرف تفاصيل Grants أو API الخاصة بها |
| `shared/api/` | HTTP client مشترك صغير، عند وجود سياسة نقل مشتركة فعلًا |

هذه خريطة مسؤوليات لا قائمة ملفات إلزامية. اجمع الميزة الصغيرة بقرب
استخدامها؛ لا تنشئ hook وservice وrepository وuse-case لتمرير الاستدعاء
نفسه. ضع الاختبارات وstyles قرب المالك وفق convention المشروع.

## صمم الشاشة والتفاعل قبل تفكيكهما

حدد مهمة المستخدم وأولوية المحتوى والفعل الرئيسي ومسار التنقل، ثم ارسم
هيكل الشاشة وحالاتها. احترم التصميم المعتمد؛ عند غيابه صمم اقتراحًا
متسقًا مع المنتج والهوية. Frontend design يشمل تجربة التفاعل وشكلها
ومعمارية كودها، ولا ينتهي عند مجلدات components أو اختيار مكتبة UI.

| جزء التصميم | قرار ملكية وتنفيذ |
| --- | --- |
| route/page shell | parameters، access/loading/error، وتركيب الميزة |
| list/detail | query projection وselection وURL عندما يلزم ومصير البيانات القديمة |
| form/editor | draft وdirty/validation، وتحويل command والحفظ والتعارض |
| dialog/menu/panel | فتح/إغلاق وfocus وportal وحالة التنقل وإعادة الفتح |
| reusable component | props/slots/variants ودلالات وتفاعل دون تفاصيل API |

مثل transitions المعقدة بـreducer أو state machine عند الحاجة بدل
booleans متناقضة؛ لا تضف مكتبة لذلك تلقائيًا. صمم ما يحدث عند خطأ الحقل
أو انتهاء الجلسة أو تعارض النسخة أو نتيجة حفظ غير معلومة، مع حفظ الإدخال
ومسار تعافٍ واضح. اربط الحالات بعقد Backend لا برسائل success ثابتة.
حافظ على نص الحقل أثناء الكتابة وIME والقيم الرقمية الجزئية؛ parse/format
عند الحدود المناسبة، ولا تجعل تنسيق العرض يفقد المؤشر أو دقة المبلغ.

## ابن نظام مكونات قابلًا للتنفيذ

استخدم primitives القائمة أو native/headless patterns المناسبة مع
tokens وvariants؛ ثم ركّبها في domain components وfeature screens.
حدد أبعاد المكون وslots وكثافته وresponsive behavior، وحالات focus/
hover/invalid/pending/disabled؛ لا تجعل الشكل default للمكتبة هو التصميم.
اربط CSS بهوية المكون والـtheme دون selectors عابرة تعتمد على DOM داخلي
لمكتبة خارجية. اجعل extension points محدودة مثل className/token/slot
وفق conventions، وتجنب universal component بعشرات flags غير مترابطة.

نفّذ components بأمثلة حالات مفيدة في harness المشروع أو Storybook
إن كان قائمًا؛ لا تضف منصة توثيق كاملة لمكون بسيط. اجعل story تمثل العقد
والتفاعل الحقيقيين، ثم اختبر المكون داخل route والبيانات؛ نجاح العزل
وحده لا يثبت الدمج. للمطابقة الدقيقة اقرأ مرجع design-to-code، وراجع
نفس الحالات والمقاسات بصريًا بعد توصيل الكود الفعلي.

## اضبط الاستيراد والسطح العام

`app` يركب features؛ feature تستخدم shared أو العقد العام لميزة أخرى
عند حاجة معلنة. shared لا يعتمد على features/app، ولا تستورد ميزة
تفاصيل داخلية من أخرى أو تصنع دورات. اجعل exports محدودة، وافحص barrels
التي تخفي cycles أو تجمع server-only/client-only في bundle واحد.

لا تجعل عميل HTTP يعرف toast/router أو JSX؛ أعد error contract ويقرر
المستهلك العرض والتنقل. لا تجعل UI primitive يجلب بيانات منتج بعينه.
افصل transport DTO عن view model إذا اختلف المعنى، واستعمل نوعًا واحدًا
عندما لا يوجد فرق؛ لا تنسخ backend entities إلى frontend contracts.
اتبع framework conventions إذا كان يملك routes/loaders/server boundaries.

## اكتب المكون والعقد معًا

سمّ المكونات وفق عملها، وفضّل composition وchildren/slots البسيطة على
مكوّن عام بعشرات flags. حدد مالك `value` و`onChange` وsubmit/reset.
استخرج component عند مسؤولية/إعادة استخدام/حد تحديث حقيقي، لا لكل div.
لا تعرف مكونًا متغير الهوية داخل render؛ حافظ على keys ذات معنى.

مثال تعليمي مختصر لحالة تحميل أولي، يكيف ولا ينسخ كعقد شامل:

```ts
type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };
```

أضف idle/empty أو stale-data/refetch عندما تحتاجها التجربة؛ لا تخفِ
حالات حقيقية لإرضاء union ضيقة. افصل حالة mutation عن حالة query.
استعمل narrowing وunknown عند الحدود؛ `as ResponseDto` لا يفحص JSON.
لا تستخدم any/non-null assertion لتجاوز نوع لم يُفهم.

## نفّذ UI logic وHooks دون تكرار مصادر الحقيقة

- اشتق filtered/sorted/count/validity من المصدر حين تكون حسابًا؛ لا
  تنسخ النتائج إلى state ثم تربطها بسلسلة effects. لا تعدل props بـsort().
- ضع الحدث في handler والمزامنة الخارجية في effect. custom hook يملك
  سلوكًا مسمى بعقد وتنظيف، لا «useEverything» يخفي شاشة كاملة أو useMount
  يتجنب dependencies. helper خالصة لا تحتاج prefix use.
- اجعل search/page/sort في URL إذا كانت قابلة للمشاركة وفق المتطلب،
  مع parse/validation وback/forward. لا تضف URL state لمجرد تنظيم الملفات.
- احتفظ بمسودة النموذج مستقلة عن server snapshot؛ حدد initialization
  وdirty/reset/refetch. لا يكتب refetch فوق إدخال المستخدم بلا قرار.
- إذا جاءت البيانات من props ويغيرها الطفل، حدد مصدر الحقيقة بعد الحفظ
  وبروتوكول المصالحة مع المالك؛ تغير مرجع array لا يثبت وصول بيانات أحدث.
  لا تسمح لنسخة قديمة بإلغاء response مؤكدة لمجرد rerender؛ حدّث query
  owner أو استخدم عقد version/invalidation واضحًا يناسب المشروع.
- للمكتبة القائمة query keys وinvalidation وmutations وفق سياق الجلسة؛
  عند غيابها استخدم دورة async واضحة، لا تنشئ cache framework يدويًا.
- امنع stale updates وكرر submit وفق سياسة مفهومة؛ capture للسياق الصحيح،
  وفحص HTTP response، ومعالجة errors وcancellation في مكانها. إلغاء طلب
  كتابة من المتصفح لا يثبت أن الخادم لم ينفذه؛ صمم إعادة القراءة/التعارض.

## أكمل المسار البصري والوظيفي

صل route وproviders وimports وCSS والـAPI الفعلي. لا تسلم مجلد components
غير مستخدم أو زر حفظ يعرض toast ثابتًا. استخدم labels وsemantic HTML
وkeyboard/focus/aria المناسبة ورسائل الحقول والتجاوب وRTL/LTR وفق النطاق.
ضع tokens/variants مشتركة في نظام التصميم القائم، وحدد ملكية styles؛
لا تضع global overrides واسعة لإصلاح مكون واحد أو تجمع CSS frameworks بلا عزل.

نفّذ loading/empty/error/success وdisabled/pending ومصير المسودة بعد
فشل الحفظ أو التنقل. لا تخفِ خطأ بيانات على أنه قائمة فارغة. حافظ على
النصوص والحقوق والخطوط المعتمدة، وافصل منطق المنتج عن strings المترجمة.

## تحقق من الكود الذي سيستهلكه المشروع

افحص typecheck وlint وbuild حسب scripts الفعلية؛ تحويل TSX إلى JS
لا يثبت صحة الأنواع. اختبر الحسابات المهمة كدوال خالصة، والمكونات بسلوك
المستخدم، ورحلة API/browser عند توفر البيئة. فحص helper بـNode لا يثبت
تشغيل hook أو React DOM؛ لا تنشئ React mocks لتدّعي رحلة متصفح ناجحة.
قِس المشكلة قبل memo/lazy/virtualization، ولا تعالج API بطيئًا بتقسيم ملفات.

## مراجع رسمية

- [Thinking in React](https://react.dev/learn/thinking-in-react)
- [State structure](https://react.dev/learn/choosing-the-state-structure)
- [Effects](https://react.dev/learn/you-might-not-need-an-effect)
- [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
