# استراتيجيات العرض والتوجيه وحدود الخادم

## Pick rendering per route

حدد المحتوى العام/الخاص، زمن تحديثه، أهمية أول HTML، التفاعل، ومكان
التشغيل. يمكن أن يجمع المنتج أكثر من استراتيجية؛ لا تصنف كل تطبيق
بتسمية واحدة ثم تفرضها على جميع مساراته.

| النمط | سبب محتمل لاختياره | أثر يحتاج قرارًا |
| --- | --- | --- |
| CSR | تطبيق عميل كثيف التفاعل مع API مستقل | تحميل أولي، auth، روابط عميقة وتهيئة الاستضافة |
| SSG/prerender | محتوى يمكن توليده مسبقًا | توقيت البناء وحداثة المحتوى وعدد الصفحات |
| SSR | HTML يتغير حسب الطلب أو الحاجة إلى عرضه من الخادم | تكلفة الخادم، عزل البيانات وhydration |
| regeneration/revalidation | محتوى يقبل حداثة محددة | invalidation وخطأ التحديث وما تعرضه النسخة القديمة |
| streaming | أجزاء ببيانات متفاوتة التأخر | حدود Suspense وتسلسل الظهور وإشارات الانشغال |

Server Components تحدد أين يُنفذ منطق المكوّن وحدود وحداته؛ ليست مرادفًا
لـSSR. قد تُعرض Client Components أوليًا على الخادم وفق الإطار. `use client`
لا تعني «لا يوجد HTML من الخادم»، و`use server` ليست علامة لكل مكوّن خادم.
راجع قدرات وإعدادات الإطار الفعلية قبل تصميم الحدود.
مرجع: [Next.js server/client](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Next.js and server boundaries

احترم App Router أو Pages Router والإصدار المثبت. لا تخلط APIs النمطين
بلا سبب متعلق بترحيل موجود. اجعل client boundary حول التفاعل الذي يحتاج
المتصفح، وراقب imports المتعدية التي قد توسع حزمة العميل.

انقل عبر الحدود ما يسمح به serialization للإطار وما يحتاجه العميل فقط.
احتفظ بالأسرار ووحدات server-only وراء الحد المناسب. Server Actions أو
Server Functions نقاط دخول تحتاج تحقق مدخلات وهوية وصلاحية لكل عملية؛
إخفاء زر أو صعوبة تخمين معرف الدالة لا يفرض الصلاحيات.
مرجع: [Next.js data security](https://nextjs.org/docs/app/guides/data-security).

لا تنشئ HTTP loop داخل الخادم إلى Route Handler من التطبيق نفسه إذا كان
يمكن الوصول إلى خدمة البيانات مباشرة بصورة آمنة ومتسقة. استدعاء API
خارجي أو backend مستقل يتبع عقده؛ وجود إطار خادم لا يقتضي نقل كل backend إليه.

## Caching without mixed ownership

ميّز request memoization وcache الخادم وcache المتصفح/CDN وquery cache.
حدد لكل مصدر: نطاقه، مفتاحه، زمن صلاحيته، من يبطله، وما يراه المستخدم
أثناء إعادة التحقق. لا تشارك بيانات مستخدم بين طلبات SSR أو ضمن cache
عامة بسبب singleton غير معزول.

لا تفترض defaults للتخزين عبر إصدارات Next.js. اقرأ إعدادات المشروع
ومرجع نسخته، وخاصة cache configuration وطرق invalidation. بعد mutation
افحص أن القائمة والتفاصيل وما يحتاج تحديثًا تعكس النتيجة، وأن refetch
لا يمحو draft غير محفوظ.

عند SSR مع مكتبة query، اتبع تكامل prefetch/dehydrate/hydrate الخاص بها
وأنشئ cache بعمر مناسب للطلب. افحص نقل البيانات والتواريخ والمفاتيح
وتوقيت إعادة الجلب، وامنع ازدواج جلب غير مقصود. لا تنسخ وصفة من نسخة
أخرى ذات أسماء خيارات مختلفة.
مراجع: [Next.js caching](https://nextjs.org/docs/app/getting-started/caching)،
[TanStack SSR](https://tanstack.com/query/latest/docs/framework/react/guides/ssr).

## Routing and URL state

اجعل المسار تمثيلًا مفيدًا لموضع المستخدم، مع عقود params/search params
واضحة والتحقق من القيم. قرر متى تستخدم push أو replace بحسب توقع العودة؛
لا تملأ history بكل حرف في البحث دون غرض، ولا تستبدل كل انتقال فتضيع العودة.

في router يدعم loaders/actions، حدد مالك البيانات وإعادة التحقق وحدود
الخطأ. React Router يتيح أكثر من mode؛ اختر من احتياج المشروع، وتحقق
من المكتبات والـimports الموافقين. loading/error/not-found داخل route
لا تعوض رسالة تحقق حقل أو معالجة رفض حفظ.
مرجع: [React Router modes](https://reactrouter.com/start/modes).

اختبر الدخول المباشر والتحديث والعودة والتقدم وروابط التفاصيل واللغة.
حافظ على معايير القائمة عند العودة من سجل إذا اقتضت التجربة. dirty-form
navigation يحتاج قرارًا عن حفظ العمل أو فقده، مع وسائل router/المتصفح
المدعومة وإتاحة الحوار؛ لا تضف prompt عامًا لكل انتقال في التطبيق.

## Hydration and browser-only capabilities

عند mismatch، قارن أول HTML بأول render: اللغة والمنطقة الزمنية والتواريخ،
الأرقام العشوائية، HTML غير صالح، التخزين المحلي، media queries، ونسخة
البيانات. افصل أجزاء المتصفح عند الحاجة واجعل fallback مستقرًا؛ إخفاء
التحذير أو تعطيل SSR للتطبيق كاملًا لا يحل السبب تلقائيًا.

أبقِ الـlocale ومصدره متوافقين بين الطرفين، وراجع
[اللغتين](bilingual-accessibility.md). في تطبيق Vite عميل، احسم base path
واسترجاع routes والأصول وقت النشر؛ proxy التطوير لا يضمن عمل API في الإنتاج.
قيم `VITE_*` أو `NEXT_PUBLIC_*` العامة قابلة للظهور في العميل.
