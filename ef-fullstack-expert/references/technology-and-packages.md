# التقنيات الحديثة واختيار المكتبات

## تحقق عند نقطة القرار

طبق البحث عند طلب أحدث التقنيات، أو قرار معمارية متغير، أو إضافة/ترقية
اعتماد، أو تشخيص مشكلة مرتبطة بالإصدار. لا تعِد بحث كل المكتبات لإصلاح
نص أو إجراء محلي لا يتعلق بها. استفد من دليل حديث قائم إذا بقي مناسبًا.

1. اجرد الإصدارات الفعلية من global.json وملفات المشروع وDirectory.Packages.props
   وpackage.json وlockfiles والأدوات المثبتة وCI والاستضافة.
2. تحقق من .NET SDK/Runtime/TFM وC# وASP.NET Core وEF Core وprovider
   بصورة منفصلة. تحقق من Node/package manager وReact/framework/TypeScript
   وpeerDependencies عند وجود واجهة. افحص أيضًا Bootstrap CSS/JS وjQuery
   وplugins وTailwind والـCLI/PostCSS، بما فيها vendor وCDN وlibman.json.
3. افصل latest stable وpreview/RC وLTS/STS والإصدار الموصى به. راجع
   تاريخ انتهاء الدعم وتصحيحات الأمان ومتطلبات OS/IIS/container.
4. استخدم سياسة الدعم ووثائق الإصدار وrelease notes وNuGet/npm ثم
   مستودع الناشر. عند اختلافها افحص التاريخ وdist-tags والاستهداف
   قبل الترجيح؛ لا تثبت رقمًا في التوصية دون مصدر واضح.
5. تحقق من توافق التركيبة، وأبق رقمًا محددًا قابلًا لإعادة البناء وفق
   سياسة المشروع. فرّق بين نطاق manifest والإصدار resolved في lockfile.

أدوات استكشاف ممكنة، بعد التحقق من إصدار CLI ومصادر الحزم:

```text
dotnet --info
dotnet --list-sdks
dotnet --list-runtimes
dotnet package list --outdated
dotnet package list --vulnerable --include-transitive
dotnet package list --deprecated
npm view <public-package> version dist-tags engines peerDependencies license repository --json
```

راجع `--help` للإصدار المثبت. صيغة `dotnet package list` تخص CLI الحديث؛
تستخدم إصدارات أقدم `dotnet list package`. بعض الإصدارات تنفذ restore
تلقائيًا؛ اضبط النطاق والمصادر وخيارات عدم الاستعادة عند الحاجة بدل وصف
الأمر بأنه قراءة محلية خالصة. لا تجمع خيارات متعارضة في أمر واحد.
لا ترسل أسماء حزم داخلية أو كودًا سريًا إلى سجلات أو بحث عام. راجع
nuget.config قبل أوامر metadata؛ source mapping للتنزيل لا يضمن وحده
تقييد جميع استعلامات metadata بالمصدر الخاص.

## استخدم قائمة مرشحين قابلة للتغيير

هذه أمثلة للبحث حسب الحاجة، وليست حزمًا إلزامية أو ترتيب شهرة ثابتًا.
تحقق من الحالة الحالية والترخيص والتوافق قبل التوصية بأي اسم:

