# هندسة React المتقدمة

اقرأ هذا المرجع عند تصميم مكوّن أو Hook أو تشخيص سلوك React. استخدم
الإصدار المثبت؛ روابط الوثائق تتحرك مع الإصدارات ولا تفرض ترقية المشروع.

## Rendering and identity

فكّر في render كحساب يمكن أن يتكرر، وcommit كتطبيق التغير على الواجهة.
لا تكتب في الشبكة أو التخزين أو متغير مشترك أثناء render. حافظ على نقاء
المكونات وupdaters وreducers؛ تكرار الاستدعاء في التطوير ينبغي أن يكشف
خللًا يمكن إصلاحه، لا أن يتطلب إخفاء Strict Mode.

الحالة مرتبطة بهوية المكوّن وموضعه وkey. استخدم معرف السجل المستقر عند
إعادة ترتيب قائمة، وkey جديدة فقط عندما تقصد إعادة ضبط الحالة. تجنب
تعريف مكوّن داخل render إذا كان تغيّر هويته سيعيد تركيبه. `useId` مناسب
لربط عناصر الإتاحة، وليس بديلًا عن معرف بيانات القائمة.
مرجع: [Preserving state](https://react.dev/learn/preserving-and-resetting-state).

افهم snapshot الحالة والـclosures قبل معالجة قيمة قديمة. عندما تعتمد
القيمة الجديدة على السابقة، استخدم updater مناسبًا؛ لا تفترض أن قراءة
المتغير بعد setter تعطي القيمة التالية. تحديث الكائنات والمصفوفات يجب
أن يحافظ على المرجع الجديد للجزء المتغير دون نسخ كل الشجرة عشوائيًا.

## Hooks and effects

طبّق Rules of Hooks وفق API المستخدمة. اجعل custom Hook يعبر عن سلوك
واضح بعقد ومدخلات ونتائج وتنظيف، لا مجرد حاوية لإخفاء Effects أو اسمه
`useMount` لإجبار دورة حياة قديمة على React الحديث.

قبل Effect، حدد: هل العملية حساب مشتق، أم فعل مستخدم، أم مزامنة مع نظام
خارجي؟ الحساب يبقى مشتقًا، والفعل في مساره، والمزامنة قد تحتاج Effect.
لا تسلسل Effects لتحديث قيم يمكن اشتقاقها أو تغييرها معًا في حدث واحد.
مرجع: [When an Effect is unnecessary](https://react.dev/learn/you-might-not-need-an-effect).

اجعل dependencies تعكس القيم المقروءة؛ أصلح مرجعًا غير مستقر أو انقل
منطقًا إلى موضعه بدل إسكات exhaustive-deps. ألغِ الاشتراكات والمؤقتات
والطلبات أو تجاهل نتائجها القديمة عند انتهاء صلاحيتها. إلغاء العميل
للطلب لا يثبت أن كتابةً وصلت إلى الخادم قد أُلغيت.

`useLayoutEffect` يخص قياسًا أو تعديلًا يلزم قبل الرسم؛ تكلفته وحاجته
إلى DOM تجعلان اختياره محددًا. `useEffectEvent`، حيث تدعمه النسخة، يفصل
المنطق غير التفاعلي اللازم داخل Effect؛ ليس وسيلة لإخفاء dependency
ينبغي أن يعيد المزامنة. راجع [Effect](https://react.dev/reference/react/useEffect)
و[Effect Event](https://react.dev/reference/react/useEffectEvent) عند استخدامهما.

## Refs and external integration

استخدم ref لمقبض DOM أو قيمة لا تقود العرض؛ تغييره وحده لا يعيد التصيير.
قلّل السطح imperative المعروض للمستهلك، وحافظ على سلوك focus المطلوب.
تختلف طريقة استقبال ref وتمريره باختلاف React والأنواع؛ لا تعمم وصفة
`forwardRef` القديمة أو الأحدث دون مراعاة الإصدار والمكتبة.

اعزل مكتبة غير React مثل خريطة أو محرر في مكوّن يملك إنشاءها وتحديثها
وتنظيفها. لا تدعها وReact يعدلان نفس عقد DOM بلا حد واضح. في store خارجي
مخصص، افحص الحاجة إلى `useSyncExternalStore`، واستقرار snapshot وunsubscribe
وsnapshot الخادم؛ استخدم تكامل المكتبة عندما يكون موجودًا.
مرجع: [External stores](https://react.dev/reference/react/useSyncExternalStore).

## Suspense, transitions and actions

ضع حدود Suspense وفق أجزاء التجربة التي يمكن تحميلها مستقلة. لا يستشعر
Suspense جلبًا عاديًا داخل Effect تلقائيًا؛ يحتاج مصدرًا متوافقًا مثل lazy
أو تكامل بيانات يدعمه. لا تنشئ Promise جديدة كل render ثم تتوقع استقرار
التحميل. حافظ على shell ومكان النتائج والمحتوى المفيد أثناء الانتقال.
مرجع: [Suspense](https://react.dev/reference/react/Suspense).

ميّز بين استجابة إدخال عاجلة وعرض نتائج يمكن تأجيله. `useTransition`
و`useDeferredValue` يمكن أن يساعدا في جدولة العرض؛ لا يلغيان طلبات الشبكة
ولا يضمنان ترتيب نتائجها، وdeferred value لا يعادل debounce لتقليل الطلبات.
احفظ تحديث الحقل المتحكم به عاجلًا، وافحص APIs الأحداث غير المتزامنة
والتحديث بعد await في النسخة المستخدمة.
مراجع: [Transitions](https://react.dev/reference/react/useTransition)،
[Deferred values](https://react.dev/reference/react/useDeferredValue).

عندما تستخدم Actions أو `useActionState` أو `useOptimistic` أو form hooks،
حدد owner للانشغال ونتيجة الإرسال وإعادة ضبط الحقول وترتيب العمليات.
تكامل مكتبة النموذج معها يحتاج عقدًا واحدًا؛ لا تصنع مساري submit متنافسين.
التحديث المتفائل لا يؤكد نجاح الخادم، وServer Function لا تمنح الصلاحية
للمستدعي تلقائيًا. راجع [النماذج](forms-and-data.md) و[حدود الخادم](rendering-and-routing.md).

## Memoization and compiler

شخّص ما يسبب إعادة التصيير وما يجعلها مكلفة قبل `memo` و`useMemo`
و`useCallback`. استقرار الهوية قد يفيد اشتراكًا أو مكوّن يستخدم memo، لكنه
ليس مبررًا لتطبيق هذه الأدوات على كل دالة. لا تعتمد على memo لصحة التطبيق
أو لاستمرار قيمة يجب أن تكون state/ref؛ لا تتجاهل callback متغيرًا في
مقارنة مخصصة فتحتفظ بـclosure قديمة.

إذا كان React Compiler مفعّلًا، افحص إعداداته وتوافقه وأثره الفعلي. لا
تفترض أنه مفعّل لمجرد رقم React، أو أنه يصلح حسابًا خاطئًا أو يلغي جلبًا
مكررًا. التفاصيل والقياس في [الأداء](performance-and-delivery.md).
مرجع: [React Compiler](https://react.dev/learn/react-compiler/introduction).
