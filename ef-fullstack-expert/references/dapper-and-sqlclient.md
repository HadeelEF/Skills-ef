# Dapper وMicrosoft.Data.SqlClient

## المحتويات
- الاختيار والعقود
- الاتصالات والقراءات
- العلاقات والمعاملات
- الكتابة بالجملة والتحقق

## اختر أسلوب الوصول وفق المسار

استخدم EF Core لنموذج متتبع ومعاملات ومخطط يملكه التطبيق؛ قيّم Dapper
لقراءة SQL محددة أو إجراء قائم أو مسار يحتاج تحكمًا وقياسًا. لا تحول كل
القراءات إلى Dapper ولا تفترض أنه أسرع دائمًا. Dapper لا يدير migrations
أو change tracking أو authorization أو concurrency تلقائيًا.

ثبت توافق Dapper وMicrosoft.Data.SqlClient وTFM والمحرك. تعامل مع Dapper
Core وحزم bulk/CRUD التابعة لجهات أخرى كاعتماديات منفصلة الترخيص والضمانات.
استخدم SQL في feature/read adapter معروف، لا strings موزعة بين controllers.

## أدر الاتصالات والأوامر

أنشئ اتصالًا قصير العمر لكل وحدة عمل مستقلة وافتحه متأخرًا وتخلص منه
بعد استهلاك النتائج؛ pooling يعيد استخدام الاتصال الفيزيائي. لا تسجل
SqlConnection singleton ولا توازِ أوامر عشوائية على اتصال ذي reader نشط.
حدد مالك الاتصال والمعاملة: لا تتخلص من اتصال يملكه DbContext مستعار.

استخدم CommandDefinition للـcancellation وtimeout وtransaction وcommandType.
الإلغاء لا يثبت أن write لم تلتزم؛ صمم reconciliation للنتيجة المجهولة.
لا تضع credentials في مثال أو log، ولا تعطل التحقق من شهادة SQL لحل الإنتاج.

مثال قراءة محدود بعد authorization، يحتاج الحزم والـschema الحقيقيين؛
ليس كودًا اختُبر بمجرد وجوده في المرجع:

```csharp
using Dapper;
using Microsoft.Data.SqlClient;

public sealed class ProjectRow
{
    public long Id { get; init; }
    public string Name { get; init; } = "";
}

public static class ProjectQueries
{
    public static async Task<IReadOnlyList<ProjectRow>> ListAsync(
        string connectionString, Guid authorizedWorkspaceId,
        long afterId, int take, CancellationToken cancellationToken)
    {
        if (take is < 1 or > 200) throw new ArgumentOutOfRangeException(nameof(take));
        const string sql = """
            SELECT TOP (@Take) Id, Name
            FROM dbo.Project
            WHERE WorkspaceId = @WorkspaceId AND Id > @AfterId
            ORDER BY Id;
            """;
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        var command = new CommandDefinition(sql,
            new { WorkspaceId = authorizedWorkspaceId, AfterId = afterId, Take = take },
            commandTimeout: 30, cancellationToken: cancellationToken);
        return (await connection.QueryAsync<ProjectRow>(command)).ToList();
    }
}
```

مدة 30 ثانية مثال، تضبط من ميزانية الطلب وقياسه. يستخرج المستدعي النطاق
ويتحقق من عضوية الفاعل خادميًا؛ تمرير Guid إلى الدالة ليس authorization.
إذا لم يكن Id unique داخل النطاق، عدل ترتيب cursor والمفتاح المكمل.

## اكتب استعلامًا محدد العقد

- مرر القيم parameters. أسماء الجداول والأعمدة وASC/DESC لا تصبح آمنة
  بparameter؛ اربطها بقائمة SQL fragments ثابتة. escaping ليس بديلًا عن allowlist.
- طابق DbType/length/precision/scale مع SQL schema لتجنب فقد الدقة وتحويل
  العمود ضمنيًا. استخدم DynamicParameters وDbString عند حاجة صريحة؛ لا
  تختَر ANSI لنص عربي مخزن Unicode. راجع تأثير حجم parameter في الخطة.
- QuerySingle يعني صفًا واحدًا مطلوبًا؛ SingleOrDefault يسمح بالصفر فقط.
  لا تستخدم First لإخفاء تكرار يخرق القاعدة. طابق NULL وaliases وأنواع DTO.
- QueryMultiple يقلل round trips؛ استهلك grids بالترتيب وتخلص من reader.
  عدة SELECT في batch ليست snapshot موحدة تلقائيًا؛ عرّف isolation إذا
  كان header والdetails وcount يحتاجون حالة متسقة تحت التعديل.
