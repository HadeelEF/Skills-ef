# هندسة SQL Server وT-SQL

## المحتويات
- المحرك والتصميم الفيزيائي
- الاستعلامات والإجراءات
- العزل والتزامن
- الأداء والتشغيل

## ثبت المحرك قبل التصميم

اجرد SQL Server version/edition وcompatibility level وcollation وحجم
البيانات وRPO/RTO وحمل القراءة/الكتابة. في خدمة مدارة مثل ApsaraDB for
SQL Server تحقق من المحرك وSKU والخصائص والأذونات والنسخ الاحتياطي الفعلية؛
لا تفترض SQL Agent أو sysadmin أو FILESTREAM أو Always On مكافئة للـon-prem.
صمم relational model من مرجع نمذجة البيانات ثم حوّله إلى DDL قابل للمراجعة.

| قرار فيزيائي | المفاضلة المطلوبة |
| --- | --- |
| clustered key | width/stability/access/order/write contention؛ PK لا يجب أن يكون clustered دائمًا |
| identity/sequence/GUID | توزيع الإنشاء والكشف والحجم؛ لا تعد بتسلسل بلا فجوات؛ GUID عشوائي قد يغير كلفة الكتابة |
| nvarchar/decimal/datetime2 | طول ودقة ومعنى الأعمال؛ لا nvarchar(max) لكل نص ولا float للأموال |
| schemas | ملكية modules وصلاحيات؛ اسم schema ليس حد أمان وحده |
| filtered/covering indexes | query shape وNULL/soft-delete وكلفة تحديث ومطابقة parameterized predicate |
| temporal/CDC/change tracking | history مقابل changes feed؛ ليست بديل audit يشرح actor والسبب |
| partition/columnstore/compression | حمل وتحليل أو retention محددان؛ راجع النسخة والقيود وقياسًا ممثلًا |

افصل جدول المعاملات عن read model التحليلي عندما يبرر الحمل ذلك. لا تنشئ
فهارس لكل FK أو column بلا مراجعة استخدام؛ لا تزل فهرس قيد تحت اسم تحسين.
اختبر Unicode/collation بالعربية وبقيم متقاربة وفق قاعدة المساواة المطلوبة.

## اكتب T-SQL يحفظ الدلالة

- استخدم set-based operations عند ملاءمتها؛ cursor أو loop استثناء مبرر
  لتسلسل ضروري، لا وسيلة افتراضية لكل صف.
- راجع JOIN multiplicity قبل SUM/COUNT؛ join بجدولي تفاصيل قد يضاعف
  المبالغ. استخدم aggregation منفصلة أو EXISTS للوجود فقط.
- فرق WHERE عن HAVING وON؛ شرط على child في WHERE قد يحول LEFT JOIN
  إلى inner فعلي. NOT IN مع NULL قد يغير النتيجة؛ افحص NOT EXISTS.
- CTE أسلوب تعبير وليس cache أو materialized result مضمونًا. للبيانات
  الوسيطة الكبيرة قارن temp table وtable variable وTVP مع statistics
  وإصدار optimizer. في recursive CTE امنع cycles وحد العمق.
- استخدم ROW_NUMBER/RANK/LAG/LEAD وwindow aggregates مع ترتيب واضح؛
  ROW_NUMBER يحتاج tie-breaker حتميًا عندما تريد صفًا محددًا. حدد ROWS
  frame للحساب التراكمي إذا كانت دلالة الصفوف هي المطلوبة.
- راجع APPLY لاختيار نتيجة لكل parent؛ CROSS يسقط من لا نتيجة له،
  OUTER يحتفظ به. افحص خطة التنفيذ عند parents كثيرة.
- استخدم نطاق تاريخ نصف مفتوح وتمثيل UTC/zone وفق المعنى. لا تُحوّل
  العمود في WHERE دون فحص أثره. ORDER BY داخل CTE لا يرتب الناتج النهائي.
- لا تجعل dynamic SQL يقبل identifiers خامًا؛ allowlist مع parameters
  عبر sp_executesql. QUOTENAME يحمي quoting ولا يمنح authorization.

مثال latest row لكل طلب داخل نطاق مصرح، بتعادل timestamp محسوم:

```sql
WITH Ranked AS (
    SELECT RequestId, Status, ChangedAt, HistoryId,
           ROW_NUMBER() OVER (
               PARTITION BY RequestId
               ORDER BY ChangedAt DESC, HistoryId DESC) AS rn
    FROM dbo.RequestHistory
    WHERE WorkspaceId = @WorkspaceId
)
SELECT RequestId, Status, ChangedAt
FROM Ranked
WHERE rn = 1
ORDER BY ChangedAt DESC, HistoryId DESC;
```

