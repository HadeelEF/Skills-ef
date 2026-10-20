# الهوية وتسجيل الدخول وإدارة الوصول

## حدد الأدوار وحدود الثقة

ميز user store وإدارة الحسابات عن OpenID Provider/Authorization Server،
وعن OIDC client، وعن API resource server. OAuth يفوض الوصول؛ OIDC يضيف
تسجيل الهوية. JWT صيغة token، وليست نظام login كاملًا أو دليل ثقة بمجرد decode.

| الخيار | متى تقيّمه | مسؤولية القرار |
| --- | --- | --- |
| مزود المؤسسة مثل Entra ID | SSO وإدارة دورة حساب مؤسسية | tenant/issuer الصحيح، app registration وconsent وclaims/roles |
| ASP.NET Core Identity | مستخدمون محليون وإدارة حسابات داخل التطبيق | ليس OIDC server بحد ذاته؛ تحقق من نوع tokens في APIs المدمجة |
| Duende IdentityServer | authorization server مستضاف تملكه المؤسسة | licensing/features/support وتشغيل المفاتيح والعملاء والجلسات |
| OpenIddict | بناء OAuth/OIDC باستخدام مكونات .NET | ليس منتج IAM جاهزًا بكل UI وسياسات إدارة المستخدمين |

استعمل مزودًا قائمًا عندما يلبي المتطلبات. لا تنشئ token issuer مخصصًا
لمجرد طلب JWT. لا تبدأ بـIdentityServer4 أو نسخة قديمة قبل التحقق من
حالة الدعم ومسار الترقية. تحقق من ترخيص الإصدار والخصائص المطلوبة.
tokens الخاصة بـASP.NET Core Identity API ليست تلقائيًا JWT/OIDC.

## صمم login وregistration كدورة حساب

- حدد التسجيل العام أو invitation أو provisioning/SSO. لا تضف public
  registration إلى بوابة موظفين افتراضيًا. الدور الإداري لا يأتي من request DTO.
- نفّذ تأكيد البريد عند لزومه، password hashing بالمكونات المدعومة،
  reset tokens محدودة العمر والاستخدام، ومنع account enumeration في الردود
  والسياسات المناسبة. لا ترسل password بالبريد أو تسجل reset links.
- اضبط rate limiting وlockout دون تسهيل حجب الحسابات، وMFA/passkeys وفق
  الدعم والسياسة، وrecovery/re-auth للعمليات الحساسة وإدارة الأجهزة والجلسات.
- اختبر دعوات منتهية وإعادة استخدام reset code وتغيير البريد وتعطيل
  المستخدم وlogout. لا تربط حسابين آليًا ببريد غير موثق أو بلا تحقق ملكية.
- للحساب الطارئ المحلي: التزم بمتطلب المشروع الموثق والعزل والمراقبة
  والاختبار الدوري؛ لا تضف bypass عامًّا عند تعطل IdP.

## اربط المتصفح وAPI بصورة صحيحة

لـRazor/MVC أو BFF قيّم cookie HttpOnly/Secure وSameSite المتوافق مع
OIDC وCSRF للعمليات المتغيرة. عالج state/nonce/correlation وreturn URLs
بالمكتبات القياسية؛ لا تعطل الفحص لحل مشكلة proxy أو callback.
في عدة نسخ شارك Data Protection keys والتخزين اللازم للجلسات بأمان،
واعزل applications والبيئات. اضبط HTTPS وtrusted forwarded headers.

لـSPA مباشر استخدم authorization code + PKCE وSDK مناسبًا؛ public client
لا يملك client secret آمنًا. قارن BFF عند حساسية tokens؛ لا تخزن refresh
tokens طويلة العمر في localStorage افتراضيًا. للآلة-إلى-آلة استخدم flow
مناسبًا مثل client credentials مع scopes محددة، لا كلمة مرور مستخدم.

تحقق في API من signature والخوارزميات المسموحة وissuer/audience والعمر
والمفتاح الموثوق. استخدم discovery/JWKS ومكتبة مدعومة لتدوير المفاتيح؛
لا تثق بـjku/issuer يختاره token دون allowlist. access token مخصص للـAPI،
وليس ID token. اربط subject مع issuer/tenant حيث يلزم لضمان هوية فريدة.
ثم طبق policies وresource/tenant authorization في كل مسار حساس.

## أدر authorization server طوال دورة حياته

عرّف clients وأنواعها وredirect/post-logout URIs الدقيقة وscopes/resources
وclaims وconsent. امنع wildcard redirects وتوسيع scopes بلا حاجة. احمِ
لوحة الإدارة وافصل صلاحياتها ودقق تعديل client أو key أو grant أو دور.

احفظ secrets والشهادات خارج الكود، ودوّر signing/encryption keys مع فترة
تداخل مناسبة للـtokens السارية؛ لا تستخدم development keys في إنتاج.
احفظ configuration/operational grants وجلسات المستخدم وفق خطة النسخ
والتنظيف وHA. لا تخلط مفاتيح توقيع token مع مفاتيح Data Protection.

حدد access lifetime وسياسة refresh rotation/reuse detection حسب المزود،
والإنهاء المحلي والخارجي/back-channel logout. logout أو إبطال refresh
لا يبطل بالضرورة كل JWT ساريًا فورًا؛ للمتطلب الفوري صمم session/security
version أو introspection/reference token أو تحققًا موثوقًا مناسبًا.
افحص حدود stale claims/cache عند تغيير roles وتعطيل الحساب.

اختبر expired/wrong issuer/wrong audience/invalid signature، نقص scope،
مورد tenant آخر، تدوير المفاتيح، session revocation، callback proxy،
وفشل IdP دون كشف secrets أو تحويل الفشل إلى دخول ناجح.

## مراجع رسمية

- [Identity API](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
- [JWT bearer validation](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [Duende documentation and licensing](https://docs.duendesoftware.com/general/licensing/)
- [OpenIddict](https://documentation.openiddict.com/introduction)

بعد التحقق من الهوية، صمم الصلاحيات والنطاق والإبطال وفق authorization-architecture.
