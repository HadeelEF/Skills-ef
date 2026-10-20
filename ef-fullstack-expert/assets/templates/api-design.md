# {{اسم API}} — تصميم العقود

الإصدار/الحالة/المالك: {{قيم}}. مصدر العقد: {{OpenAPI/ملف رئيسي}}.
المستهلكون وسياسة التوافق: {{React/mobile/integration}}.

## 1. المعايير المشتركة
حدد base path وversioning عند الحاجة، وauthentication وscopes/policies،
وصيغة IDs وmoney/date/time/enum/null، وProblemDetails وtraceId الآمن.
حدد pagination/sort/filter allowlists وlimits وrate limits والتعامل مع 429.

## 2. سجل العمليات
| Operation ID | Method/Route | Actor/Resource policy | Request | Success | Failures |
| --- | --- | --- | --- | --- | --- |
| {{OP}} | {{POST /...}} | {{صلاحية ونطاق}} | {{Schema}} | {{Status/headers/schema}} | {{400/401/403/404/409/412/… ومعناها}} |

## 3. تفاصيل العملية {{OP-ID}}
- النية وPre/Postconditions: {{مرجع use case}}.
- مصادر route/query/header/body والـContent-Type: {{تعريف}}.
- حقول server-owned التي لا يسمح للعميل بتغييرها: {{قائمة}}.
- If-Match/rowversion وno-op/duplicate/idempotency: {{سلوك صريح}}.
- 202 وstatus resource والـpolling والنتيجة المنتهية: {{عند الحاجة}}.
- timeout/cancellation والنتيجة غير المعلومة: {{طريقة الاستعلام/المصالحة}}.
- request/response وأخطاء أمثلة منزوعة الحساسية: {{JSON/HTTP}}.

## 4. الملفات والأمان والتوافق
حدد upload/download authorization وsize/signature/quarantine وheaders
والـsigned URL lifetime عند انطباقها. وثق CSRF/CORS حسب نمط الهوية.
حدد breaking-change policy ونسخ العملاء المتزامنة ومدة الانتقال المعتمدة.

## 5. اختبار العقد
| السيناريو | المتوقع | عميل/اختبار | نتيجة فعلية |
| --- | --- | --- | --- |
| {{صلاحية/NULL/دقة/تزامن/headers}} | {{معيار}} | {{رابط}} | {{حالة}} |

بوابة المراجعة: وثيقة OpenAPI توافق endpoint فعليًا؛ generated client
يفهم الأخطاء والدقة؛ الاستجابة الخاصة لا تتسرب عبر cache أو أمثلة docs.