- Multi-mapping يحتاج ترتيب columns وaliases وsplitOn صحيحًا. في 1:N
  اجمع children بمعرفاتها وidentity map للparent؛ راع LEFT JOIN بلا child.
  لا تكرر parent لكل صف ثم تعتبره paging صحيحًا؛ page الآباء أولًا.
- buffered مناسب لنتيجة محدودة. للـstreaming أبق connection/reader مفتوحين
  حتى آخر عنصر، وطبق cancellation وbackpressure. لا تعِد IEnumerable
  مؤجلًا من داخل using أغلق الاتصال؛ تحقق من API async unbuffered في الإصدار.
- للـstored procedure صرّح CommandType.StoredProcedure وحدد المدخلات
  والمخرجات وreturn value. استهلك النتائج قبل قراءة outputs عندما يقتضي driver.

## احم الكتابة والتزامن

ضع workspace/tenant وexpected rowversion وشروط الحالة في WHERE للتحديث
المشروط، وأعد version جديدة عبر OUTPUT أو عقد الإجراء. صفوف صفر ليست
دائمًا not-found؛ قد تعني conflict أو نطاقًا ممنوعًا، دون تسريب وجود السجل.
لا تعتمد على Execute affected count لإجراء معقد يتأثر بـNOCOUNT/triggers؛
استخدم output/result صريحًا واختبره. لا تعتمد على pre-check للـuniqueness.

عند وجود trigger راجع قيود OUTPUT المباشر؛ قد تحتاج OUTPUT INTO ثم SELECT.
الناتج من statement قبل commit لا يثبت التزام المعاملة كلها. لا تعد success
للعميل قبل commit، ولا تكرر timeout كتابة تلقائيًا بلا idempotency.

## اجمع EF وDapper في معاملة واحدة عند الحاجة

استخدم اتصال DbContext نفسه وDbTransaction الفعلية من CurrentTransaction.
ابدأ transaction عبر مالك واحد، ومرر transaction لكل Dapper command؛
تشابه connection strings لا يوحد معاملتين. استعمل
Microsoft.EntityFrameworkCore.Storage للـGetDbTransaction.

رتب SaveChanges وSQL المقصودين، ثم commit مرة واحدة. Dapper لا يحدث
ChangeTracker؛ أعد تحميل entities المتأثرة أو تجنب تعقبها. لا تستدعِ
ChangeTracker.Clear عشوائيًا إن كانت هناك تغييرات أخرى لم تحفظ.

إذا كانت execution strategy تعيد المحاولة، ضع **الوحدة كاملة** داخل
ExecuteAsync: context/connection جديدان لكل محاولة، transaction جديدة،
والكتابات كلها. أنشئ OperationId ثابتًا خارج المحاولات وضع قيد dedup دائمًا
إذا كانت نتيجة commit قد تضيع. لا ترسل mail/HTTP غير idempotent داخل delegate.
حدد verify-success/reconciliation للـunknown commit بدل تكرار insert أعمى.
لا تستخدم MARS لإخفاء reader غير مستهلك أو مشاكل مشاركة اتصال.

## TVPs وSqlBulkCopy

لـTVP عرّف user-defined table type بعقد أعمدة وأنواع وترتيب متطابق،
وقرر permissions وتطور النوع. تحقق من محدودية statistics والأداء حسب الحجم؛
IN list عملاقة ليست دائمًا بديلًا جيدًا. لا تحقن قائمة IDs في SQL نصيًا.

لـSqlBulkCopy عرّف column mappings وbatch size وtimeout وtransaction
وسلوك القيود/triggers والـidentity صراحةً. bulk copy لا يقدم upsert أو
audit أو tenant enforcement تلقائيًا؛ قيّم staging ثم validation ثم merge
أعمال مضبوط، مع تنظيف واستئناف. لا تفرض MERGE SQL كحل افتراضي لكل حالة.

## تحقق على SQL Server

اختبر صفر/صف واحد/تكرار، NULL، العربية، decimal/bigint، فلاتر النطاق،
multi-mapping بلا children، rollback بين EF وDapper، stale rowversion،
cancel/timeout، استهلاك reader، واستقرار الذاكرة والاتصالات مع حجم ممثل.
قارن queries متكافئة النتائج والإسقاط؛ benchmark للمكتبة لا يثبت أداء التطبيق.

## مصادر
- [Dapper الرسمي](https://github.com/DapperLib/Dapper)
- [EF transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions)
- [EF connection resiliency](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency)
- [SQL Server TVPs](https://learn.microsoft.com/en-us/sql/connect/ado-net/sql/table-valued-parameters)
- [SqlBulkCopy](https://learn.microsoft.com/en-us/dotnet/api/microsoft.data.sqlclient.sqlbulkcopy)
