# المثال الذهبي للواجهة: اعتماد طلب الشراء وإنشاؤه (React + ASP.NET Core)

**حالة الدليل (2026-10-05):** كود مُتحقق منه في بيئة إعداد المهارة بالأوامر التالية، وكلها نجحت:

| الأمر | ما يثبته |
| --- | --- |
| `npm run typecheck` | TypeScript 7.0.2 بإعدادات strict وnoUncheckedIndexedAccess وexactOptionalPropertyTypes |
| `npm run lint` | ESLint 10 بقواعد typescript-eslint المعتمدة على الأنواع وreact-hooks v7، بلا تعطيل لأي قاعدة داخل الكود |
| `npm run boundaries` | dependency-cruiser: لا استيراد لداخل feature أخرى، shared لا يعرف features، لا دورات |
| `npm run test` | 30 اختبارًا (Vitest 5 وTesting Library وMSW 3) على سلوك المستخدم والعقود |
| `npm run build` | Vite 8 مع فحص ميزانية JS الأولي: 130 KB gzip مقابل حد 150 KB |

**لم يُشغَّل:** `e2e/approveRequest.spec.ts` (Playwright)، لأنه يحتاج .NET API وقاعدة بيانات
وIdP. نجاح الاختبارات أعلاه لا يثبت cookies/CSRF الحقيقية ولا سلوك الخادم الفعلي.
الإصدارات مثبتة في package.json كما اختُبرت؛ تحقق من الأحدث قبل نسخها إلى مشروع.

**الغرض:** يُظهر ما تعنيه تعليمات المهارة في كود مترابط. ليس قالبًا يُنسخ كما هو.

## العقد مع الخادم

| المسار | المصدر |
| --- | --- |
| `POST /api/requests/{id}/approval` مع `If-Match`، و200/404/409(code)/412/428 وProblemDetails مع traceId | مطابق للمثال الذهبي في .NET (`../golden-use-case`) |
| `GET /api/requests/{id}` مع ETag و`allowedActions` | عقد مفترض مكمل؛ أضفه في الخادم بنفس التفويض المبني على المورد |
| `POST /api/requests` مع `Idempotency-Key` و400 `ValidationProblemDetails` | عقد مفترض مكمل؛ الخادم يجب أن يخزن نتيجة المفتاح |
| `RequestChanged { requestId, etag }` عبر `/hubs/requests` | عقد مفترض؛ إشعار لإعادة القراءة فقط |

## الملفات وما يثبته كل منها

| الملف | الضمان المعروض |
| --- | --- |
| `src/shared/api/http.ts` + `apiError.ts` | union مميز لكل فشل يعامله UI بشكل مختلف؛ HTML بحالة 200 ليس بيانات؛ schema drift خطأ عقد؛ timeout ≠ abort؛ `outcomeUnknown` للكتابة فقط؛ 401 بلا حلقة |
| `src/shared/forms/applyValidationProblem.ts` | `Items[1].UnitPrice` و`$.items[1].unitPrice` → `items.1.unitPrice`؛ ما لا يطابق حقلًا ظاهرًا يذهب للملخص ولا يضيع |
| `src/shared/session/sessionScope.tsx` | scope في كل query key + remount بالـkey: لا عرض لبيانات مستخدم سابق ولو في نفس commit |
| `src/shared/realtime/realtimeConnection.ts` | اتصال واحد ref-counted آمن مع StrictMode، تحميل كسول للعميل، listeners قابلة للإزالة، resync بعد reconnect أو restart |
| `src/app/queryClient.ts` | defaults المشروع: staleTime وretry حسب نوع الخطأ، ولا retry للكتابة |
| `src/features/requests/api/*` | zod عند الحدود، decimal كنص، ETag محفوظ مع البيانات، key factory، DI عبر context |
| `src/features/requests/hooks/useApproveRequest.ts` | pessimistic مقصود، setQueryData مكتوب الأنواع، ثم invalidation تبقي mutation pending حتى إعادة القراءة |
| `src/features/requests/components/ApproveRequestAction.tsx` | 412/409/429/500 بمسارات مختلفة، exhaustive switch، تحقق مشتق من البيانات بعد نتيجة مجهولة، focus إلى النتيجة |
| `src/features/requests/components/CreateRequestForm.tsx` | RHF + zod + field arrays، مسودة نصية، ربط أخطاء الخادم، idempotency key للمسودة، slot لحارس التنقل |
| `src/features/requests/pages/RequestDetailsPage.tsx` | فشل أول تحميل ≠ فشل تحديث خلفي (v5: status error مع data موجودة)، 404 و403 متطابقان للمستخدم |
| `src/app/router.tsx` + `AppLayout.tsx` | React Router v8 data mode، lazy routes، ErrorBoundary لكل route، تحقق من params، focus بعد التنقل |
| `.dependency-cruiser.cjs` + `eslint.config.js` | فرض الحدود على المسارات المحلولة، وTS 7 مع API الإصدار 6 للأدوات |
| `scripts/check-bundle-budget.mjs` | ميزانية JS الأولي gzip تفشل البناء |
| `tests/*` | الرحلة لا التفاصيل: If-Match المرسل، 412 دون إعادة إرسال، نتيجة مجهولة مع وبلا اتصال، نقرتان = طلب واحد، عزل الجلسة، أحداث مكررة |

