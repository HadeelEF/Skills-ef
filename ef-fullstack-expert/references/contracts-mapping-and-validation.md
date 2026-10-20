# DTOs وMapping وFluentValidation

## صمم العقد قبل mapper

افصل create/update requests وresponses وread models وpage view models
عن persistence entities بحسب اختلاف المسؤولية. لا تعرض entity graph أو
IQueryable في API. لا تضاعف DTOs لمجرد طبقة إضافية لا تغير العقد.

- حدد naming وnullability والحدود وmoney/date/enum serialization والنسخة
  والتوافق. اجعل pagination والفرز والترشيح محدودة ومستقرة.
- في PATCH ميز absent عن null وعن default؛ اختبر collection replacement
  وclear intent. لا يعبر DTO عادي دائمًا عن هذه الفروق؛ اختر عقدًا صريحًا.
- اجعل الحقول المسموح تغييرها allowlist. TenantId وOwnerId وroles
  وCreatedBy وحالات أعمال محمية لا تصبح موثوقة لأنها موجودة في DTO.
- يحمل طلب update expected concurrency token عند الحاجة؛ طبّقه على
  OriginalValue أو conditional update، لا على نسخة قرأها الخادم للتو.
- عرف أخطاء الحقول بأسماء مستقرة وProblemDetails/ValidationProblemDetails
  وعقد 400/422/409/412 يناسب المشروع؛ لا تختزل التعارض إلى validation عادي.

## اختر mapping بحسب الكلفة والوضوح

| الخيار | نقطة قوة | ما يجب فحصه |
| --- | --- | --- |
| explicit/manual mapping | تغييرات أمنية واضحة وعقود صغيرة وتحويلات أعمال | تكرار يمكن صيانته، واختبارات الحقول الحساسة والتحويلات |
| AutoMapper | conventions وprofiles وتكامل قائم | config validation وprojection وترخيص الإصدار والتشخيص |
| Mapster | mapping وprojection وخيارات توليد حسب الإعداد | API/version الفعلي والتحقق من generated code وحدود EF translation |
| Mapperly | source-generated mappings وتشخيص وقت البناء | القيود والتحويلات وnullable/required members وquery projection المدعوم |

لا تفترض أن تغيير الحزمة يعالج تصميم عقد غير صحيح. افحص NuGet/الناشر
والترخيص والدعم والتوافق/AOT عند الحاجة؛ لا تصف AutoMapper بأنه مجاني
لأي استخدام استنادًا إلى نسخة قديمة. لا تدخل mapper جديدًا لعقد بسيط واحد.

ارسم allowlist صريحًا لتحديث tracked entity بعد authorization وتحميل
المورد في scope الصحيح. تجنب ReverseMap ثم Update(graph) لأوامر عامة؛
قد يعيد كتابة علاقات وملكية وحقول تدقيق لا يحق للعميل تغييرها.
لا تجعل mapper يجلب بيانات أو يطبق authorization أو يطلق side effects.

استخدم Select/projection قبل materialization لقراءات كبيرة؛ في AutoMapper
طبّق entity filters/sorting ثم ProjectTo كمرحلة إسقاط، وفق وثائق الإصدار.
تحقق من SQL/translation مع provider الحقيقي، لا من compilation وحده.
اختبر nullability والتحويلات والـnested collections وتجنب N+1 أو client
evaluation غير مقصود. config validation لا يثبت صحة SQL أو قواعد الأعمال.

## افصل طبقات validation

1. boundary: format/required/range/size وshape.
2. use case/domain: صلاحية الانتقال وقواعد الأعمال بين الحقول والكيانات.
3. database: uniqueness وFK/check constraints والمعاملات والتزامن.

فحص uniqueness قبل الحفظ يحسن الرسالة، لكنه لا يمنع سباق طلبين؛ اعتمد
قيد DB وترجم الخطأ المعروف دون تسريب بيانات أو ابتلاع أخطاء غير متوقعة.
client validation لتحسين التجربة ولا يغني عن server validation.

مع FluentValidation استخدم validators موجهة للعقد وDI مناسبًا، مع
RuleFor/child rules وconditions ورسائل/رموز مستقرة وlocalization عند الحاجة.
لا تسجل validator singleton يعتمد على DbContext scoped.
استدعِ ValidateAsync مع cancellation لكل قواعد MustAsync/CustomAsync؛
لا تمررها إلى MVC automatic validation المتزامن، ولا تحل المشكلة بـResult.
في Minimal APIs أو filters/pipeline تأكد من التسجيل والتنفيذ الفعليين،
ومن أن المسار لا يحفظ عند فشل validation. لا تفترض سلوك template قديم.

اجعل الفحوص الخارجية محدودة ومحكومة بالمهلة؛ لا تحقق من شبكة مع كل
keystroke. authorization عملية مستقلة؛ لا تكشف وجود مورد محمي برسالة
validator قبل تحديد صلاحية الوصول إليه.

## تحقق من السلوك

جرّب malicious extra fields وnull/absent وتحديث علاقات غير مسموحة،
stale rowversion وduplicate متزامن، async validation فاشل/ملغى، واستعلام
projection على provider المستهدف. افحص response الفعلي وأسماء أخطاء الواجهة.

## مراجع رسمية

- [AutoMapper projection](https://docs.automapper.io/en/stable/Queryable-Extensions.html)
- [AutoMapper licensing](https://docs.automapper.io/en/stable/License-configuration.html)
- [Mapster](https://github.com/MapsterMapper/Mapster)
- [Mapperly](https://mapperly.riok.app/docs/intro/)
- [FluentValidation async](https://docs.fluentvalidation.net/en/latest/async.html)
