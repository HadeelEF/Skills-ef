# React runtime وعقود TypeScript

اقرأ هذا المرجع لكتابة مكونات وhooks وأنواع متقدمة أو تشخيص سلوك React.
ابدأ بإصدارات react/react-dom وtypes وTypeScript وcompiler/framework الفعلية.
تحقق من الوثيقة المطابقة قبل استخدام API حديث؛ لا تخلط مثال إصدار جديد
بمشروع أقدم أو تعدّ transpilation دليلًا على سلامة الأنواع.

## افهم التنفيذ قبل تحسينه

- ميز render القابل للإعادة أو الإلغاء عن commit. حافظ على نقاء render،
  ولا تعتمد على عدد مرات استدعائه أو تنفذ فيه طلبًا أو تعديلًا خارجيًا.
- اربط هوية العنصر بموضعه ونوعه وkey ثابت من البيانات. تغيير key قد يعيد
  إنشاء state وDOM؛ استخدمه لإعادة ضبط مقصودة لا لإخفاء مشكلة مزامنة.
  استخدم useId لعلاقات الإتاحة، وليس لإنشاء مفاتيح سجلات القائمة.
- عامل state كلقطة من render؛ استخدم updater عند اعتماد التحديث على
  القيمة السابقة. لا تعدّل props أو كائنات state أو نتائج cache مباشرة.
- صمم effect لمزامنة نظام خارجي، مع dependencies وcleanup متطابقين.
  اختبر setup/cleanup المتكرر في StrictMode وتسرب listeners/timers.
  انقل منطق حدث المستخدم إلى الحدث، واشتق البيانات بدل effect ينسخها.
- استخدم refs للقيم غير المعروضة أو التكامل imperative المحدود؛ تغيير
  ref لا يسبب render. لا تستخدمه لتجاوز مصدر state أو إخفاء dependency.
  تحقق من صيغة تمرير ref المناسبة للإصدار وحدد imperative API صغيرًا.
- خصص useLayoutEffect لقياس/تعديل يحتاج أن يسبق paint؛ قد يحجب الرسم.
  تحقق من دعم useEffectEvent وحدوده قبل استخدامه؛ ليس مهربًا من dependencies.
- في external store حدد subscribe/unsubscribe وsnapshot immutable ثابتًا
  ما دامت البيانات لم تتغير. عند SSR طابق getServerSnapshot بين الخادم
  وأول hydration؛ لا تنشئ snapshot object جديدًا لكل قراءة بلا تغيير.

## نموذج التحديث والانتشار

- React 18+ يجمّع (batching) تحديثات state في handlers وpromises وtimers في render واحد. لا تعتمد على
  قراءة DOM بين `setState` متتالية؛ `flushSync` استثناء نادر يضر الأداء.
- render يبدأ من المكون الذي تغيرت حالته ويشمل أبناءه افتراضيًا. نقل الحالة إلى الأسفل (colocation)
  أو تمرير الأبناء كـ`children` من الأعلى يحصر إعادة الرسم قبل التفكير في `memo`.
- كل مستهلك لـContext يعيد render عند تغير `value` بالمقارنة المرجعية، ولو استخدم جزءًا لم يتغير.
  قسّم الـcontext حسب معدل التغير وثبّت القيمة، أو استخدم store خارجي مع selectors.
- `useReducer` عندما تتغير عدة قيم معًا بقواعد انتقال، أو يعتمد التحديث على الحدث لا القيمة؛ اجعل
  الحالة discriminated union لتمنع التركيبات المستحيلة. reducer خالص: لا طلبات ولا مؤقتات فيه.
- Portals: الأحداث تنتشر عبر شجرة React لا DOM، والـcontext يصل إليها؛ لكن `dir` و CSS الموروثان من
  حاوية DOM لا يصلان إذا رُكّبت في `body`.
- Error Boundary ما زال class component أو مكتبة (`react-error-boundary`)؛ لا يلتقط أخطاء handlers
  وasync وSSR. في React 19 استخدم `onCaughtError`/`onUncaughtError` في `createRoot` للرصد.

## صمم الانتظار والفشل والتحديثات الحديثة

