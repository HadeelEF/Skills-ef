# حالة الخادم في React: TanStack Query بمستوى المؤسسة

اقرأ عند جلب بيانات أو كتابتها من React، أو تشخيص طلبات مكررة أو بيانات قديمة أو تسرب بين
جلسات. الأمثلة لـTanStack Query v5؛ تحقق من major المثبت قبل نسخ API. إذا استخدم المشروع
SWR أو RTK Query أو loaders فطبّق نفس الضمانات بأدواته. التنفيذ المرجعي المختبر:
`assets/examples/golden-react-feature`.

## ما هي حالة الخادم

بيانات يملكها الخادم ويمكن أن تتغير دون علم الواجهة. لا تنسخها إلى useState أو Zustand أو
Redux ثم تزامنها بـeffects؛ الـcache هو نسخة الواجهة الوحيدة منها. المسودة والفلتر المحلي
وحالة الـmodal ليست حالة خادم.

## قرر defaults المشروع مرة واحدة

defaults المكتبة (staleTime 0، refetch عند focus، ثلاث محاولات لكل خطأ) تسبب موجات طلبات
في تطبيقات داخلية كثيفة البيانات، وتعيد محاولة 4xx لن تنجح أبدًا. ضع في `queryClient`:

| الإعداد | قرار افتراضي مبرر | متى تغيره |
| --- | --- | --- |
| `staleTime` | 30–60 ثانية للبيانات المرجعية والقوائم | أقصر لحالات سير العمل (اعتماد)، `Infinity` للثوابت مع invalidation صريح |
| `gcTime` | 5 دقائق | أطول للتنقل المتكرر بين شاشتين؛ أقصر للبيانات الحساسة |
| `retry` للقراءة | مرتان للأخطاء العابرة فقط؛ لا retry لـ4xx أو contract drift أو abort | لا تعِد محاولة بلا jitter وحد |
| `retry` للكتابة | `false` دائمًا | استثناء فقط مع idempotency key مثبت في الخادم |
| `refetchOnWindowFocus` | مفعّل مع staleTime غير صفري | عطّله لشاشات إدخال طويلة تتأثر بإعادة العرض |
| `throwOnError` | لا افتراضيًا؛ عالج حالات الشاشة صراحة | فعّله مع Suspense وError Boundary المصممين لذلك |

## صمم مفاتيح الاستعلام كعقد

- **factory لكل feature**، لا مصفوفات حرفية متناثرة. ابدأ المفتاح بالـfeature ثم **نطاق الجلسة**
  (tenant/user) ثم النوع ثم المعاملات: `['requests', scope, 'list', filters]`.
- كل ما يغير النتيجة يدخل المفتاح: الفلاتر والصفحة والترتيب واللغة إذا غيّرت المحتوى. ما لا
  يغيرها لا يدخله (callbacks، كائنات غير قابلة للتسلسل).
- استخدم `queryOptions()` ليصير المفتاح typed (`DataTag`)، فيصبح `setQueryData` و`getQueryData`
  مكتوبي الأنواع دون generic يدوي يكذب.
- طبّع الفلاتر قبل وضعها في المفتاح (ترتيب ثابت، حذف القيم الافتراضية) حتى لا يتكرر cache.

```ts
export const requestKeys = {
  all: (s: SessionScope) => ['requests', scopeKey(s)] as const,
  lists: (s: SessionScope) => [...requestKeys.all(s), 'list'] as const,
  list: (s: SessionScope, f: RequestFilters) => [...requestKeys.lists(s), normalize(f)] as const,
  detail: (s: SessionScope, id: string) => [...requestKeys.all(s), 'detail', id] as const,
};
```

## ابنِ مصفوفة invalidation لكل mutation

لكل كتابة اكتب قبل التنفيذ: ما المفاتيح التي تتأثر؟ القرار الافتراضي: `setQueryData` للمورد
الذي أعاد الخادم نسخته المؤكدة، ثم `invalidateQueries` للقوائم والعدادات والتفاصيل التي يمكن
أن تتغير حقولها المشتقة (صلاحيات، إجماليات). أعد promise الـinvalidation من `onSettled` عندما
تريد أن تبقى الـmutation في حالة pending حتى تكتمل إعادة القراءة.

