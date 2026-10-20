# {{اسم التطبيق}} — دليل نشر وتشغيل IIS

الحالة/الإصدار/المالك/البيئة: {{قيم}}. نطاق التفويض: {{تحضير/UAT/Prod}}.

## 1. مصفوفة البيئة
| العنصر | القيمة ومصدر التحقق |
| --- | --- |
| OS/IIS/Hosting Bundle/Runtime | {{نسخ وتوافق}} |
| Artifact/RID/hosting model | {{معرف وموقع آمن}} |
| Site/App Pool/bindings/TLS | {{إعدادات}} |
| Runtime/deploy identities | {{ACL/SQL/SMB}} |
| Secrets/config/keys/uploads | {{مواقع دون قيم سرية}} |
| Worker process/scheduler | {{خدمة مستقلة/داخل الموقع وسبب}} |
| React routes/API paths | {{fallback وحدود cache}} |

## 2. ما قبل النشر
حدد build/tests وartifact integrity وschema compatibility وbackup/restore
والنسخة السابقة والشهادات ومساحة القرص ونافذة التوقف أو traffic drain.
وثق preconditions التي إن فشلت تمنع النشر، والجهة المخولة لاتخاذ القرار.

## 3. خطوات النشر
| الترتيب | الإجراء والهدف المحدد | المتوقع | التعامل مع الفشل |
| --- | --- | --- | --- |
| {{رقم}} | {{أمر/إجراء مطابق للبيئة}} | {{علامة نجاح}} | {{توقف/تراجع}} |

افصل migration عن startup؛ تجنب restart لجميع المواقع. احفظ uploads
والـkeys خارج release ولا تمسحها عند تنظيف النسخة السابقة.

## 4. فحص ما بعد النشر
اختبر TLS/login وcookie بعد recycle وصلاحية ممنوعة وwrite/readback
وprivate file وReact deep link وworker. حدد checks ومسؤولها وأدلتها.

## 5. التشخيص
| العارض/status | أين نجد الدليل | الفرضيات | الإجراء المحدود |
| --- | --- | --- | --- |
| {{حالة}} | {{IIS/Event Viewer/app/trace}} | {{قائمة قصيرة}} | {{خطوة}} |

stdout مؤقت للتشخيص مع ACL/cleanup؛ لا Development في الإنتاج ولا أسرار في المرفقات.

## 6. التراجع والتعافي
حدد trigger للتراجع ومالك القرار وartifact/config compatible وطريقة
تحويل الحركة. بين حالة DB التي تسمح بتراجع binaries وحالات forward fix
أو restore. سجل RTO/RPO المعتمدين ونتيجة تجربة الاستعادة.

## 7. التسليم
سجل المنفذ والتاريخ والنتيجة والملاحظات المتبقية وروابط الأدلة؛ لا تعلن
نجاح نشر بناءً على publish أو health endpoint فقط.
