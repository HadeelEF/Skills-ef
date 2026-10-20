# توثيق Backend والمعمارية والتصميم

اختر المخرج من السؤال والجمهور ومرحلة المشروع. HLD يثبت حدود الحل
والقرارات والخصائص غير الوظيفية؛ LLD يجعل المكونات والعقود والمعاملات
قابلة للتنفيذ. لا تعِد تسمية الوصف نفسه مرتين ولا تضع كودًا تفصيليًا
في HLD بلا حاجة. وثيقة Solution Architecture يمكن أن تضم backend
HLD مع frontend/data/deployment؛ احترم هيكل docs المعتمد.

## اختر القالب المناسب

| المخرج | القالب في assets/templates | شرط اكتماله |
| --- | --- | --- |
| HLD | backend-hld.md | قرارات مبررة ومتطلبات قابلة للقياس ومكونات وملكية وثقة وتوافر |
| LLD | backend-lld.md | use cases/DTOs/قواعد/معاملات/أخطاء/ملفات/اختبارات متطابقة |
| API design | api-design.md | OpenAPI أو عقد مكافئ مع auth/errors/concurrency/examples |
| Database design | database-design.md | ERD والقاموس والقيود وDDL/query map متطابقة |
| Jobs/files/audit | jobs-files-audit-design.md | حالات وتسليم وتكرار وتعويض وصلاحيات وتحقق لكل أثر |
| IIS operations | iis-runbook.md | نشر/تشخيص/تراجع وجلسات/هوية/ملفات ونتائج قابلة للتجربة |
| Architecture decision | adr.md | سياق وخيار وبديل وتبعات ودليل وسبب إعادة النظر |
| Verification | verification-plan.md | مخاطر وسيناريوهات وبيئة ومعيار نجاح ونتيجة فعلية |

هذه قوالب يعاد استخدامها، لا وثائق مكتملة. استبدل {{...}} ببيانات
المشروع، وصرح بالمجهول ومالكه وأثره. لا تحول placeholder إلى افتراض
معتمد، ولا تصف الوثيقة Approved دون دليل اعتماد. احذف الأقسام غير
المنطبقة مع سبب موجز عندما يكون غيابها مؤثرًا، ولا تملأها بنص عام.

## ابن حزمة مترابطة

1. اقرأ BRD/SRS وNFR والمتطلبات الأمنية والتصميم القائم. أنشئ قائمة
   decisions/unknowns، وحدد المطلوب تصميمه مقابل الموجود في الكود.
2. اربط Requirement ID → component/use case → contract/data rule →
   verification evidence. استخدم IDs ثابتة وtraceability تناسب المشروع.
3. ارسم C4 context/container عند فائدة الحدود، وcomponent diagram
   للوحدة المعقدة، وsequence للمعاملة/الفشل، وERD للبيانات. ميز C4
   container عن Docker container؛ الأول وحدة تشغيل/تخزين معمارية.
4. دوّن trust/process/transaction boundaries والـdata ownership
   والـsource of truth. لا تجعل سهم HTTP يخفي authentication أو timeout.
5. اكتب happy path وحالات الفشل والتزامن والتعافي. حدد error contract
   ومعنى 202/409/412 والـunknown outcome ومصير مدخلات المستخدم.
6. اربط LLD بمشاريع وfeatures وDI وSQL/migration فعلية؛ في greenfield
   سمِّها proposed. لا تدع معمارية الوثيقة تخالف implementation بصمت.
7. راجع اتساق أسماء DTOs/columns/states/statuses وعمليات النشر، ثم
   سلم decision-ready أو implementation-ready بحسب الطلب وأدلة التحقق.

## جودة الوثيقة

حدد version/status/owner/scope والمصادر وتاريخها وقرار كل assumption.
NFR مثل «سريع وآمن» غير قابل للقبول؛ اطلب أو اقترح هدفًا معلن الافتراض
مع workload وطريقة قياس. لا تخترع RTO/RPO أو retention قانونية.
حافظ على صياغة عربية واضحة وRTL في المخرج المناسب؛ الكود والمعرفات
والعقود دقيقة وقابلة للنسخ. اقرأ مهارة DOCX/PDF عند طلب الصيغة المطلوبة.

لا تفرض إنشاء الملفات الثمانية لمهمة صغيرة. حدّث موضع الحقيقة في docs
وأبق ADR مقتضبًا؛ تجنب تكرار API schema في عدة وثائق تتباعد مع الوقت.
