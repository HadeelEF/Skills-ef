# استراتيجية اختبار الـBackend

اقرأ عند تصميم اختبارات لميزة backend مؤثرة أو بناء بنية اختبار لمشروع. الهدف
إثبات الضمانات (تفويض، معاملة، تزامن، عقد) لا رفع عدد الاختبارات.

## اختر مستوى الاختبار من الخطر

| المستوى | يثبت | لا يثبت |
| --- | --- | --- |
| Unit | policy خالصة، حسابات، انتقالات حالة | SQL، middleware، serialization |
| Integration (WebApplicationFactory + SQL حقيقي) | الرحلة عبر HTTP والتفويض والمعاملة والقيود | سلوك IIS/الشبكة الإنتاجية |
| Contract | توافق العقد مع المستهلك أو المزود | منطق الأعمال الداخلي |
| E2E/Browser | رحلة المستخدم كاملة | تغطية الحالات الحدية بكلفة معقولة |
| Load/Fault | السعة والتدهور والتعافي | الصحة المنطقية |

mocks لـDbContext أو repository تختبر تفاصيل التنفيذ لا الضمان؛ استخدمها لحدود
خارجية (SMS، بريد، API مزود) لا لقاعدة البيانات.

## بنية الاختبار التكاملي

- `WebApplicationFactory<Program>` مع استبدال الاعتماديات الخارجية فقط.
- SQL Server حقيقي عبر Testcontainers أو مثيل معزول؛ طبّق migrations الفعلية عند
  بدء المجموعة لا `EnsureCreated`، لتختبر نفس schema الإنتاج.
- إعادة الضبط بين الاختبارات بأداة تفريغ جداول (مثل Respawn) أو قاعدة لكل مجموعة؛
  المعاملة الملغاة قد تخفي سلوك commit وtriggers والمهام.
- مصادقة اختبارية: handler اختبار يصدر principal بclaims محددة، مع اختبار منفصل
  للتحقق الحقيقي من JWT (issuer/audience/expired).

## ما يجب اختباره دائمًا

- **التفويض**: لكل endpoint حساس هوية مسموحة وممنوعة ونطاق آخر (IDOR)، بما فيها
  البحث والتصدير والمرفقات والـjobs.
- **العقد**: status codes وProblemDetails ومفاتيح الأخطاء وheaders (ETag، Location).
- **القيود**: duplicate يعيد 409 المتفق عليه لا 500.
- **التزامن**: طلبان متداخلان على نفس المورد:

```csharp
var barrier = new Barrier(2);
var tasks = Enumerable.Range(0, 2).Select(_ => Task.Run(async () =>
{
    barrier.SignalAndWait();
    return await client.PostAsJsonAsync($"/api/stock/{id}/reserve", new { Quantity = 6 });
}));
var results = await Task.WhenAll(tasks);
// مخزون 10: يجب أن ينجح طلب واحد فقط ويعيد الآخر 409، والرصيد النهائي 4.
```

(`Task.Run` هنا لإطلاق متزامن في الاختبار، لا في كود الإنتاج.)
- **Idempotency**: نفس Idempotency-Key مرتين → أثر واحد ونفس النتيجة.
- **Jobs/outbox**: إيقاف بعد الأثر وقبل التعليم ثم إعادة التشغيل؛ نسختا worker.
- **Migrations**: من نسخة الإنتاج السابقة إلى الجديدة على بيانات ممثلة، وتشغيل N-1 بعد expand.

## contract tests

للمستهلكين المهمين أو التكاملات الخارجية: consumer-driven contracts أو اختبار
مقابل مواصفة OpenAPI المعتمدة، مع OpenAPI diff في CI لكشف الكسر قبل النشر.

## الحمل والفشل

اختبر الذروة المتوقعة بأداة حمل على بيانات ممثلة، وسجل p95/p99 ونقطة التشبع.
حقن الفشل في بيئة اختبار: إيقاف Redis، إبطاء API خارجية، قطع SQL مؤقتًا، recycle
أثناء job، وتحقق من السلوك في مصفوفة الفشل.