| العملية | التحديث المباشر | الإبطال |
| --- | --- | --- |
| تعديل مورد | detail بالنسخة المعادة وETag الجديد | lists التي تعرض الحقل، counts |
| إنشاء | لا شيء عادة | lists وcounts |
| حذف | `removeQueries` للتفاصيل | lists وcounts |
| تغيير حالة سير عمل | detail | lists وinbox المستخدم وdashboards |

## التحديث المتفائل: متى وكيف

استخدمه لعمليات قابلة للتراجع منخفضة الخطورة (نجمة، ترتيب محلي، وسم). لا تستخدمه لقرار عمل
أو مبلغ أو اعتماد: أظهر نتيجة الخادم المؤكدة. عند استخدامه:

1. `await queryClient.cancelQueries({ queryKey })` قبل التعديل حتى لا يكتب refetch جارٍ فوقه.
2. احفظ snapshot وأعده في context، وعدّل الـcache.
3. في `onError` أعد الـsnapshot **فقط إذا لم تحدث كتابة أحدث** على نفس المورد (قارن mutation id
   أو version)؛ وإلا أبطل وأعد القراءة.
4. في `onSettled` أبطل المفتاح.

البديل الأبسط لكثير من الحالات: اعرض المتغيرات الجارية من `useMutationState` أو `variables`
دون لمس الـcache، فلا rollback أصلًا.

## أنماط الجلب

- **Dependent queries:** استخدم `enabled` أو `skipToken` عندما يعتمد طلب على نتيجة آخر؛ لا تتداخل
  hooks شرطيًا ولا تجلب في effect.
- **Pagination:** `placeholderData: keepPreviousData` لعرض الصفحة السابقة أثناء الجلب، مع مؤشر
  `isPlaceholderData`؛ عطّل "التالي" عندما لا يوجد المزيد. صفحات الخادم (offset أو keyset) قرار
  عقد مع .NET، لا تفصيل واجهة.
- **Infinite queries:** `initialPageParam` و`getNextPageParam` من cursor الخادم، و`maxPages` للقوائم
  الطويلة حتى لا يكبر الـcache بلا حد. افرض حدًا على الصفوف المعروضة أو استخدم virtualization.
- **Prefetch:** عند hover على رابط أو في route loader عندما يحسن الانتقال؛ لا تجلب كل التفاصيل
  مسبقًا لكل صف.
- **Deduplication:** نفس المفتاح في عدة مكونات = طلب واحد. تكرار الطلب غالبًا مفتاح غير مستقر
  (كائن جديد في كل render) أو staleTime صفري.
- **`select`:** لاشتقاق جزء من البيانات دون إعادة render للمستهلكين عند تغيّر أجزاء أخرى؛ اجعل
  الدالة مستقرة إذا كانت مكلفة.
- **Suspense:** `useSuspenseQuery` مع حدود Suspense وError Boundary مصممة؛ لا تخلطها مع
  `isPending` في نفس الشاشة دون قصد.

## الحالات التي تكسر الشاشات غالبًا

- **فشل refetch خلفي ≠ فشل أول تحميل.** في v5 تصبح `status: 'error'` و`data` ما زالت موجودة. اعرض
  شاشة الخطأ الكاملة فقط عندما `data === undefined`؛ غير ذلك اعرض البيانات مع تنبيه غير معطل.
  (هذا خلل حقيقي ظهر في المثال الذهبي قبل الاختبار.)
- **ETag مع البيانات:** خزّن النسخة داخل قيمة الـcache (`{ data, etag }`) حتى ترسل الكتابة نسخة ما
  رآه المستخدم، لا نسخة أحدث وصلت بعد.
- **تبديل الجلسة:** المفتاح يحمل scope، و`removeQueries` للنطاق القديم، و`queryClient.clear()` عند
  logout، ومسح أي persisted cache أو service worker cache. احجب البيانات القديمة في نفس الـrender
  (key على الشجرة)، لا في effect لاحق.
- **SSR:** QueryClient لكل طلب، لا singleton على الخادم؛ dehydrate ما يُسمح للمستخدم برؤيته فقط.
- **Realtime:** الحدث يبطل أو يحدّث بشرط نسخة أحدث؛ راجع مرجع عميل realtime.

## اختبر

مفاتيح تتضمن scope، إعادة قراءة بعد كتابة، 412 دون إعادة إرسال، فشل refetch خلفي يبقي البيانات،
retry لا يحدث مع 404، تبديل مستخدم بطلب بطيء دون وميض، optimistic rollback لا يلغي كتابة أحدث.

## المصادر

- [TanStack Query: Important defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
