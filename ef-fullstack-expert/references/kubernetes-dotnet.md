# Kubernetes لتشغيل API وWorkers

## المحتويات
- قرار الاستخدام والموارد
- الصحة ودورة الحياة
- الأمان والحالة
- النشر والتشخيص

## حدد فائدة Kubernetes ومالك تشغيله

ابدأ بحاجة multi-service orchestration أو توسع وعزل ونشر وفريق تشغيل
قادر عليه. لا تفرض cluster على تطبيق يلبيه IIS. حدد النسخة والتوزيعة
والـnamespaces وregistry وingress/Gateway وDNS/storage/CNI/CSI والـowners.
تحقق من APIs والـfeature gates الفعلية؛ لا تعد بـHelm أو controller غير مثبت.

| المورد | القرار المطلوب |
| --- | --- |
| Deployment | API/worker stateless وreplicas وselector وrollout وتوافق النسخ |
| Service | ClusterIP وports/targetPort وlabel selectors صحيحة |
| Ingress/Gateway | controller/class مثبت وTLS ومسارات وtimeouts وحجم upload |
| Job | عملية تنتهي، backoff/deadline وidempotency وسجل النتيجة |
| CronJob | schedule/timeZone ومهام فائتة وتداخل وhistory limits |
| ConfigMap/Secret | إعداد غير سري مقابل secret provider/rotation وصلاحيات |
| HPA | metric وrequests صحيحة وحدود DB/downstream؛ replicas لا تعالج bottleneck DB |
| PDB | سياسة voluntary disruption مع replicas كافية؛ لا يمنع كل الأعطال |
| PVC/StorageClass | access mode والتوسع والنسخ والاستعادة وملاءمة عدة nodes |

لا تُضف StatefulSet لقاعدة إنتاج فقط لأن التطبيق يستخدم SQL Server.
خدمة البيانات المُدارة أو DBA-operated لها عقد منفصل وbackup/failover؛
تخزين Pod دائم لا يثبت DR أو دعم SQL Server على هذه المنصة.

## صمم الصحة والإنهاء

- startup probe تعطي التطبيق وقت البدء قبل بقية الفحوص؛ اضبط budget
  من زمن measured startup. endpoint ناجح قبل اكتمال initialization يضللها.
- liveness تفحص صلاحية العملية للاستمرار. انقطاع DB/IdP مؤقت لا يبرر
  restart loop لكل API؛ لا تشترك مع readiness في dependency-heavy check.
- readiness تحدد القدرة الحالية على استقبال الطلبات؛ عرّف dependencies
  اللازمة فعلًا وtimeouts صغيرة، ولا تكشف تفاصيل الاتصال في body.
- عند termination أوقف استقبال work جديدًا وراع endpoint propagation
  وgrace period وإلغاء الطلبات/العمال. نسق HostOptions.ShutdownTimeout
  مع terminationGracePeriodSeconds. preStop sleep ثابت ليس إثبات drain.
- لا تفترض shell داخل image لتشغيل hooks أو debug commands؛ استخدم
  إمكانات المنصة أو صورة تشخيص معتمدة ضمن الصلاحيات.

لـCronJob راجع missed schedule/deadline وtimeZone المدعومة وDST.
concurrencyPolicy: Forbid ينطبق على jobs من CronJob نفسها، ولا يمنع
تكرار أثر العمل أو تشغيلًا يدويًا/جدولًا آخر. اختر Kubernetes CronJob
أو Hangfire/Quartz scheduler عن قصد كي لا تجدولين الوظيفة نفسها مرتين.

## اضبط الموارد والأمان

حدد CPU/memory requests وlimits من حمل ممثل، مع headroom وقراءة
OOMKilled/throttling. HPA يحتاج metrics provider وإعداد target ملائمًا.
راجع أثر ضرب replicas في connection pools/worker concurrency على SQL
والمزودات. قيم المثال ليست sizing مثبتًا للمنتج.

شغل non-root وallowPrivilegeEscalation:false وdrop capabilities وseccomp
عند توافق الـOS، وreadOnlyRootFilesystem مع mounts الضرورية. بعض Linux
securityContext fields لا تنطبق على Windows Pods؛ لا تنقل القالب بينهما عمياء.
استخدم service account محدودًا؛ عطّل automount token إذا لم يحتج API server.
NetworkPolicy تعتمد enforcement من CNI؛ حدد ingress وegress وDNS/DB/IdP
قبل default-deny، واختبر الاتصال بدل افتراض الحماية من وجود YAML.

Secret بصيغة base64 ليست تشفيرًا. تحقق من encryption at rest وRBAC
ومصدر الأسرار وسياسة rotation. env secrets غالبًا تحتاج restart ليقرأها
التطبيق؛ volume update لا يضمن أن التطبيق أعاد تحميل القيمة. لا تضع قيمًا
سرية في Helm values المتعقبة أو تخرجها عبر kubectl get secret -o yaml.

افصل uploads وData Protection keys وjob storage عن ephemeral filesystem.
ReadWriteOnce لا يعني shared filesystem لجميع nodes؛ افحص access modes
وتصميم provider. وقع الروابط وتحقق من النطاق حسب مرجع الملفات.

## انشر وارجع بصورة متوافقة

استخدم immutable image identity وDeployment strategy وreadiness وميزانية
capacity لـmaxSurge. migration خطوة منفردة بمالك معلوم؛ لا initContainer
يعدل schema في كل replica. EF bundle/script يحتاج compatibility وحقن secrets
آمنًا. rollback للصورة لا يعكس migration أو side effect خارجي.

في Helm حدد values schema وrequired settings وlabels/selectors ثابتة؛
افحص rendered manifests وdiff. Secret في rendered output قد يتسرب؛ احجب
القيم. لا تنفذ apply/upgrade على cluster لمجرد أن template render نجح.

عند وجود وصول مصرح ثبت context/namespace قبل كل mutation. ابدأ read-only
بـget/describe/events/logs وrollout status المحدد. server dry-run يتصل
بالـcluster وقد يستدعي admission، وليس فحصًا محليًا خالصًا؛ احترم سياسة البيئة.

| الحالة | ترتيب التشخيص |
| --- | --- |
| Pending | events ثم resource requests/quotas/taints/PVC/scheduling |
| ImagePullBackOff | image/digest وregistry auth/connectivity |
| CrashLoopBackOff | previous logs وexit/termination reason وconfiguration |
| OOMKilled | memory limit وpeak/load وheap/native allocations |
| Ready=false | probe path/port/timeout وdependency المعنية |
| Service بلا استجابة | endpoints/selectors/targetPort ثم policies/DNS |

اختبر replica restart وgraceful drain وscale وسحب secret والـDB outage
في بيئة معزولة، مع عدم تكرار jobs وعدم تسرب جلسة/ملف. اذكر ما نفذ فعليًا؛
YAML صالح لا يثبت نشرًا أو توافرًا أو أمان cluster.

## مصادر
- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Security context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
- [CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
