# التوجيه والصلاحيات في React

اقرأ عند إضافة routes أو حماية صفحات أو تصميم URL state أو 404/أخطاء route. الأمثلة لـReact
Router v8 (صدر يونيو 2026): أُزيلت حزمة `react-router-dom`؛ استورد DOM APIs من
`react-router/dom` والباقي من `react-router`. تحقق من الإصدار والوضع المستخدم (declarative أو
data أو framework) قبل النسخ؛ TanStack Router بديل جيد للأنواع الصارمة بقرار موثق.

## اختر الوضع

- **Data mode** (`createBrowserRouter` + `RouterProvider`) للتطبيقات الجديدة: lazy routes، ErrorBoundary
  لكل route، loaders/actions، `useBlocker`.
- **Declarative** (`<BrowserRouter>`) لمشروع قائم بسيط؛ لا ترحّل بلا حاجة.
- **Framework mode** (SSR/Vite plugin) يعني runtime Node؛ راجع مرجع rendering قبل اختياره على IIS.

مع TanStack Query: router للتنقل وprefetch، وQuery للـcache والـfreshness. إذا استخدمت loaders
فاجعلها تستدعي `queryClient.ensureQueryData(options)` لا fetch مستقلًا يكرر الـcache.

## هيكل routes

- layout route للـshell (header، nav، `<Outlet/>`) وحد خطأ عام، ثم ErrorBoundary لكل route ميزة حتى
  لا تسقط الشاشة الواحدة التنقل كله.
- كل ميزة كبيرة lazy route (`lazy: async () => ({ Component })`) لتقسيم الحزمة؛ لا lazy لمكونات صغيرة
  تُعرض دائمًا (waterfall بلا فائدة).
- route `*` لـ404 داخل الـlayout، بنص وروابط مفيدة.
- **params مدخلات غير موثوقة:** تحقق من الشكل (GUID، رقم) قبل وضعها في query key أو API؛ اعرض 404
  لقيمة غير صالحة بدل طلب فاشل.
- `key={id}` على صفحة التفاصيل عند الانتقال من مورد لآخر في نفس route لإعادة ضبط الحالة المحلية.

## الصلاحيات في الواجهة

**القاعدة: الواجهة تُخفي، والخادم يقرر.** إخفاء route أو زر لا يمنع طلب API مباشرًا.

- مصدر الصلاحيات: endpoint جلسة (`/api/session` أو `/bff/user`) يعيد المستخدم والصلاحيات العامة،
  و`allowedActions` لكل مورد في DTO التفاصيل (صلاحية على المورد لا الدور فقط).
- عرّف متطلب كل route في الإعداد (`handle: { permission: 'requests.create' }`) واعرض صفحة "لا تملك
  صلاحية" مفهومة بدل إعادة توجيه إلى login (حلقة 403 → login → 403).
- 401 = غير مسجل: إعادة توجيه إلى تسجيل الدخول مع `returnUrl` **نسبي من نفس الأصل** يتحقق منه الخادم.
- 403 و404 لمورد: اتبع سياسة الخادم في عدم كشف الوجود؛ اعرض نفس الرسالة إذا كان الخادم يوحدهما.
- تغير الصلاحيات أثناء الجلسة: أبطل query الجلسة عند 403 غير متوقع، ولا تخزن الصلاحيات في
  localStorage كمرجع.

## URL كحالة

- ما يجب أن ينجو من reload ويُشارك برابط (فلاتر، صفحة، ترتيب، تبويب) في search params.
- parse بـschema (zod) مع defaults؛ قيمة غير صالحة تُستبدل بالافتراضي لا تكسر الصفحة.
- `replace` لتغييرات الكتابة المتتابعة (بحث أثناء الكتابة) و`push` لتغييرات يتوقع المستخدم الرجوع
  عنها بزر الرجوع.
- صفّر الصفحة عند تغيير الفلتر. طبّع الترتيب لتجنب روابط مكررة المعنى.
- لا تضع بيانات حساسة أو PII في URL (تُسجل في الـproxy والسجلات والـhistory).

## التنقل والإتاحة

التنقل داخل SPA لا يعلن الصفحة الجديدة ولا ينقل focus. انقل focus إلى `<main tabIndex={-1}>` أو
عنوان الصفحة عند تغير pathname (لا عند تغير الفلاتر)، وحدّث `document.title`، ووفر skip link.
فعّل scroll restoration المناسبة.

## التغييرات غير المحفوظة

`useBlocker` مع dialog قابل للوصول (native `<dialog>` بـ`showModal()` يوفر حصر focus وEsc). اسمح
بالتنقل بعد الحفظ عبر ref يضبطه handler النجاح. التفاصيل في مرجع النماذج.

## الاستضافة

fallback إلى `index.html` لمسارات التطبيق فقط؛ ليس لـ`/api` أو `/hubs` أو assets مفقودة. اضبط
`base` في Vite عند النشر تحت مسار فرعي في IIS، واختبر reload لمسار عميق بعد النشر.

## اختبر

param غير صالح → 404 دون طلب، route بلا صلاحية → رسالة لا حلقة، reload لرابط فلتر يعيد نفس النتائج،
back/forward، focus بعد التنقل، lazy route يفشل تحميل chunk (نشر جديد) → ErrorBoundary مع إعادة تحميل.

## المصادر

- [Upgrading from v7](https://reactrouter.com/upgrading/v7)
- [React Router modes](https://reactrouter.com/start/modes)
