# ترحيل React القديم تدريجيًا

اقرأ عند العمل على مشروع فيه class components أو Redux القديم أو React Router قديم أو React قبل 18،
أو عند طلب خطة تحديث. القاعدة كما في الخادم: لا rewrite شامل؛ characterization ثم ترحيل مسار بمسار
مع إبقاء النظام يعمل.

## ابدأ بالجرد والقياس

- إصدارات react وreact-dom وrouter وstate library وbuild tool (CRA؟ webpack؟) وTypeScript.
- عدد class components، واستخدام lifecycle methods، وlegacy context (`contextTypes`)، و`findDOMNode`،
  و string refs، وHOCs، و`componentWillMount/ReceiveProps/Update` (UNSAFE_).
- اختبارات موجودة وتغطيتها للرحلات الحرجة، وأخطاء الإنتاج الحالية.
- CRA متوقف عن التطوير: الانتقال إلى Vite غالبًا أول خطوة تفتح الباقي.

## ترتيب مقترح

1. **شبكة أمان:** اختبارات Playwright للرحلات الحرجة الحالية وtest characterization لسلوك يجب أن يبقى.
2. **أداة البناء:** CRA/webpack → Vite، مع نفس المخرجات والمسارات ومتغيرات البيئة (`REACT_APP_*` →
   `VITE_*` بخطة)، دون تغيير كود التطبيق.
3. **React major:** اتبع دليل الترقية بخطوات: 17 → 18 (`createRoot`، batching التلقائي، StrictMode
   يكشف effects غير النظيفة) ثم 19 (إزالة `propTypes`/`defaultProps` للدوال، و`ReactDOM.render`،
   و string refs، والـlegacy context؛ ref كخاصية). استخدم codemods الرسمية ثم راجع يدويًا.
4. **Router:** v5 → v6/v7 (`Switch` → `Routes`، `useHistory` → `useNavigate`، مسارات نسبية) ثم v8
   (الاستيراد من `react-router` و`react-router/dom` بدل `react-router-dom`). كل major بخطوة.
5. **حالة الخادم:** انقل جلب البيانات من Redux thunks/sagas إلى TanStack Query **شاشة بشاشة**؛ يبقى Redux
   لحالة العميل الحقيقية. Redux القديم → Redux Toolkit (`createSlice`، `configureStore`) بالتوازي، ثم
   `connect` → `useSelector/useDispatch` عند لمس المكون.
6. **class → function:** فقط للمكونات التي تُعدّل لسبب آخر، أو التي تمنع ترقية. لا حملة تحويل بلا قيمة.
   Error Boundaries تبقى classes.
7. **TypeScript:** `allowJs` و`checkJs` تدريجيًا، وملف بملف مع strict للملفات الجديدة.

## تحويل lifecycle بأمان

| class | function | تحذير |
| --- | --- | --- |
| `componentDidMount` + `componentWillUnmount` | `useEffect(() => { …; return cleanup }, [])` | StrictMode يشغلهما مرتين في التطوير؛ يجب أن يكون التنظيف صحيحًا |
| `componentDidUpdate(prevProps)` للجلب | query مفتاحه props | لا effect يقارن prev يدويًا |
| `getDerivedStateFromProps` | حساب أثناء render أو `key` لإعادة الضبط | نادرًا ما يلزم state |
| `shouldComponentUpdate` | `memo` بعد قياس | لا تنقله تلقائيًا |
| `this.setState(fn)` | updater function | batching مختلف في 18+ |
| instance fields | `useRef` | ref لا يسبب render |

## التعايش

- جزر React داخل صفحات Razor/jQuery: نقطة mount لكل جزيرة مع `createRoot` و`unmount` عند إزالة العنصر،
  وبيانات البدء عبر `data-*` أو JSON آمن، ولا يملك jQuery وReact نفس DOM.
- shim مؤقت بتاريخ إزالة، لا compatibility layer دائم. احذف المسار القديم عند اكتمال الترحيل.

## خطة الترحيل كوثيقة

لكل مرحلة: الهدف، والنطاق، والمخاطر، ومعيار النجاح (بوابة الجودة خضراء، لا تراجع في أخطاء الإنتاج أو
Web Vitals)، وخطة الرجوع، والمدة التقديرية بافتراضاتها. انشر خلف feature flags عند تغيير سلوك.