| الحاجة | خيارات تقارن عند وجود حاجة |
| --- | --- |
| الوصول للبيانات | EF Core، provider المناسب، SQL مباشر، Dapper |
| التحقق | إمكانات ASP.NET Core المناسبة للإصدار، FluentValidation |
| mapping | تحويل صريح، AutoMapper، Mapster، Mapperly |
| تنسيق حالات الاستخدام | استدعاء مباشر، MediatR أو بديل ملائم |
| logs/traces/metrics | Microsoft.Extensions.Logging، OpenTelemetry، Serilog |
| HTTP resilience | Microsoft.Extensions.Http.Resilience، Polly حسب التوافق |
| عمل خلفي وجدولة | BackgroundService، Hangfire، Quartz.NET |
| cache | MemoryCache، HybridCache، Redis integration وفق البيئة |
| identity server وإدارة الحسابات | مزود المؤسسة، ASP.NET Core Identity، Duende، OpenIddict حسب الدور |
| OpenAPI وعرضه | دعم ASP.NET Core، Scalar، Swashbuckle وفق الإصدار |
| messaging/realtime | خدمة الرسائل المعتمدة، مكتبة تكامل مناسبة، SignalR |
| اختبارات .NET | xUnit/NUnit/MSTest، WebApplicationFactory، Testcontainers |
| بيانات ونماذج React | TanStack Query، React Hook Form، Zod (راجع مرجع قرارات الحالة والمكتبات) |
| جداول ومكونات وتصميم | TanStack Table، Radix/shadcn، Tailwind أو CSS Modules |
| صفحات ونماذج خادمية | Razor Pages، MVC، Tag Helpers، validation المدمج |
| تفاعل JavaScript وjQuery | Fetch/DOM الأصليان، jQuery، plugins المناسبة للمشروع |
| تحقق صفحات Razor القائم | jQuery Validation وUnobtrusive Validation وفق إصداراتهما |
| CSS وبناء assets | CSS، Tailwind وأدوات إصداره، Bootstrap/Sass، أدوات البناء القائمة |
| اختبارات الواجهة | أدوات المشروع، Vitest، Testing Library، MSW، Playwright مع axe |
| توجيه وrealtime في React | React Router أو TanStack Router، عميل SignalR بتحميل كسول |
| جودة الواجهة | ESLint typed + react-hooks، dependency-cruiser، ميزانية حزمة في CI |

لا تفترض أن أسماء مألوفة ما زالت مجانية أو بترخيص سابق. تحقق من
ترخيص الإصدار المحدد وشروط الاستخدام التجاري والمكونات التابعة. اذكر
المسألة التي تحتاج مراجعة ترخيص عند وجودها دون إصدار حكم قانوني عام.

## قيّم الاختيار بالمنفعة والتكلفة

قارن الحاجة التي لا تغطيها المنصة، وصيانة الناشر، والأمان المعروف،
والتوافق، وتكلفة الاعتماد والتعلم، والأداء المقاس وحجم الواجهة، وجودة
الوثائق والاختبارات، وسهولة الخروج. استخدم التنزيلات والنجوم كإشارات
انتشار مؤرخة فقط؛ لا تحولها إلى دليل جودة أو ترتيب موثوق وحدها.

للتوصية المهمة قدم: الغرض، latest stable المتحقق، الإصدار المقترح،
السبب، البديل، الترخيص، المصدر وتاريخ التحقق. إذا تعذر الإنترنت استخدم
سجلًا محليًا معلوم التاريخ، وحدد ما لم يتحقق؛ لا تدّعِ أن cache هو الأحدث.

## نفّذ الترقية كعمل مقصود

اقرأ breaking changes ودليل الترحيل. عالج مجموعة متوافقة من الاعتماديات،
وحدّث lockfiles بالطريقة المعتمدة، وافحص البناء والسلوك والعقود المتأثرة.
لا تحدث جميع الحزم عشوائيًا أثناء إصلاح محدود. راجع rollback وتوافق
المخطط والبيانات عند ترقية إصدار كبير. خفف تحذيرًا فقط بعد فهم سببه.
لترقية jQuery/Bootstrap راجع plugins وdata attributes والأحداث،
ولترقية Tailwind راجع major وخط البناء واكتشاف .cshtml والمتصفحات
المستهدفة. افحص الملفات المحملة في المتصفح فعليًا، لا manifest فقط.

المصادر: [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)،
[NuGet](https://www.nuget.org/)، [NuGet security](https://learn.microsoft.com/en-us/nuget/concepts/security-best-practices)،
[dotnet package list](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-package-list)،
[npm view](https://docs.npmjs.com/cli/commands/npm-view)،
[React](https://react.dev/)، [TypeScript](https://www.typescriptlang.org/docs/).
