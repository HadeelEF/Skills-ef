# React المتقدم مع .NET

استخدم المراجع الداخلية لمعمارية كود React وruntime/TypeScript وrendering
والتنفيذ البصري والأداء بحسب المهمة. أنجز هندسة الواجهة والتكامل مع
.NET والهوية والعقود والعمليات المترابطة دون اعتماد إلزامي على مهارة أخرى.
اقرأ الإصدار وframework/router
والـpackage manager وbuild/deployment الفعلي، دون فرض Next.js أو ترقية تلقائية.

للتفاصيل التنفيذية: حالة الخادم وقرارات المكتبات والنماذج والتوجيه والجداول وrealtime والأمان
والرصد لها مراجع مستقلة في فهرس المهارة. التنفيذ المرجعي المختبر في
`assets/examples/golden-react-feature`.

## افصل أنواع الحالة وملكيتها

| الحالة | المكان المناسب | ضابط التصميم |
| --- | --- | --- |
| حالة واجهة محلية | component أو reducer | قلل الرفع غير الضروري، واشتق بدل نسخ state |
| حالة تنقل/بحث قابلة للمشاركة | URL/router | parse/validate، history وdeep links وسلوك back |
| بيانات الخادم | query cache/loader وفق المشروع | keys وfreshness وinvalidation وعزل الجلسات |
| مسودة نموذج | form state | dirty/errors/submit، لا تكتب فوق تعديل المستخدم عند refetch |
| session/permissions | مصدر هوية موثوق مع حالة واجهة محدودة | UI gate لا يستبدل authorization في .NET |

نظم features بعقود عامة، واجعل shared components محددة. لا تضع كل
البيانات في global store، ولا تدخل Redux/Zustand/TanStack Query/RHF/Zod
جميعًا بلا حاجة. تحقق من APIs والتوافق قبل الاختيار.

## نفّذ React متوافقًا مع نموذج التنفيذ

- حافظ على purity وimmutability وstable keys؛ لا تنفذ mutation أو fetch
  أو side effect أثناء render. ضع المنطق المشتق في render أو selector.
- اجعل effects لمزامنة أنظمة خارجية، مع dependencies صحيحة وcleanup؛
  راجع stale closures وsubscriptions وStrictMode، ولا تخفِ الخطأ بإلغاء linter.
- استخدم transitions/deferred values لاستجابة الواجهة عند ملاءمتها؛
  ليست debounce أو network cancellation أو ضمان ترتيب responses.
- افحص دعم Suspense وError Boundaries في مكتبة البيانات المستخدمة؛
  errors داخل event handlers/async callbacks تحتاج معالجة صريحة أيضًا.
- استخدم React Compiler أو memoization وفق الإصدار والقياس؛ لا تضع
  useMemo/useCallback حول كل شيء. ميز hook API المستقر عن experimental.

## احمِ بيانات المستخدم عند تبديل السياق

ضمّن tenant وuser/session scope وأبعاد query المؤثرة في cache keys.
عند logout أو switch tenant ألغِ العمل الجاري ونظف أو اعزل cache
والنماذج والـoptimistic state، وعالج persisted cache/service worker إن وجدا.
لا تجعل صلاحية query key وحدها دليل السماح من الخادم.

حماية AbortController وحدها قد لا تكفي بعد completion أو مع مكتبة لا
تستهلك signal. استخدم request generation/session epoch أو guard مكافئ
قبل تطبيق النتيجة أو كتابة cache، واحجب البيانات القديمة عند render
فور تغير الهوية؛ cleanup في effect لاحق وحده قد يسمح بوميض بيانات سابقة.

للتحديث المتفائل حدد snapshot وrollback وmutation identity؛ لا تدع
rollback قديمًا يلغي تغييرًا أحدث. طابق rowversion/ETag وعقد conflict
في .NET، وحدد إعادة الجلب أو مراجعة المستخدم بدل last-write-wins خفية.

## اربط العقود والنماذج والـrendering

استخدم typed client من OpenAPI أو عقد مشترك موثق يناسب المشروع، مع
runtime parsing عند الحدود المطلوبة؛ TypeScript لا يتحقق من JSON خارجي.
وحد أخطاء الحقول وProblemDetails والـnull/absent وenum وmoney/timezone.
عالج 401/403/409/422/429/5xx وفق العقد دون loops لتجديد session.

في BFF/cookies اضبط CSRF وcredentials حسب origin؛ في SPA استخدم SDK
المزود والـflow المعتمد. لا تضع client secrets في build-time public env.
SSR يحتاج runtime واستضافة وحماية caches، وhydration deterministic؛
افصل browser APIs عن server render. بيانات تمرر إلى client props قد تُكشف
ولو جُلبت في server component؛ server actions تحتاج authorization كذلك.

نفّذ semantic HTML وkeyboard/focus وloading/empty/error/success وحالات
RTL/LTR. للنماذج الكبيرة استخدم field arrays/subscriptions مناسبة؛
للجداول قِس قبل virtualization مع الحفاظ على إمكانية الاستخدام والوصول.
اعزل jQuery widgets في boundaries صريحة؛ لا تجعل مكتبتين تملكان DOM نفسه.

## أثبت النتيجة

اختبر الرحلة لا تفاصيل hooks: إدخال وحفظ وإعادة قراءة، فشل API وتعارضه،
طلبات تكتمل بترتيب معكوس، logout/tenant switch أثناء طلب أو mutation،
history/navigation وkeyboard وhydration عند انطباقها. استخدم React Testing
Library/MSW أو الأدوات القائمة للحدود، وPlaywright لرحلة browser ممثلة.
قِس bundle/network/render bottleneck قبل split/lazy/memo؛ لا تعد بأرقام
تحسن بلا قياس. فرّق اختبارات منطق Node عن تشغيل React وbrowser و.NET فعليًا.

## مراجع رسمية

- [Effects](https://react.dev/reference/react/useEffect)
- [Transitions](https://react.dev/reference/react/useTransition)
- [State identity and reset](https://react.dev/learn/preserving-and-resetting-state)
