# {{اسم النظام}} — تصميم قاعدة البيانات

الإصدار/الحالة/المالك: {{قيم}}. Engine/edition/compatibility/collation:
{{قيم متحققة}}. Schema source of truth: {{Code First/DB First ومالك التغيير}}.

## 1. النموذج والحجم
حدد domain vocabulary والمفاهيمي والمنطقي والفيزيائي وOLTP/read models.
أدرج ERD يبين cardinality/optionality وPK/FK وscope. وثق حجم ونمو
وتوزيع البيانات وحمل القراءة/الكتابة بوصفها قياسًا أو افتراضًا.

## 2. قاموس البيانات
| الجدول/الحقل | المعنى والمصدر | SQL type/length/precision | NULL/default | PK/FK/قيد | الحساسية/الاحتفاظ |
| --- | --- | --- | --- | --- | --- |
| {{اسم}} | {{معنى}} | {{نوع دقيق}} | {{قرار}} | {{اسم قيد}} | {{سياسة موثقة}} |

## 3. القيود والعزل
| Invariant | النطاق | قيد/معاملة/قفل | أثر الحذف والتزامن | اختبار |
| --- | --- | --- | --- | --- |
| {{قاعدة}} | {{tenant/workspace/global}} | {{وسيلة فعلية}} | {{سلوك}} | {{سيناريو}} |

حدد soft-delete/active uniqueness وNULL composite FKs وrowversion و
cross-scope relationships. ميز snapshots التاريخية عن current references.

## 4. الاستعلامات والفهارس
| Query-ID | Filters/joins/order/projection | حجم/توزيع | index مرشح | كلفة الكتابة | دليل الأداء |
| --- | --- | --- | --- | --- | --- |
| {{Q}} | {{shape}} | {{مقاس/افتراض}} | {{keys/include/filter}} | {{تقييم}} | {{غير مقاس/plan وIO}} |

## 5. التنفيذ والترحيل
اربط DDL/EF mappings/migrations وراجع تطابقها مع ERD والقاموس. حدد
baseline وbackfill وexpand/contract ومالك التنفيذ ومتى يمكن rollback.
لا تملأ تاريخًا مفقودًا بالقيمة الحالية دون قرار معلن.

## 6. الحماية والتشغيل والتعافي
حدد runtime/deploy/DBA permissions وRLS عند الحاجة وkeys/backup/log
growth/retention وrestore test وRPO/RTO. فرق availability عن backup.

## 7. نتائج التحقق
اختبر NULL/duplicate/cascade/العربية/الدقة/cross-scope/سباقات/rollback
على provider الحقيقي، وclean-create وupgrade. سجل ما لم يُشغّل بوضوح.
