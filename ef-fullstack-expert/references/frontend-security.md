# أمان الواجهة (React/SPA مع ASP.NET Core)

اقرأ عند مراجعة كود واجهة، أو عرض محتوى من المستخدم، أو تصميم المصادقة في المتصفح، أو إضافة
اعتماد npm أو سكربت طرف ثالث. أمان الخادم والتفويض في مرجع مراجعة الكود والأمان والهوية.

## القاعدة الأولى: الواجهة ليست حدًا أمنيًا

كل ما في المتصفح يملكه المستخدم: الكود، وحالة الذاكرة، والطلبات. إخفاء زر أو route أو حقل لا يمنع
طلب API مباشرًا. التفويض على المورد والنطاق في .NET لكل endpoint، والواجهة تعكس `allowedActions`
التي يعيدها الخادم فقط.

## XSS في React

React يهرّب النص في `{value}`. الثغرات تأتي من المخارج:

| النمط | الخطر | العلاج |
| --- | --- | --- |
| `dangerouslySetInnerHTML` بمحتوى مستخدم أو خادم غير معقّم | تنفيذ سكربت | تجنبه؛ للـHTML الغني عقّم بـDOMPurify بقائمة وسوم مسموحة، ويفضل التعقيم في الخادم عند الحفظ أيضًا |
| `href`/`src` من بيانات (`javascript:`, `data:`) | تنفيذ عند النقر | تحقق من البروتوكول بقائمة مسموحة (`https:`، `mailto:`) عبر `new URL()`؛ لا تعتمد على سلوك نسخة React |
| بناء HTML نصيًا ثم `innerHTML` أو jQuery `.html()` | تنفيذ | `textContent` أو JSX |
| `eval`/`new Function`/`setTimeout(string)` | تنفيذ | ممنوع |
| Markdown من المستخدم | HTML مضمن | renderer يعطّل HTML الخام، ثم تعقيم |
| SVG أو HTML مرفوع يُعرض inline من نفس الأصل | سكربت بصلاحيات التطبيق | `Content-Disposition: attachment` أو نطاق منفصل للمحتوى |
| SSR: تسلسل state داخل `<script>` | كسر السياق | تسلسل آمن يهرب `<`، أو عبر framework |

فعّل CSP، وقيّم Trusted Types (`require-trusted-types-for 'script'`) للتطبيقات الحساسة: يحول أي
`innerHTML` غير معقم إلى خطأ قابل للرصد.

## المصادقة والتوكنات في المتصفح

- **الافتراضي لأنظمة EF:** BFF في ASP.NET Core: cookie `HttpOnly; Secure; SameSite=Lax أو Strict`،
  وantiforgery header للطلبات المعدِّلة، وtokens تبقى في الخادم. الواجهة تعرف المستخدم من endpoint جلسة.
- SPA مع tokens مباشرة (عند فرض ذلك): authorization code + PKCE عبر SDK المزود (مثل MSAL)، access token
  قصير، refresh rotation، ولا refresh tokens طويلة في localStorage. **حتى التوكن في الذاكرة يُستخدم من
  XSS لإرسال طلبات باسم المستخدم**؛ منع XSS هو الحماية الأولى، وBFF يمنع سرقة التوكن لا إساءة الجلسة.
- التجديد single-flight: عدة 401 متوازية تنتظر تجديدًا واحدًا؛ فشل التجديد → تسجيل دخول مرة واحدة، لا حلقة.
- CSRF مع cookies: GET آمنة بلا آثار، وكل كتابة تحمل antiforgery token. CORS ليس حماية CSRF.
- logout: امسح query cache والمسودات وأي persisted state وأغلق اتصال realtime.

## Open redirect

`returnUrl` بعد تسجيل الدخول يقبل مسارًا نسبيًا من نفس الأصل فقط، ويتحقق منه الخادم أيضًا:

```ts
export function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  const url = new URL(value, window.location.origin);
  return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : '/';
}
```

## أسرار وإعدادات

- كل ما في الحزمة عام: متغيرات `VITE_*` (أو `NEXT_PUBLIC_*`) تُضمّن نصًا. لا مفاتيح API لخدمات طرف ثالث؛
  مرّر الطلب عبر BFF.
- source maps: `hidden` وارفعها لأداة الرصد؛ لا تنشر `*.map` في web root العام.
- لا PII أو tokens في URL أو logs أو telemetry أو رسائل الخطأ المعروضة.

## CSP والرؤوس (من الخادم)

لـSPA مبنية بـVite بلا سكربتات inline: `default-src 'self'; script-src 'self'; connect-src 'self' wss://<host>;
img-src 'self' data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'`. CSS-in-JS وقت التشغيل
قد يحتاج nonce لـstyle-src؛ فضّل CSS ثابتًا. ابدأ بـReport-Only واجمع المخالفات قبل الفرض. أضف
`X-Content-Type-Options: nosniff` و`Referrer-Policy`.

## سلسلة الإمداد

- lockfile في المستودع و`npm ci` في CI؛ لا `npm install` في البناء.
- فحص الثغرات (`npm audit` أو OSV) في CI مع سياسة: Critical/High في اعتماد يصل للإنتاج يوقف الدمج.
- اعتماد جديد يمر بمراجعة: الصيانة، والناشر، وسكربتات التثبيت، والحجم، والترخيص.
- Renovate/Dependabot بدفعات قابلة للمراجعة؛ لا ترقيات major آلية بلا اختبار.
- سكربتات CDN بإصدار مثبت وSRI، أو استضافتها محليًا. سكربتات التحليلات تملك صلاحيات الصفحة كاملة.

## نقاط أخرى

- `postMessage`: حدد `targetOrigin`، وتحقق من `event.origin` والشكل قبل الاستخدام.
- `target="_blank"` للروابط الخارجية: المتصفحات الحديثة تفترض `noopener`؛ أضف `noreferrer` عند الحاجة.
- رفع الملفات: تحقق الواجهة (النوع والحجم) لتجربة المستخدم فقط؛ الخادم يفحص المحتوى ويفرض الحدود.
- localStorage: لا بيانات حساسة؛ أي سكربت في الصفحة يقرؤها ولا تُمسح عند logout تلقائيًا.

## في مراجعة الكود صنّف

Critical: `dangerouslySetInnerHTML` بمحتوى غير معقم، توكن في localStorage، سر في الحزمة، returnUrl غير
متحقق، قرار أمني في الواجهة فقط. High: CSP غائبة، source maps عامة، اعتماد بثغرة معروفة، postMessage بلا
origin. Medium: PII في URL أو telemetry، سكربت CDN بلا SRI.
