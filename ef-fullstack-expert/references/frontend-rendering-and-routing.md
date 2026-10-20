# Rendering وrouting والاستضافة

اقرأ عند اختيار طريقة العرض، أو إضافة routing/SSR، أو إصلاح hydration
وdeep links. افحص framework/router ونسخته ونمط تشغيله والاستضافة الفعلية؛
React لا يستلزم Next.js، واختيار Next.js لا ينقل قواعد .NET تلقائيًا إليه.

## اختر لكل نوع صفحة

| الخيار | سبب ملاءمته | ما يجب حسمه |
| --- | --- | --- |
| Razor Pages/MVC | صفحات ونماذج خادمية وتفاعل محدود | handlers، progressive enhancement وassets |
| React CSR | تطبيق تفاعلي يعتمد API | بدء التحميل، routing fallback وعقود الهوية |
| SSG | محتوى عام يمكن توليده مسبقًا | وقت التحديث وbuild data وأثر stale content |
| SSR | HTML عند الطلب أو محتوى يتطلب ذلك | runtime، latency، الهوية وعزل البيانات |
| streaming/regeneration | تحسين تسليم أو تحديث أجزاء مناسبة | دعم framework، cache boundaries وحالات الفشل |

استنتج القرار من المحتوى وSEO والتخصيص وتكرار التحديث والاستضافة.
يمكن أن تختلف الاستراتيجية بين صفحات المنتج؛ لا تضف runtime أو cache
معقدًا بلا منفعة. احترم Pages/App Router ونمط router القائم عند التعديل.

## افصل server وclient بحدود حقيقية

- ميز Server Components عن SSR. قد ينتج HTML أولي لمكون client أيضًا؛
  client boundary ليست ضمانًا لغياب server rendering. ضع browser APIs
  في الموضع المدعوم فعليًا، وقلل client boundary دون تكسير التفاعل.
- اجعل أسرار الاتصال والتوكنات الخاصة والمنطق الموثوق في الخادم. افحص
  ما يُسلسل إلى HTML/props/payload والـpublic env؛ كود server لا يجعل
  البيانات المرسلة للمتصفح سرية. تحقق من حماية server functions مثل API.
- أبق قواعد المجال والصلاحيات وtransactions في .NET عندما يملكه.
  استخدم BFF أو server adapter لمبرر واضح، ولا تكرر القواعد فيه أو تنشئ
  سلسلة HTTP تستدعي الخادم نفسه دون حاجة. وثق أصل cookies وتدفق الهوية.

## احمِ hydration وcache

- ابدأ الخادم وأول render للمتصفح بنفس البيانات وlocale وtimezone
  المدعومة. لا تقرأ localStorage/window أثناء SSR ولا تجعل الساعة أو
  random أو invalid HTML تحدد markup مختلفًا دون تصميم صريح.
- عالج اختلاف hydration في مصدره؛ suppressHydrationWarning استثناء ضيق،
  وليس علاجًا عامًّا. لا تجعل كامل الصفحة فارغًا حتى mount لإخفاء الخطأ.
  حمّل تفضيل المتصفح لاحقًا إذا لزم مع انتقال مفهوم وحفظ حالة المستخدم.
- افصل request memoization وserver/CDN cache وbrowser query cache.
  لا تشارك store أو QueryClient يحمل بيانات مستخدم بين طلبات SSR.
  أنشئ نطاقًا مناسبًا للطلب وهوية المستخدم، وسلسل البيانات المسموح بها فقط.
- طابق مفاتيح وبيانات dehydrate/hydrate وfreshness لتجنب إعادة طلب
  عمياء. افحص headers وسياسة cache للصفحات الخاصة؛ Vary أو query key
  وحده ليسا تفويضًا ولا يكفيان دون إعداد المنظومة الفعلي.
- اجعل أخطاء route/loading وعدم العثور والصلاحيات قابلة للاسترداد.
  لا تعيد توجيه 403 إلى login بلا نهاية، ولا تخزن استجابة مستخدم لآخر.

## اجعل التنقل جزءًا من العقد

- حدد URL parameters وquery schema وdefaults وnormalization. احتفظ
  بالفلاتر والصفحة واللغة القابلة للمشاركة في URL، وميز push عن replace.
- اختبر back/forward وreload وdirect link وinvalid IDs والروابط العميقة.
  صفّر pagination عند تغير فلتر يستلزم ذلك، ولا تدع form state تتصارع
  مع URL أو query cache في ownership غير محدد.
- احفظ مسودة المستخدم عبر الانتقال المسموح، أو قدم تحذير فقد مدروسًا
  حسب المتطلبات. لا تعتبر beforeunload حماية موثوقة لكل حالات الجوال.
- عالج focus بعد تنقل route والـscroll restoration والعنوان وlandmarks.
  حافظ على query/deep link والمعنى عند تبديل اللغة دون إعادة تعيين صامتة.

## تحقق من الاستضافة

حدد base path وasset URLs وproxy headers وHTTPS وcookies origins.
في SPA لا توجه /api أو assets المفقودة إلى index.html؛ اجعل fallback
خاصًا بمسارات التطبيق. في SSR تحقق من تشغيل Node/runtime الملائم،
والعكس proxy وhealth checks وإدارة العملية، لا تنشره كملفات static فقط.
ميز build-time configuration عن runtime config؛ لا تعد بأن env في الخادم
ستغير JavaScript المجمّع في المتصفح. اختبر refresh لمسار داخلي بعد النشر.

## المصادر

- [Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [ASP.NET Core fundamentals](https://learn.microsoft.com/aspnet/core/fundamentals/)
