# C# Runtime والذاكرة والتزامن

اقرأ عند مراجعة hot path أو كود متزامن أو مكتبة مشتركة، أو عند ضغط GC
أو latency أو ThreadPool. القاعدة: القياس يسبق التحسين، والوضوح يسبق
الحيل؛ لكن يجب أن تعرف أثر كل سطر على allocations وthreads والـlatency.

## نموذج الذاكرة دون تبسيط خاطئ

- لا تقل «value types على stack». الموقع يحدده الاحتواء والعمر: local غير
  ملتقط قد يكون في stack أو registers؛ أما field داخل class، أو عنصر مصفوفة،
  أو متغير ملتقط في closure، أو local يعبر await/yield فيعيش على heap.
- Boxing يحدث عند تحويل struct إلى object أو interface غير generic، وفي
  `params object[]` وبعض APIs القديمة غير generic. افحصه في hot path بـ
  allocation profiler، لا بالتخمين.
- struct لقيمة صغيرة ذات دلالة قيمة. استخدم `readonly struct` لمنع
  defensive copies. struct قابل للتعديل داخل property أو collection يعدل نسخة.
  `in` للبنى الكبيرة readonly فقط عند قياس فائدة.
- `record class` يعطي مساواة قيمة و`with` ينسخ shallow. لا تستخدمه كـEF
  entity متتبع دون فهم أثر equality/hash على change tracking والمجموعات.
- `ref struct`/`Span<T>` لا يعبر await ولا يخزن في heap؛ استخدم `Memory<T>`
  عبر الحدود async. `stackalloc` بحجم صغير ثابت فقط، لا بحجم من المستخدم.
- Closures تولد display class وdelegate allocation. في hot path استخدم
  static lambdas وتمرير state صريح. لا تلتقط DbContext أو HttpContext في
  delegate يعيش أطول من الطلب.
- LINQ: deferred execution، وتعداد مكرر لنفس IEnumerable ينفذ العمل/الاستعلام
  مرتين، و`AsEnumerable()` ينقل ما بعده إلى الذاكرة. Expression trees تُترجم ولا
  تُنفذ؛ دالة C# داخل predicate قد تفشل الترجمة أو تُقيَّم في العميل.
- النصوص: تجنب concat في حلقات و`ToLower()` للمقارنة؛ استخدم
  `StringComparison.OrdinalIgnoreCase` أو المقارنة الثقافية المقصودة، و
  `StringBuilder`/`string.Create` عند الحاجة المقاسة.

## GC وعمر الكائنات

- Generations 0/1/2: الكائنات قصيرة العمر رخيصة؛ الكائن الذي يعيش «قليلًا
  أطول» (cache بلا حد، buffers في singleton) يرتقي إلى gen2 ويكلف أكثر.
- LOH للكائنات من ~85,000 bytes فأكثر؛ يُجمع مع gen2 ولا يُضغط افتراضيًا،
  فتظهر التجزئة. مصفوفات كبيرة متكررة (MemoryStream.ToArray، JSON كبير) مرشح أول.
- Server GC مقابل Workstation، وBackground GC، وDATAS في الإصدارات الحديثة
  تغير heap count واستهلاك الذاكرة. تحقق من الإعداد الفعلي وحدود الحاوية أو
  App Pool قبل الحكم بوجود leak.
- Finalizers: لا تكتبها إلا لمورد native مباشر، والأفضل `SafeHandle`.
  الـfinalizer يطيل عمر الكائن ويؤخر التحرير. Dispose للموارد المدارة لا يحتاج finalizer.
- Pooling: `ArrayPool.Shared.Rent` قد يعيد مصفوفة أكبر؛ استخدم الطول
  المطلوب، و`Return` داخل finally، و`clearArray: true` للبيانات الحساسة، ولا
  تستخدم المصفوفة بعد Return. `ObjectPool` فقط لكائنات مكلفة وقابلة لإعادة الضبط.
  `RecyclableMemoryStream` لتيارات كبيرة متكررة.

## async/await كما ينفذه المترجم والـruntime

- async method تصبح state machine. `ValueTask` يفيد عندما يكتمل غالبًا
  متزامنًا أو من مصدر pooled؛ لا تنتظره مرتين، ولا تخزنه، ولا تقرأ `.Result`
  قبل اكتماله. الافتراضي `Task`.
- ASP.NET Core لا يملك `SynchronizationContext`؛ لذلك sync-over-async
  (`.Result`/`.Wait()`) لا يظهر غالبًا كـdeadlock بل كـThreadPool starvation:
  latency متصاعد مع CPU منخفض. الـdeadlock الكلاسيكي يظهر في WPF/WinForms
  وASP.NET على .NET Framework، وفي مكتبة تُستهلك هناك.
