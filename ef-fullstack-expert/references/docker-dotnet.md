# Docker لتطبيقات .NET وReact

## المحتويات
- اختيار صورة ونمط نشر
- بناء قابل للتكرار
- التشغيل والحالة
- التحقق والتشخيص

## احسم هدف الحاوية

Docker خيار نشر عند طلبه أو وجود حاجة، وليس ترقية لازمة عن IIS. افصل
Linux containers عن Windows containers وتوافق Windows host/image.
لا تضع IIS داخل Linux image. لتطبيق ASP.NET Core على Linux شغل Kestrel
داخل الحاوية خلف البنية المعتمدة؛ أبق نشر Windows/IIS مسارًا مستقلًا.

اختر SDK image للبناء وaspnet runtime image لتطبيق Web، وruntime أو
runtime-deps بحسب self-contained/AOT للعمال. طابق TFM وOS/architecture
والـRID والتبعيات الأصلية؛ glibc/musl ليستا قابلتين للتبادل تلقائيًا.
اختبر العربية وICU/timezone/fonts عند استخدام slim/chiseled/Alpine؛ صغر
الصورة ليس سببًا لكسر collation/formatting أو توليد PDF.

## ابن artifact قابلاً للتكرار

1. اقرأ solution/project references وDirectory.Build/Packages.props
   وglobal.json وnuget.config وlockfiles؛ build context يجب أن يشملها.
2. استخدم multi-stage build: restore ثم publish ثم runtime فقط. رتب
   نسخ ملفات الاعتماد للاستفادة من cache دون نسيان transitive projects.
3. حدد الصورة/tag ويفضل digest مع سياسة تحديث. digest يثبت الهوية
   ولا يثبت خلوها من الثغرات؛ افحص المصدر والتوقيع/SBOM/scanning المتاحة.
4. امنع secrets من COPY وARG/ENV وlayers. استخدم build secrets للمصادر
   الخاصة عند توفرها، ولا تطبع NuGet credentials في logs. ملف .dockerignore
   يستبعد bin/obj/.git/.env ومواد التشغيل الخاصة.
5. انشر framework-dependent أو self-contained عن قصد. `--no-restore`
   صالح بعد restore مطابق لـRID/properties؛ لا تستعمله لإخفاء اعتماد ناقص.

React SPA تُبنى في stage مستقلة ثم تخدمها ASP.NET static files أو
خادم معتمد؛ npm lockfile وbuild args العامة ليست مكانًا للأسرار. SSR
يتطلب runtime إضافيًا وعقد توجيه وتشغيل واضحًا. لا تضع frontend dev server
في صورة الإنتاج، ولا تجمع processes متعددة بلا مدير ودورة حياة معلنة.

## صمم التشغيل والأمان والحالة

شغل مستخدمًا غير root وport غير privileged مع ملكية ملفات واضحة؛ اسم
المستخدم/UID يعتمد على الصورة الفعلية. EXPOSE يوثق ولا يفتح منفذًا ولا
يغير binding. طابق ASPNETCORE_HTTP_PORTS أو ASPNETCORE_URLS مع targetPort
والـprobe ومنافذ التطبيق؛ لا تعمم default port عبر كل صور .NET.

اجعل root filesystem read-only عند دعم التطبيق، مع mounts محدودة لـtmp
والـkeys والملفات اللازمة. لا تجعل certificate أو upload جزءًا من image.
ميز writable layer المؤقت عن volume دائم وobject store، وصمم backup وACL
ومشاركة state عبر النسخ. local disk لا يصلح shared store لمجرد استخدام replicas.

استخدم exec-form ENTRYPOINT وتحقق من SIGTERM وCancellationToken ووقت
graceful shutdown. مهمة durable تستأنف من storage؛ shutdown callback
قد لا يعمل عند crash. انشر API وworker كعمليتين مستقلتين عند اختلاف التوسع.
TLS termination وforwarded headers وثقة الـproxy يجب أن توافق topology.

ارسل structured logs إلى stdout/stderr أو collector مع redaction؛ لا
تترك ملفات log غير محدودة داخل layer. HEALTHCHECK في Docker قد يتطلب
أداة غير موجودة في الصورة؛ لا تفترض curl أو shell في chiseled image.
في Kubernetes استخدم probes المناسبة؛ Docker HEALTHCHECK لا يعوضها.

## اختبر وشخص

اختبر image build ثم run فعليًا بمنافذ localhost في بيئة معزولة؛ لا
تساوِ parse Dockerfile بنجاح image. جرّب non-root/read-only مع paths
الفعلية، وrestart وSIGTERM وعربية/تاريخ/upload وAPI denial حسب التطبيق.
افحص digest والصورة التي شغّلتها لا tag المتوقع فقط.

| العارض | ما تفحصه |
| --- | --- |
| Connection refused | bind address/port وpublish/targetPort واستعداد التطبيق |
| Permission denied | UID/GID وmount mode وملكية المسار؛ لا تعالج بـroot تلقائيًا |
| assembly/native lib missing | publish output وRID/OS والـruntime image |
| OOM/exit | cgroup memory والـworking set وallocations والحمل |
| بيانات تختفي بعد restart | writable layer مقابل volume/storage خارجي |
| login ينهار بين النسخ | keys/session state وproxy origin |

افحص docker logs/inspect/stats بحسب الصلاحية؛ لا تنشر env dump لأن inspect
قد يعرض أسرارًا. سلّم artifact/build instructions وruntime config المطلوبة
والمخاطر المقاسة. قالب Docker المرفق تعليمي ويحتاج تكييفًا لا نسخًا أعمى.

## مصادر
- [.NET containers](https://learn.microsoft.com/en-us/dotnet/core/docker/build-container)
- [Docker multi-stage](https://docs.docker.com/build/building/multi-stage/)
- [Docker build secrets](https://docs.docker.com/build/building/secrets/)
- [.NET container images](https://github.com/dotnet/dotnet-docker)
