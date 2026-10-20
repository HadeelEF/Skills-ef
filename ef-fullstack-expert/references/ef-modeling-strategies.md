# EF Core: Database First وCode First

صمم النموذج وفق مرجع نمذجة قواعد البيانات قبل تحويله إلى entities.
راجع تطابق candidate/composite keys وFK وprecision والقيود وسلوك الحذف
بين ERD وEF configuration والـschema الفعلية، خصوصًا عزل tenant/workspace.
لا تعتبر نجاح scaffolding أو migration دليلًا على صحة نموذج المجال.

## حدد مصدر حقيقة الـschema

| المسار | مصدر التغيير | طريقة العمل |
| --- | --- | --- |
| Code First + migrations | model/configuration يملكه فريق التطبيق | migration مراجعة، SQL/bundle مناسب، وخطة نشر واسترداد |
| Database First / reverse engineering | schema يملكه DBA أو نظام قائم | schema change معتمد ثم scaffold/diff وتخصيص خارج generated files |
| مسار مختلط مضبوط | ملكية محددة لكل schema/module | قاعدة واحدة معلنة لكل جزء، دون أداتين تعدلان الكائنات نفسها عشوائيًا |

وجود DB مسبقًا لا يحدد المسار وحده؛ اسأل من يملك تغييرها وكيف تُنشر.
ميز EF Core reverse engineering عن EF6 EDMX designer؛ لا تعطِ أوامر
EF6 لمشروع EF Core أو العكس. اقرأ provider/version/tooling والـmodel الفعلي.

## نفّذ Database First قابلًا للتكرار

اختر schemas/tables الضرورية وDbContext/output directories والتسمية
وnullability. استخدم connection name/configuration آمنا، وراجع دعم
`--no-onconfiguring` في الأداة؛ لا تطبع connection string سرية في أمر
أو generated code أو تقرير. ثبّت نسخة dotnet-ef بما يناسب المشروع.

احتفظ بتخصيصات partial classes وOnModelCreatingPartial/configuration
والـDTOs خارج الملفات التي يعيد scaffolding كتابتها. نظم إعادة التوليد
في مسار قابل للمقارنة، وافحص diff قبل استبدال ملفات معدلة. force overwrite
ليس وسيلة لحفظ customization. احفظ اختيارات scaffold كعملية قابلة للتكرار.

راجع بعد التوليد PK/FK وnullable وprecision/defaults/computed columns
وrowversion وindexes وdelete behavior وviews/keyless entities. scaffold
لا يستنتج كل domain rule أو authorization، ولا يمثل كل خصائص DB تلقائيًا.
لا تضف migration لإعادة إنشاء DB تديرها جهة أخرى دون قرار ملكية واضح.

## نفّذ Code First بصورة قابلة للنشر

- صمم entity/configuration والقيود والفهارس والتزامن حسب الاستعلامات
  وقواعد الأعمال؛ لا تبدأ بعكس DTO مباشرة إلى جدول بلا تصميم.
- راجع migration وSQL الناتج؛ rename قد يُفهم drop/add، وbackfill قد
  يقفل جدولًا كبيرًا. افحص defaults وnullable والـFK وسلوك delete.
- افصل إنشاء schema عن runtime account بصلاحيات أقل. لا تطبق migrations
  تلقائيًا عند startup على كل نسخة إنتاج. اختر deploy step بمالك واحد.
- استخدم expand/contract للتوافق بين نسختي التطبيق، مع backfill قابل
  للاستئناف والتحقق، وتأخير إزالة الحقول حتى زوال القراءات القديمة.
- اختبر على نسخة تمثيلية وحجم مناسب؛ script idempotent يفحص history
  ولا يصلح schema drift غير معروف تلقائيًا. migration rollback قد يفقد
  بيانات؛ قدم forward fix/restore وتحقق backup وفق الحالة.

عند تبني migrations لقاعدة قائمة، قارن schema وmodel وmigration history،
وصمم baseline موثقًا قابلًا لإعادة الإنشاء على DB جديدة قبل تسجيله.
لا تطبق InitialCreate على جداول موجودة، ولا تزور history أو تحذفها
لمجرد إسكات الخطأ. نسق الإجراء مع مالك DB ضمن صلاحية المشروع.

## اختر نمذجة واستعلامات تناسب المورد

راجع owned/value objects أو complex types/inheritance/value converters
حسب دعم الإصدار والمزوّد وتكلفة queries/migrations. افصل read models عند
الحاجة؛ استخدم views أو stored procedures القائمة بعقود واضحة وparameters.
keyless entity ليست بديلًا عشوائيًا لهوية سجل قابل للتعديل.

حدد tenant/soft-delete filters واختبر كل مسار تجاوز مقصود. filter ليس
حماية لكل raw SQL أو bulk update. لا تعتمد على قيمة tenant يرسلها العميل.
للسياقات المتعددة حدد ملكية الجداول والمعاملة، وتجنب تداخل migrations.
راعِ connection pooling وDbContext lifetime والتوافق مع provider الحقيقي.

## تحقق من النموذج والتشغيل

راجع عقد البيانات عبر DB → C# DTO → JSON → TypeScript: bigint/decimal
وNULL/date-only وconcurrency token. اختبر قيمًا حدية فعلية وإعادة القراءة؛
نوع TypeScript وحده لا يحفظ دقة JSON ولا يفرض database constraint.

اختبر DB جديدة ومسار upgrade لقاعدة قائمة، regeneration دون خسارة
customization، constraints/precision/concurrency، وعمليات no-op وbulk
التي قد تتجاوز المسار المعتاد. استخدم DB provider ممثلًا؛ EF InMemory
لا يثبت SQL أو transactions أو rowversion. راجع مرجع البيانات والتزامن أيضًا.

## مراجع رسمية

- [EF Core reverse engineering](https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/)
- [EF Core migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Applying migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying)
