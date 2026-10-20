# {{الوحدة/الميزة}} — التصميم التفصيلي للـBackend (LLD)

الحالة: {{Draft/Reviewed/Approved بدليل}} — الإصدار: {{نسخة}} — المالك: {{اسم}}
المتطلبات وHLD/ADRs المعنية: {{روابط دقيقة}}. الموجود/المقترح: {{تمييز}}.

## 1. حالة الاستخدام وحدود المسؤولية
| UC-ID | Actor/النطاق | النية والنتيجة | Preconditions | Postconditions |
| --- | --- | --- | --- | --- |
| {{UC}} | {{هوية موثوقة}} | {{عمل}} | {{قواعد}} | {{ما يلتزم}} |

## 2. العقود ومصدر الحقول
| الحقل | النوع/الحدود/NULL | مصدره الموثوق | Validation | حساسية/تسلسل |
| --- | --- | --- | --- | --- |
| {{اسم}} | {{C#/JSON}} | {{client/server/DB}} | {{قاعدة}} | {{قرار}} |

اربط API schema الرئيسية دون نسخ منافس. حدد version/ETag/idempotency
وأخطاء الحقول وقيم enum وprecision/timezone/absent مقابل null.

## 3. القواعد والحالة والصلاحيات
| Rule-ID | القاعدة/الانتقال | شرط authorization | موضع الفرض | سيناريو رفض |
| --- | --- | --- | --- | --- |
| {{R}} | {{من/إلى وشروط}} | {{actor/resource/scope}} | {{handler/DB}} | {{مثال}} |

## 4. تسلسل التنفيذ والمعاملة
ارسم sequence يبين load/authorize/validate/conditional write/audit/outbox/
commit/response عند انطباقها. حدد transaction owner وisolation وlocks
وexpected version والـno-op وrequest duplicate وunknown commit.

| نقطة الفشل | الحالة الدائمة المتبقية | retry/تعويض | نتيجة العميل |
| --- | --- | --- | --- |
| {{نقطة}} | {{حقيقة}} | {{ضمان وحدود}} | {{HTTP/operation status}} |

## 5. البيانات والاستعلامات
اربط الجداول والمفاتيح والقيود والـmigration من DB design. حدد query
shape/index/projection/paging وEF/Dapper وconnection ownership وتغير
ChangeTracker عند raw SQL. عالج multi-row invariants والتزامن.

## 6. خريطة التنفيذ
| المشروع/الملف | المسؤولية | الاعتماديات وعمر DI | العقد/الاختبار |
| --- | --- | --- | --- |
| {{مسار حقيقي/مقترح}} | {{مهمة}} | {{scoped/singleton}} | {{مرجع}} |

## 7. الآثار والتشغيل
حدد jobs/cache invalidation/files/integrations وaudit وtrace/metrics
وsecrets/configuration. اربط التصميم المتخصص دون افتراض atomicity خارج DB.

## 8. معايير القبول والتحقق
| الحالة | المدخل/البيئة | المتوقع | الدليل/الحالة |
| --- | --- | --- | --- |
| {{نجاح/منع/سباق/إلغاء/فشل جزئي}} | {{محدد}} | {{قابل للقياس}} | {{لم ينفذ/نتيجة}} |

بوابة المراجعة: يستطيع مطور تتبع الطلب حتى commit؛ كل invariant له
موضع فرض؛ route/DTO/DDL/DI متطابقة؛ لا جزء موصوف كمكتمل دون تنفيذ مثبت.