## ما كشفه التحقق الفعلي (دروس انتقلت إلى المراجع)

1. **خلل في الكود الأول:** الصفحة كانت تعرض شاشة خطأ كاملة عند فشل refetch خلفي فتضيع رسالة
   التحقق من النتيجة المجهولة. في TanStack Query v5 تكون `status: 'error'` مع `data` موجودة.
   الإصلاح: الشاشة الكاملة لفشل أول تحميل فقط.
2. **MSW 3 أعاد تسمية** `onUnhandledRequest` إلى `onUnhandledFrame`. Vitest يزيل الأنواع فتجاهل
   الخيار بصمت؛ typecheck وحده كشفه. شغّل typecheck على ملفات الاختبار أيضًا.
3. **TypeScript 7.0 بلا programmatic API:** typescript-eslint لا يعمل عليه. الحل الموثق: `typescript`
   كاسم مستعار لـ`@typescript/typescript6` و`@typescript/native` لـTS 7 (يوفر `tsc`).
4. **eslint-plugin-jsx-a11y** لا يدعم ESLint 10 في تاريخ التحقق؛ الإتاحة هنا مثبتة بالاختبارات
   (roles/labels/descriptions/focus)، ويُضاف axe في Playwright.
5. **حجم JS الأولي** كان 148 KB gzip؛ تحميل عميل SignalR كسولًا خفّضه إلى 130 KB. أكبر المساهمين
   المتبقين react-dom ثم zod ثم react-router (قِيست من source map المخفي، لا تخمينًا).
6. **`ar-SA` الافتراضي:** الأرقام `arab` والتقويم يختلفان بين نسخ ICU/CLDR؛ حدد `-u-nu-` و`-u-ca-` دائمًا.

## قرارات مقصودة وحدودها

- **Pessimistic للاعتماد:** قرار عمل محمي بـETag؛ optimistic مناسب لعمليات قابلة للتراجع منخفضة الخطورة.
- **`allowedActions` من الخادم:** يقرر ظهور الزر فقط؛ الخادم يفوض كل طلب.
- **zod في الحزمة الأولية:** ثمن تحقق الحدود. إذا ضاقت الميزانية جرّب `zod/mini` أو نقل schemas
  إلى chunks الميزات، وقِس قبل القرار.
- **لا مكتبة i18n هنا:** النصوص مفاتيح في `messages.ts` لتبقى المكتبة قرار المشروع؛ راجع مرجع i18n.
- **فئة `visually-hidden` وskip link** تحتاج CSS المشروع ونظام تصميم EF.
