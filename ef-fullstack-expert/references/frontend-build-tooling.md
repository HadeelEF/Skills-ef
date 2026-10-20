# أدوات بناء الواجهة وخط الجودة

اقرأ عند إعداد مشروع واجهة، أو ترقية Vite/TypeScript/ESLint، أو تشخيص فشل بناء أو نشر، أو ضبط CI.
الأرقام والإصدارات تتغير؛ تحقق منها وقت العمل. الإعداد المختبر: `golden-react-feature`.

## بوابة الجودة في CI (بهذا الترتيب)

```
npm ci                       # lockfile only; never `npm install` in CI
npm run typecheck            # tsc --noEmit, including tests and config files
npm run lint                 # typed ESLint + react-hooks, --max-warnings=0
npm run boundaries           # dependency-cruiser module rules
npm run test                 # Vitest + Testing Library + MSW
npm run build                # vite build + initial-JS budget check
```

ثم Playwright على بيئة اختبار منشورة. Vitest يزيل الأنواع ولا يفحصها؛ typecheck مستقل إلزامي (كشف في
المثال الذهبي خيار MSW 3 المعاد تسميته الذي تجاهلته الاختبارات بصمت).

## Vite

- **متغيرات البيئة:** فقط `VITE_*` تصل الحزمة، كنص عام. البناء يضمّن القيمة وقت البناء: تغيير متغير في
  الخادم لا يغير JavaScript مبنيًا. للإعداد وقت التشغيل (API URL لكل بيئة) استخدم `/config.json` يخدمه
  الخادم أو endpoint جلسة، أو اجعل الواجهة same-origin مع BFF فلا تحتاج URL أصلًا.
- `base` عند النشر تحت مسار فرعي في IIS. اختبر reload لمسار عميق بعد النشر.
- `build.sourcemap: 'hidden'` ورفع الخرائط لأداة الرصد؛ لا تنشرها علنًا.
- `server.proxy` لـ`/api` و`/hubs` (مع `ws: true`) في التطوير بدل CORS مفتوح.
- Vite 8 يستخدم Rolldown؛ خيارات تقسيم الحزم تختلف عن Rollup القديم: راجع وثيقة الإصدار قبل نسخ
  `manualChunks` من مثال قديم.

## ميزانية الأداء

افرض ميزانية JS الأولي (gzip للـentry ووارداته الثابتة) في البناء، لا تحذيرًا يُتجاهل. عند التجاوز:
حلّل الحزمة أولًا (source map أو visualizer)، ثم: lazy routes، وتحميل كسول لمكتبات غير لازمة للعرض
الأول (المثال: عميل SignalR وفّر 18 KB gzip)، واستبدال مكتبة ثقيلة بقياس. لا ترفع الميزانية بلا ADR.

## TypeScript

- tsconfig في مرجع أنماط TypeScript. استخدم project references أو workspaces في monorepo.
- TypeScript 7.0 بلا programmatic API: ثبّت 6.0 API عبر الاسم المستعار لأدوات مثل typescript-eslint.

## ESLint

- flat config (`eslint.config.js`). typescript-eslint بـ`recommendedTypeChecked` و`projectService`.
- `eslint-plugin-react-hooks` (v7 يتضمن قواعد React Compiler في `recommended`). لا تعطل
  `exhaustive-deps` داخل الكود؛ اعتمد على قيم أولية (primitives) أو أعد التصميم.
- قواعد مهمة: `no-floating-promises`، `no-misused-promises`، `consistent-type-imports`.
- **إتاحة:** eslint-plugin-jsx-a11y لم يدعم ESLint 10 في أكتوبر 2026؛ إما ESLint 9 مع الإضافة أو تغطية
  الإتاحة بالاختبارات وaxe. تحقق من الوضع الحالي.
- Prettier للتنسيق وحده؛ لا قواعد تنسيق في ESLint تتعارض معه.

## حدود الوحدات

قواعد lint على المسارات النسبية لا تميز `../api` الداخلي عن `../other-feature/api`. استخدم
dependency-cruiser (أو eslint-plugin-boundaries بعد التحقق من دعم الإصدار) على المسارات **المحلولة**:
لا استيراد لداخل feature أخرى إلا عبر `index.ts`، وshared لا يعرف features أو app، ولا دورات.
اختبر القاعدة بمخالفة متعمدة قبل الوثوق بها.

## مدير الحزم

npm أو pnpm أو yarn: واحد للمستودع مع lockfile واحد و`packageManager` في package.json. pnpm أسرع
وصارم في الاعتماديات (يكشف الاستيراد غير المعلن) ومناسب للـmonorepo. لا تخلط مديرين.
`engines.node` يطابق CI والخادم.

## النشر مع .NET

- **SPA ثابتة:** `dist` إلى `wwwroot` لـASP.NET Core (`MapFallbackToFile("index.html")` لمسارات التطبيق فقط)،
  أو موقع IIS مع URL Rewrite. cache طويل للـassets المبصومة، و`no-cache` لـ`index.html`.
- لا خادم Node في الإنتاج لـSPA. SSR يعني runtime Node مُدار (راجع مرجع rendering).
- بعد نشر جديد قد يطلب مستخدم قديم chunk محذوفًا: احتفظ بالـassets السابقة فترة، وعالج `vite:preloadError`.

## الترقيات

major واحد في كل مرة مع دليل الترحيل، وتشغيل البوابة كاملة. ابحث عن الإعادات الصامتة للتسمية التي لا
يكشفها إلا typecheck. سجّل ما تغير في ADR أو CHANGELOG.
