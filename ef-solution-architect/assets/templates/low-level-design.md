# Low-Level Design (LLD) — [الحل/الوحدة/القدرة]

> قد تغطي LLD حلًا كاملًا أو وحدة محددة؛ صرّح بالنطاق. قدّم تفاصيل تكفي للتنفيذ
> دون إعادة اتخاذ القرارات الجوهرية. هذه وثيقة تصميم وليست تطبيقًا منفذًا.

## 1. المرجعية والتغطية

[الإصدار والحالة والمالك؛ روابط وإصدارات BRD/SRS/HLD/SAD/ADRs؛ المتطلبات
وحالات الاستخدام المغطاة؛ القيود والافتراضات والقرارات المؤثرة المتبقية.]

## 2. التفكيك والعقود الداخلية

| المكون/الوحدة | المسؤولية والمسار القائم/المقترح | واجهته العامة | الاعتماديات المسموحة | ملكية البيانات والحالة |
| --- | --- | --- | --- | --- |

[Component/class relationships عند فائدتها، composition/configuration ownership،
اتجاه الاعتماديات. حدد حدود ما يختاره المنفذ محليًا.]

## 3. حالات الاستخدام والثوابت

| العملية | الفاعل والصلاحية | الشروط والمدخلات | قواعد العمل والتحقق | المعاملة والنتيجة | استثناء/تعارض |
| --- | --- | --- | --- | --- | --- |

[Sequence/state diagrams للنجاح والفشل المهم؛ DTO/schema أو pseudocode إذا
أزال غموضًا. حدد التزامن وidempotency والآثار الخارجية والنتيجة المجهولة.]

## 4. تصميم Backend أو منطق المنصة

[لـ.NET: endpoints/handlers/services، عقود module، validation/authorization،
المعاملات وORM/SQL mapping، lifetimes، outbound adapters، jobs/events/cache.
لـMendix: modules/domain/access/pages/flows/workflows ومappings. لـSharePoint:
content types/lists/libraries، publication/permissions، امتدادات مدعومة وعقودها.]

## 5. تصميم Web وMobile

[routes/screens/features/components ومسؤولياتها، loading/error/empty/forbidden،
server/UI/form/URL state وcache lifecycle، عميل API، sessions/account switch،
RTL/accessibility. للجوال/PWA عند انطباقهما: native/storage/offline/sync/update
contracts. اربط UX ولا تعِد رسم التصميم البصري دون طلب. احفظ مسار المنصة المختارة.]

## 6. تصميم البيانات التفصيلي

| جدول/كيان/وثيقة | الحقول والأنواع والدقة والإلزامية | المفاتيح والعلاقات والقيود | version/retention | الفهرس ومبرر الاستعلام |
| --- | --- | --- | --- | --- |

[ERD، mappings، atomic boundary/isolation، القراءة والكتابة، schema evolution
والترحيل. احفظ قواعد بيانات Mendix/SharePoint ضمن آليات المنصة المدعومة.]

## 7. عقود API والتكامل والأحداث

| العملية/العقد والإصدار | الهوية/المستهلك | request/response/schema | الأخطاء والمهلة | retry/dedup/order | التوافق والمالك |
| --- | --- | --- | --- | --- | --- |

[أمثلة payload/error عند الحاجة، الترقيم/الفلترة والأنواع عبر القنوات، المرفقات،
الأحداث والـcheckpoints والحذف والمطابقة. اربط مصدر OpenAPI/العقد دون ازدواج.]

## 8. الأمن والتشغيل والتعافي

[نقاط فرض الصلاحية، أسرار وشهادات بمراجع دون قيم، configuration keys ومعانيها،
الأحمال والحدود، logs/metrics/traces/audit، IIS/worker lifecycle، dependencies،
نقاط الفشل والتعافي والملكية. لا تختلق IPs أو إعدادات معتمدة.]

## 9. التنفيذ والتوافق والتحقق

| المتطلب/القرار | عنصر التصميم | شريحة التنفيذ/المسؤول | مثال قبول وحالة فشل | نوع الدليل وحالته |
| --- | --- | --- | --- | --- |

[خطة شريحة متكاملة، ترتيب الاعتماديات، توافق نسخ API/schema/client، release
وmigration/rollback limits. راجع اتصال هذه التفاصيل بـHLD وقراراته.]

## 10. حدود المراجعة والقرارات المفتوحة

[ما فُحص، ما استُنتج، ما ينتظر دليلًا، أثره وما يمنعه فعلًا؛ ادعاءات الجاهزية
تتناسب مع الأدلة. لا تصف مخططًا أو pseudocode بأنه تنفيذ مختبر.]