- `ConfigureAwait(false)` مطلوب في library code الذي قد يستهلكه سياق UI أو
  legacy؛ غير ضروري في كود تطبيق ASP.NET Core وليس ضارًا.
- ThreadPool يضيف threads تدريجيًا؛ موجة طلبات مع blocking تتراكم. العلاج
  إزالة blocking. `SetMinThreads` إجراء طارئ مؤقت مع قياس، لا إصلاح.
- `Task.Run` داخل ASP.NET Core ينقل العمل إلى thread آخر من نفس الـpool:
  لا يزيد throughput ويضيف كلفة. لا تستخدمه لتغليف I/O أو «لجعل الكود async».
- `async void` لمعالجات الأحداث فقط؛ استثناؤه قد يُسقط العملية.
- Fire-and-forget (`_ = DoAsync()`) يفقد الاستثناء والـscope والإلغاء ويضيع
  عند recycle. البديل: `Channel` محدود + `BackgroundService`، أو job دائم.
- Cancellation: معامل `CancellationToken` في endpoint يرتبط بإلغاء الطلب.
  استخدم `CreateLinkedTokenSource` مع timeout وتخلص منه. قرر صراحة: هل يجب
  أن يكتمل الحفظ بعد قطع العميل؟ عندها لا تمرر token الطلب إلى خطوة الالتزام.
  `OperationCanceledException` بسبب العميل ليس خطأ 500 ولا يُسجل كـError.
- `Task.WhenAll` يرمي أول استثناء عند await؛ افحص `task.Exception` للبقية.
  لا WhenAll على DbContext واحد. `Parallel.ForEachAsync` مع
  `MaxDegreeOfParallelism` صريح يناسب DB/downstream.
- `Task.WhenAny` كـtimeout لا يلغي المهمة الأخرى؛ ألغها أو استخدم
  `WaitAsync(timeout, token)` مع فهم أن العمل الأصلي قد يستمر.
- `IAsyncEnumerable` يحتفظ بالاتصال حتى ينتهي التعداد؛ استخدم
  `[EnumeratorCancellation]` وحدد مهلة، ولا تفتح استعلامًا آخر على نفس السياق.

## أدوات التزامن

| الأداة | الاستخدام | الفخ |
| --- | --- | --- |
| `lock` / `Lock` (.NET 9+) | قسم حرج قصير متزامن | لا await داخله؛ لا تقفل على this/typeof/string؛ يحمي process واحدًا فقط |
| `SemaphoreSlim` | قسم حرج async أو حد توازي | Release في finally؛ ليس reentrant؛ `WaitAsync(token)` |
| `Interlocked` | عداد أو flag ذري | لا يحمي invariant عبر حقلين |
| `ReaderWriterLockSlim` | قراءات كثيرة وكتابة نادرة | لا يعمل مع await؛ immutable snapshot + swap غالبًا أبسط |
| `ConcurrentDictionary` | خريطة مشتركة | factory في GetOrAdd قد تُنفذ أكثر من مرة؛ استخدم `Lazy<Task<T>>` للعمل المكلف |
| `Channel<T>` bounded | producer/consumer داخل العملية | اختر FullMode؛ ليس طابورًا دائمًا |
| `volatile` | رؤية قيمة بين threads | ليس ذريًا للعمليات المركبة |

ابحث في المراجعة عن: singleton بحالة mutable، و`Dictionary` تُكتب من عدة
threads (فساد أو تعليق أو استثناء)، وcheck-then-act في الذاكرة، وstatic cache بلا
حد، وlocks تُستخدم لحماية invariant يجب أن تحميه قاعدة البيانات عبر النسخ.

## أثبت بالأدوات

- BenchmarkDotNet مع `[MemoryDiagnoser]` لدالة hot معزولة، لا لإثبات سعة.
- dotnet-counters: allocation rate، حجم heap، عدد GC لكل جيل، طول طابور
  ThreadPool وعدد threads، lock contention. تحقق من أسماء counters في الإصدار
  (EventCounters القديمة أم System.Runtime meter الأحدث).
- dotnet-trace بملف CPU sampling أو GC؛ dotnet-dump analyze مع
  `dumpheap -stat` و`gcroot` و`clrstack -all`/parallel stacks لتحديد threads المحجوبة.
- اختبار تزامن: طلبات متداخلة حقيقية على نفس المورد مع barrier، لا تشغيل متسلسل.

## مصادر

- [Memory management and GC](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/)
- [Async guidance](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
- [ThreadPool starvation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/debug-threadpool-starvation)
