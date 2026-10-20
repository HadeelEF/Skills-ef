# EF Core المتقدم: النموذج والاستعلام والتشغيل

## المحتويات
- نموذج المجال وmapping
- الاستعلامات والأداء
- الكتابة والتزامن
- السياقات والترحيل والتحقق

## صمم mapping من المعنى

اقرأ schema ownership وprovider/version أولًا. استخدم IEntityTypeConfiguration
لتنظيم mapping عندما يفيد، وافحص اكتشافه فعليًا. domain purity لا تعني
أن كل class يجب أن يطابق جدولًا أو أن كل property صالحة للتخزين.

| الحاجة | خيارات ومخاطر |
| --- | --- |
| Value object | owned/complex type/value converter حسب الإصدار؛ فرق الهوية والمشاركة وnullability ودعم الاستعلام |
| Inheritance | TPH/TPT/TPC وفق الاستعلامات والقيود؛ TPT قد يكثر joins وTPC يحتاج سياسة مفاتيح متوافقة |
| Relationships | principal/alternate/composite keys وFK صريحة؛ راجع shadow FK غير المقصودة |
| JSON | مناسب لجزء مرن محدد؛ تحقق من provider/version والترجمة والفهرسة وترقية الشكل |
| Conversion | حدد round-trip وnull/precision وValueComparer للقيم mutable عند الحاجة |
| Generated fields | defaults/computed/rowversion والقيم المعادة؛ لا يكتب client حقولًا يملكها DB |
| History | temporal/history/soft-delete لكل منها معنى؛ لا تعتبرها business audit |

لـTPH discriminator ولـmany-to-many payload ولـtable splitting راجع
SQL الفعلي ودلالات deletion والتحديث. لا تضف inheritance لمجرد تقليل
تكرار خصائص قليلة. امنع علاقة child من نطاق مختلف بFK مناسبة، لا filters فقط.

## صمم الاستعلام ثم راقب SQL

ابدأ projection محدودًا إلى DTO، ومرر cancellation. حدد tracking المطلوب؛
AsNoTrackingWithIdentityResolution قد يفيد graph للقراءة ولكنه ليس
مجانيًا. لا تدع lazy loading يطلق queries أثناء serialization.

Single query قد يضاعف النتائج مع collections متعددة. AsSplitQuery
يغير عدد الرحلات والاتساق؛ عند تحديث متزامن لا تضمن القراءات المتفرقة
snapshot واحدة بلا سياسة isolation. في paging استخدم ترتيبًا unique،
وراجع تحذيرات/قيود الإصدار، ولا تعمم split mode على كل queries.

افحص ToQueryString للتشخيص ثم SQL/parameters والـplan المنفذين؛ طريقة
الـterminal operator قد تغير SQL. tag queries بعلامات ثابتة مفيدة؛ لا
تدخل PII أو IDs غير محدودة في tags أو metrics. حافظ على query shape
مستقرة وparameters بدل تعبيرات ثابتة ديناميكية تفسد reuse.

قِس compiled queries عندما تصبح كلفة compilation مهمة؛ compiled model
يحسن جانبًا مختلفًا من startup/model creation. لا يسرع أي منهما SQL
سيئًا أو network بطيئة. تحقق من دعم model/provider وقيود الإصدار/AOT.
لا تضع ToList أو AsEnumerable قبل filters المطلوبة ثم تعتبرها server query.

## اجعل الكتابة صريحة

حدد الأصل المتوقع للـrowversion في tracked updates، وطابقه بعقد ETag.
لا Update(entityGraph) لمدخل عميل غير موثوق. ميز no-op عن فحص version
المطلوب حتى لو لم يصدر UPDATE؛ اقرأ مرجع البيانات والتزامن.

ExecuteUpdate/ExecuteDelete تنفذ مباشرة دون ChangeTracker أو SaveChanges
ولا تجمع الاستدعاءات في معاملة واحدة تلقائيًا. ضع expected version/state
في predicate وتحقق من affected count؛ concurrency checking ليست تلقائية.
قد يبقى tracked object قديمًا ثم يكتب فوق النتيجة؛ أعد تحميله أو افصل المسار.
صمم audit/business events للـbulk/raw SQL صراحةً، واختبر عدم تجاوز النطاق.

احفظ business change وaudit/outbox في نفس transaction عند الحاجة. Interceptor
يفيد للمعلومات التقنية لكنه لا يعرف وحده intent أو كل مسارات الكتابة.
راع retry وEventId ثابتًا حتى لا تتكرر records. لا تنفذ HTTP جانبيًا من interceptor.

## اضبط DbContext والاتصال

DbContext غير آمن للتزامن. scope لكل request/use case أو job iteration؛
للمعالجات المتوازية factory وسياقات منفصلة مع توازي محدود. context pooling
مختلف عن connection pooling؛ لا تضع tenant متغيرًا في OnConfiguring
وتتوقع تشغيله لكل طلب. مرر السياق الموثوق واضبط/reset custom state
والاتصال المستعار وفق دورة الحياة، واختبر التبديل بين مستأجرين.

Query filters وسيلة مساعدة، وليست resource authorization. أي
IgnoreQueryFilters/raw SQL/admin path يحتاج فحصًا: تعطيل soft-delete
قد يعطل tenant filter معه حسب التكوين/الإصدار. tested filters لا تغطي
خدمة أخرى تكتب SQL مباشرة. حدد global defaults لكل context وقارنه بالواقع.

عند مشاركة EF وDapper اقرأ المرجع المتخصص. نسق execution strategy مع
المعاملة اليدوية ووحدة إعادة المحاولة الكاملة. راجع savepoints وMARS
والـunknown commit؛ لا تجعل retries تعيد side effects غير محمية.

## رحل واختبر النموذج

احفظ migrations وsnapshots في مصدر واحد، وراجع SQL وحجم القفل ومساحة
الـlog وخطة backfill. لا تُشغّل migrations تلقائيًا من جميع نسخ الإنتاج.
اختبر clean create وupgrade من نسخة قائمة وتوافق application N/N-1 عند
rolling deployment. generated idempotent script لا يكتشف كل schema drift.

اختبر SQL Server حقيقيًا للعربية وdecimal/NULL/rowversion/constraints،
ومثال duplicate وstale write وno-op وcross-scope وrollback وbulk audit.
لا EF InMemory ولا mocks تثبت هذه الضمانات. أفصح عن build مقابل تشغيل DB.

## مصادر
- [Advanced performance](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics)
- [Single/split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries)
- [ExecuteUpdate/Delete](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete)
- [Inheritance](https://learn.microsoft.com/en-us/ef/core/modeling/inheritance)
- [Value conversions](https://learn.microsoft.com/en-us/ef/core/modeling/value-conversions)
