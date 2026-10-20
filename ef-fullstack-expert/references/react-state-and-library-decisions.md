# قرارات الحالة والمكتبات وdefaults صندوق البيئة

اقرأ عند بدء مشروع React جديد، أو إضافة مكتبة، أو خلاف فريق على أداة. الهدف قرار افتراضي
واحد يقلل انحراف الأنماط بين الميزات، مع شروط صريحة للخروج عنه. الإصدارات تتغير: تحقق من
أحدث مستقر والترخيص والتوافق وقت القرار، وسجّل التاريخ والمصدر في ADR.

## صنّف الحالة قبل اختيار أداة

| نوع الحالة | الأداة الافتراضية | لا تستخدم |
| --- | --- | --- |
| UI محلية (فتح، تبويب، hover) | useState/useReducer في أقرب مالك | store عام |
| مشتقة | حساب أثناء render، `useMemo` بعد قياس | state ثانية + effect للمزامنة |
| مشاركة قابلة للرابط (فلتر، صفحة، ترتيب، تبويب) | URL search params مع parse/validate | state يضيع عند reload |
| بيانات الخادم | TanStack Query (أو loader framework) | Redux/Zustand نسخة من API |
| مسودة نموذج | React Hook Form | global store |
| عامة للعميل قليلة التغير (لغة، ثيم، session snapshot) | Context بقيمة مستقرة | Context لقيمة تتغير كثيرًا لشجرة كبيرة |
| عامة للعميل كثيرة التغير أو مشتركة بين أجزاء بعيدة | Zustand مع selectors | Context واحد كبير |
| آلة حالات معقدة (wizard، رفع ملفات متعدد المراحل) | useReducer بـdiscriminated union؛ XState عند تعقيد مثبت | booleans متناقضة |

## مفاضلات متكررة

**Context مقابل Zustand مقابل Redux Toolkit**
- Context ليس state manager: كل مستهلك يعيد render عند تغير القيمة. مناسب لحقن تبعيات وقيم
  نادرة التغير. قسّمه حسب معدل التغير، وثبّت القيمة.
- Zustand: store صغير خارج React، selectors تمنع renders زائدة، بلا boilerplate. مناسب لحالة عميل
  مشتركة حقيقية (لوحة تحكم بفلاتر مشتركة غير قابلة للرابط، محرر مركب).
- Redux Toolkit: يستحق عندما يوجد فريق كبير يحتاج نمط أحداث صارم وDevTools وmiddleware، أو تطبيق
  قائم عليه. RTK Query بديل مقبول لـTanStack Query داخل مشروع Redux قائم؛ لا تجمع الاثنين.
- **معظم تطبيقات الصندوق الداخلية لا تحتاج Redux:** بعد نقل بيانات الخادم إلى Query والفلاتر إلى URL
  يتبقى القليل.

**useEffect fetching مقابل TanStack Query:** effect الجلب يعيد اختراع cache وdedup وإلغاء وسباقات
وretry وinvalidation. استخدمه فقط لطلب وحيد في صفحة بسيطة بلا cache، مع AbortController وحارس سباق.

**fetch مقابل Axios:** fetch كافٍ مع غلاف صغير مثل `http.ts` في المثال الذهبي (timeout بـ`AbortSignal.any`،
فحص content-type، ProblemDetails). Axios يضيف interceptors وupload progress؛ مقبول إذا كان قائمًا أو تحتاج
progress للرفع. لا تضع منطق refresh token في interceptor مع BFF/cookies؛ ومع tokens اجعل التجديد
single-flight (وعد واحد مشترك) لا طلب تجديد لكل 401 متوازٍ.

**React Hook Form مقابل نماذج يدوية:** RHF لأي نموذج فيه أكثر من حقول قليلة أو field arrays أو أخطاء
خادم. نموذج بحقل أو اثنين: state بسيطة أو form actions في React 19 عند ملاءمتها.

**zod مقابل بدائل:** zod لتحقق الحدود والنماذج بنفس schema. حجمه يدخل الحزمة الأولية؛ إذا ضاقت
الميزانية قِس `zod/mini` أو valibot. لا تكتب schema مرتين لنفس العقد.

**مكتبة UI:**

| الخيار | يناسب | الكلفة |
| --- | --- | --- |
| Radix/React Aria + Tailwind أو CSS Modules (نمط shadcn) | هوية EF مخصصة، تحكم كامل، RTL منطقي | تبني نظام التصميم وتملكه |
| MUI | لوحات إدارية كثيفة سريعًا، DataGrid جاهز | تخصيص الهوية أصعب؛ RTL يحتاج cache خاصًا لـemotion مع stylis RTL؛ تراخيص مكونات Pro/Premium |
| Ant Design | واجهات بيانات كثيفة وعربية جاهزة | هوية افتراضية قوية يصعب الابتعاد عنها؛ حجم |
| مكونات EF قائمة | أي مشروع يملك نظام تصميم معتمدًا | — |

**TanStack Table مقابل MUI DataGrid/AG Grid:** TanStack headless: تملك الـmarkup والإتاحة والهوية؛
مناسب لنظام تصميم EF. DataGrid/AG Grid: ميزات جاهزة (pinning، grouping، Excel) مقابل ترخيص وهوية
مفروضة. قرر حسب الميزات المطلوبة فعلًا لا الممكنة.

**SPA مقابل SSR:** الأنظمة الداخلية خلف تسجيل الدخول على IIS: SPA (Vite) خلف ASP.NET Core BFF
افتراضيًا. SSR/Next.js عندما يوجد محتوى عام يحتاج SEO أو أداء أول عرض لزوار مجهولين، مع
قبول runtime Node وتشغيله.

## Default stack مقترح لتطبيقات EF الداخلية الجديدة

اعتمده بوصفه ADR، وتحقق من الإصدارات قبل البدء:

- Vite + React + TypeScript strict، و`noUncheckedIndexedAccess`.
- ASP.NET Core BFF بـcookie HttpOnly وantiforgery؛ لا tokens في JavaScript.
- React Router (data mode) أو TanStack Router بقرار موثق؛ لا الاثنين.
- TanStack Query لحالة الخادم، وURL للحالة القابلة للمشاركة، وZustand فقط عند حاجة مثبتة.
- React Hook Form + zod، وعميل مولّد من OpenAPI مع adapter خارجه (راجع مرجع TypeScript).
- Radix أو React Aria primitives + نظام تصميم EF بـtokens، وlogical properties للـRTL.
- i18next أو FormatJS (راجع مرجع العربية).
- Vitest + Testing Library + MSW، وPlaywright مع axe للرحلات.
- ESLint (typed + react-hooks) وdependency-cruiser للحدود، وميزانية JS أولي في CI.
- OpenTelemetry web أو أداة الرصد المعتمدة مع traceId من ProblemDetails.

**شروط الخروج:** مشروع قائم بأدوات مختلفة (احترمها)؛ ترخيص أو سياسة أمنية تمنع أداة؛ حاجة مثبتة
لميزة لا يوفرها الخيار؛ فريق لا يستطيع صيانته. اذكر الشرط في ADR.

## قبل إضافة أي مكتبة

أجب كتابيًا: ما الحاجة التي لا يغطيها الموجود؟ ما الحجم المضاف للحزمة الأولية (قِسه)؟ هل تدعم
React والـbundler الحاليين؟ آخر إصدار ونشاط الصيانة؟ الترخيص للاستخدام الحكومي؟ كيف نخرج منها؟