عرّف semantics قبل نقل فلتر Status إلى داخل CTE: «آخر حالة ثم تصفيتها»
تختلف عن «آخر حدوث لحالة محددة». هذا المثال لا ينفذ authorization ولا
paging ولا يثبت أفضل فهرس؛ أضفها حسب العقد وقِس الخطة.

## صمم stored procedures كعقود

حدد parameter types وnullable/default وresult sets وoutputs/errors
والنسخة والصلاحيات. لا تعتمد SELECT * ولا messages النصية كعقد API.
اختر حدود المعاملة مع المستدعي، وراجع SET NOCOUNT ON وXACT_ABORT و
TRY/CATCH وTHROW وفق سلوك الإجراء. في CATCH افحص XACT_STATE؛ معاملة
غير قابلة للـcommit لا تُنقذ بsavepoint. لا تجعل إجراءً داخليًا يلتزم أو
يتراجع عن معاملة يملكها caller دون عقد صريح؛ nested BEGIN لا يصنع معاملات مستقلة.

لـupsert اجمع unique constraint مع معاملة/locking أو conditional write
وسياسة duplicate معروفة. لا تعتبر MERGE أو SELECT ثم INSERT حصانة من
السباقات. في bulk استخدم staging وعقد TVP/SqlBulkCopy من مرجع Dapper،
مع ضمانات scope/audit والتعافي من دفعة جزئية.

## افصل أنواع العزل والضمان

READ COMMITTED مع locking يختلف عن READ_COMMITTED_SNAPSHOT. RCSI عادةً
يحمي قراءة statement؛ SNAPSHOT يعطي رؤية transaction وفق إعداد المحرك.
كلاهما لا يضمن كل invariant يمتد عبر صفوف ضد write skew. SERIALIZABLE أو
صف تنسيق/قفل مناسب قد يلزم لمنع overlap، مع index يحد lock footprint.
لا تُفعّل خيار عزل على الإنتاج كإصلاح جانبي؛ قيّم version store والـtempdb
أو التخزين المعني ودعم البيئة وكلفة المعاملات الطويلة.

rowversion يكشف تعديل صف، وليس ساعة أو رقمًا يصلح للجمع أو ضمان جدول
كامل. NOLOCK يسمح بقراءات غير موثوقة؛ لا تستخدمه لتقرير مالي أو لإخفاء
blocking. عند deadlock اجمع graph وحدد الموارد وترتيب الوصول ثم أصلح السبب؛
إن أعدت المحاولة فلتكن وحدة العمل كلها وبميزانية وإثبات idempotency.

RLS يحتاج filter وblock predicates المناسبين وسياقًا موثوقًا؛ query filter
في EF لا يساوي RLS. عند SESSION_CONTEXT مع pooling أعد ضبط السياق
واختبر إعادة استعمال الاتصال بين نطاقين؛ لا تقبل tenant من العميل مباشرة.
افصل صلاحية تغيير policy عن runtime وراقب bypass الإداري.

## شخّص الأداء والتشغيل

استخدم مرجع الفهارس والخطط لـQuery Store/actual plans وIO/CPU/time.
أضف wait category وblocked sessions وmemory grants/spills والـlog/IO
والـtempdb عند وجود دليل. لا تنقل hints من query إلى أخرى بلا تحقق.
Parameter sniffing ليس خطأً دائمًا؛ اختبر skew وcompatibility وإمكانات
المحرك قبل PSP/OPPO أو recompile/forcing، وخطط لإزالة حل مؤقت ومراقبته.

حدد owners لbackup/restore وrecovery model وlog backups وretention
والشهادات/مفاتيح التشفير. availability replica ليست backup؛ اختبر restore
ونقطة الاستعادة والاتصال بعد failover ببيانات مصرح بها. لا تستخدم shrink
أو rebuild شاملًا كصيانة افتراضية؛ قِس سبب النمو والحمل والمساحة.

سلم DDL وقاموسًا وخريطة query/index وmigration ونتائج DB حقيقية أو
خطوات تحقق معلنة إذا لم تتوفر. لا تسم lint SQL اختبار isolation.

## مصادر
- [SQL Server documentation](https://learn.microsoft.com/en-us/sql/sql-server/)
- [Index design](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide)
- [RLS](https://learn.microsoft.com/en-us/sql/relational-databases/security/row-level-security)
- [Query Store](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store)

افتح المرجع المتخصص الموافق للمحرك قبل اختيار خاصية متغيرة أو كتابة أوامر تشغيل.
