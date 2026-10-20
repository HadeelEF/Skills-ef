# تصميم ميزة واجهة: {{feature_name}}

> استبدل كل `{{...}}` بمعلومة موثقة أو "مجهول: ..." صريح. احذف الأقسام غير المنطبقة مع سبب.

## 1. الهدف ومعايير القبول
- مهمة المستخدم: {{task}}
- معايير قبول قابلة للملاحظة (بيانات، صلاحيات، حالات، RTL/لوحة مفاتيح): {{criteria}}

## 2. الشاشات والحالات
| الشاشة/المكون | loading | empty | error | success | pending | no-permission |
| --- | --- | --- | --- | --- | --- | --- |
| {{screen}} | | | | | | |

## 3. ملكية الحالة
| الحالة | النوع (server/URL/form/local/global) | المالك | مفتاح أو مسار |
| --- | --- | --- | --- |

## 4. العقود مع .NET
| العملية | endpoint | الطلب | النجاح | الأخطاء (ProblemDetails) | التزامن (ETag/Idempotency) |
| --- | --- | --- | --- | --- | --- |

## 5. الـcache
- query keys (factory): {{keys}}
- staleTime/gcTime ومبررها: {{freshness}}
- مصفوفة invalidation لكل mutation: {{matrix}}
- optimistic أم pessimistic ولماذا: {{decision}}

## 6. الصلاحيات
- مصدر الصلاحيات في الواجهة (`allowedActions`/session): {{source}}
- التفويض في الخادم لكل endpoint: {{server_authz}}

## 7. التوجيه وURL
routes، params وتحققها، search params وschema، lazy loading، ErrorBoundary، حارس التغييرات غير المحفوظة.

## 8. Realtime (إن وجد)
الحدث، المجموعة، النسخة لمنع التكرار، resync بعد reconnect.

## 9. الإتاحة واللغتان
landmarks، focus بعد الإجراءات والتنقل، أنماط ARIA للمكونات المركبة، نصوص وجمع عربي، أرقام وتواريخ، RTL في portals.

## 10. الأداء
ميزانية الحزمة للـroute، حجم البيانات المتوقع وصفحاته، ما يُقاس ومتى.

## 11. الأمان والرصد
محتوى غير موثوق يُعرض، أسرار، PII، أخطاء متوقعة لا تُبلّغ، traceId للمستخدم.

## 12. خطة التحقق
| السيناريو | المستوى (unit/feature/contract/e2e/visual/a11y) | الأمر | النتيجة |
| --- | --- | --- | --- |