- ضع Suspense boundaries بحسب تجربة المستخدم. fetch داخل effect وحده
  لا يفعّل Suspense؛ استخدم تكامل data/framework مدعومًا. لا تنشئ promise
  غير مستقر أثناء كل render. افصل loading boundary عن error recovery.
- حدد نطاق Error Boundary وإعادة المحاولة؛ عالج أخطاء async/events عند
  مصدرها وفق API المستخدم، ولا تفترض أن boundary عامة تلتقط كل فشل.
- اجعل قيمة input المتحكم به تستجيب مباشرة. استخدم transition/deferred
  للعرض غير العاجل عند الحاجة؛ لا يلغيان الطلبات ولا يرتبان نتائجها ولا
  ينقلان حسابًا متزامنًا ثقيلًا إلى thread آخر.
- عند استخدام actions/useActionState/useOptimistic أو form actions،
  تحقق من دعم المشروع وسياق dispatch وpending/reset/error semantics.
  حدد مالك optimistic state وتسوية النجاح والفشل والتعارض؛ ترتيب عمليات
  واجهة واحدة لا يحل تنافس تبويبين أو idempotency في .NET.
- استخدم memo/useMemo/useCallback أو React Compiler بعد تشخيص تكلفة
  فعلية. memoization ليست شرط صحة؛ لا تفترض تفعيل compiler لمجرد الإصدار.

## اجعل العقود تمنع الالتباس

- احترم strictness المشروع وحسّنها تدريجيًا. استخدم unknown عند الحدود
  غير الموثوقة ثم ضيق النوع أو تحقق runtime؛ لا تستخدم any أو assertion
  أو non-null assertion لمجرد إسكات خطأ غير مفهوم.
- مثل حالات async ونتيجة العملية بعقود مميزة، مثل idle/loading/ready/error،
  مع فصل initial loading عن refreshing وبيانات قديمة مسموح بعرضها.
  اجعل الحالات الممكنة صريحة؛ لا تجمع booleans متناقضة أو null غامضًا.
- صمم controlled/uncontrolled contracts واضحة. لا تسمح value بلا مسار
  تحديث أو value/defaultValue معًا دون معنى موثق. سمّ callbacks بحسب
  الحدث أو النية، وحدد القيمة والتوقيت وملكية الفشل.
- استخدم discriminated unions وexhaustive checks عند احتياجها، وgenerics
  عندما تربط نوع input/output أو row/selection فعلًا. حافظ على inference؛
  لا تجعل abstraction أعقد من الاستخدامات التي يخدمها.
- ميز absent وnull وempty و0 وfalse. لا تستخدم truthiness للتحقق من
  قيم صحيحة صفرية. satisfies وas const يفيدان الأنواع ولا يتحققان من JSON.
- افصل entity وread DTO وcommand وform draft. لا تحول Partial<Entity>
  إلى عقد تعديل يسمح بحقول الملكية والصلاحيات. احتفظ بمعنى money وID
  وdate-only وinstant عبر حدود .NET/JSON/TypeScript دون فقد دقة أو يوم.
- حافظ على generated clients قابلة لإعادة التوليد؛ ضع adapters خارجها.
  اربط تغير schema بالعميل والأخطاء والاختبارات، لا تعدل output مولدًا وحده.

## راجع كودًا متكاملًا

تحقق من imports/exports وtype-only imports وJSX types وملاءمة DOM/event
types. شغّل typecheck الفعلي إضافة إلى lint/build عندما تسمح البيئة؛
تشغيل ملف TypeScript عبر إزالة الأنواع لا يعادل فحصه أو تشغيل React DOM.
اختبر سلوك المستهلك، والتنظيف بعد unmount، وتغير props والسياق، وحدود
الأخطاء ذات الأثر. اربط التنظيم بمرجع معمارية كود React والتكامل بـ.NET.

## المصادر

- [External stores](https://react.dev/reference/react/useSyncExternalStore)
- [Effect Events](https://react.dev/reference/react/useEffectEvent)
- [Suspense](https://react.dev/reference/react/Suspense)
- [Transitions](https://react.dev/reference/react/useTransition)
- [Type narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
