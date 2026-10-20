# {{العملية}} — تصميم العمل الخلفي والملفات والتدقيق

الحالة/النسخة/المالك والمتطلبات: {{قيم وروابط}}.

## 1. العقد والملكية
حدد initiatedBy/executedBy وOperationId وresource scope والـpayload
version، ومعنى قبول المهمة ونجاحها، ومصدر بيانات التنفيذ: snapshot أم live.

## 2. حالات العملية
| الحالة | الدخول إليها | الانتقال التالي | الفشل/الإلغاء | مالك التحديث |
| --- | --- | --- | --- | --- |
| {{Pending/Running/…}} | {{شرط}} | {{شرط}} | {{قرار}} | {{خدمة}} |

## 3. التسليم والجدولة
اختر BackgroundService/Hangfire/Quartz/broker/CronJob وعلل البديل.
حدد storage وoutbox/inbox وdedup وatomic boundaries وlease/fencing
والـretries/backoff/failed state/replay permissions. وثق timezone وmisfire
وoverlap والـworkers/queues والحمل. لا تعد exactly-once دون آلية مثبتة.

## 4. الملفات
| الجانب | التصميم |
| --- | --- |
| Metadata/bytes | {{FileId/storage key/schema/provider}} |
| Upload | {{streaming/limits/signature/quarantine}} |
| DB/storage gap | {{حالات وتعويض وreconciliation}} |
| Download | {{authorization/headers/signed URL/expiry}} |
| Lifecycle | {{version/replace/delete/retention/backup}} |

## 5. التدقيق والمراقبة
حدد event schema وactor/operation/resource/outcome ووقت commit وحقول
redacted وretention/read access. فرق audit عن diagnostic logs وmetrics.
حدد ماذا يحدث عند فشل sink، وكيف تمنع تكرار النجاح أو فقد سجل إلزامي.

## 6. الفشل والتحقق
| نقطة fault injection | الحالة المتوقعة | التعافي | دليل |
| --- | --- | --- | --- |
| {{بعد الأثر قبل ack/commit}} | {{عدد الآثار وحالة الملف}} | {{إعادة تشغيل}} | {{منفذ/غير منفذ}} |

يشمل القبول نسختين متزامنتين، سحب الصلاحية، orphan file، scanner outage،
unknown commit، replay، وحذف أثناء download بحسب متطلبات العملية.
