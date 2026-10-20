# تشخيص أداء .NET والذاكرة والتزامن

ابدأ بعرض قابل لإعادة الإنتاج وbaseline: p50/p95/p99، throughput، errors،
concurrent requests، SQL/HTTP durations، CPU وworking set وGC allocation
والـqueue lengths. average وحده يخفي البطء الطرفي. وثق warm/cold وبيانات
الحمل والـbuild/hardware وحدود القياس؛ لا تعد بنتيجة قبل تشغيل التجربة.

| العارض | دليل يميز الفرضية | اتجاه إصلاح بعد الإثبات |
| --- | --- | --- |
| latency مرتفع وCPU منخفض | blocked threads/ThreadPool queue وsync-over-async | async end-to-end وحدود توازي؛ لا ترفع MinThreads عشوائيًا |
| CPU مرتفع | sampled stacks وhot paths | algorithm/serialization/SQL mapping؛ قارن قبل/بعد |
| ذاكرة تنمو | managed heap مقابل native، GC roots، unbounded cache/queue | أصلح ownership/retention؛ ليس كل working set مرتفع memory leak |
| GC/LOH ضغط | allocation rate وlarge arrays/strings وpause time | streaming/حجم دفعات؛ pooling عند القياس مع مسح بيانات حساسة |
| connection pool timeout | readers/transactions طويلة وعدد الاتصالات وتوزيع workload | أغلق الموارد وحد التوازي؛ timeout أكبر ليس إصلاح تسرب |
| بطء بعد deploy | JIT/startup/model/تهيئة ومزودات خارجية | warmup مقيد، options validation، تقليل startup I/O |

استخدم dotnet-counters للاستكشاف، dotnet-trace للـevents/stacks، dotnet-dump
للذاكرة والجذور، وdotnet-gcdump عند ملاءمته. افحص توفر الأداة وإصدارها
والصلاحيات والـOS؛ لا تعرض أوامر مصطنعة ولا تجمع dump إنتاجي خارج التفويض.
dumps/traces قد تحمل PII وأسرارًا؛ خزنها بمكان مقيد وحد احتفاظ وحجم ومدة.

لا تستخدم Task.Run لتغليف async I/O. راجع async void و.Result/.Wait
والـlocks حول await والـsemaphores غير المحررة. في Parallel.ForEachAsync
أو Task.WhenAll حدد concurrency يلائم DB/downstream، وافهم أن زيادة
التوازي قد تقلل throughput تحت الضغط. scope/context مستقل لكل مسار.

Span/Memory/ArrayPool/ValueTask وsource generation أدوات متخصصة؛ لا
تستبدل بها كودًا واضحًا بلا hotspot. لا تحتفظ بذاكرة مستعارة بعد return
إلى pool ولا تعيد انتظار ValueTask بلا فهم عقد المصدر. تحقق من AOT/trimming
والـreflection/serializers والحزم على هدف النشر، لا من compile عادي فقط.

قارن load test لرحلة API مع microbenchmark؛ BenchmarkDotNet مفيد للدوال
المعزولة لكنه لا يثبت capacity للموقع. أنشئ حد نجاح مرتبطًا بالمتطلب،
وشغّل regression للصحة والصلاحيات مع الأداء. أوقف القياس بعد حسم الخطر.

المصدر: [تشخيص .NET](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/)
و[ThreadPool starvation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/debug-threadpool-starvation).
