# أنماط TypeScript لمكونات React وعقود .NET

اقرأ عند كتابة مكون قابل لإعادة الاستخدام، أو ربط عقود API مولدة، أو ضبط tsconfig. المبادئ
العامة (unknown عند الحدود، narrowing) في مرجع React runtime وTypeScript.

## tsconfig للمشاريع الجديدة

`strict`، `noUncheckedIndexedAccess` (الوصول بالفهرس يعيد `T | undefined`)، `exactOptionalPropertyTypes`
(يميز الغائب عن `undefined`، ويكشف تمرير `undefined` لخصائص اختيارية)، `verbatimModuleSyntax`
و`isolatedModules` للـbundlers، `useUnknownInCatchVariables`. في مشروع قائم فعّلها تدريجيًا مع خطة.

**TypeScript 7.0 (يوليو 2026)** مترجم أصلي أسرع بكثير **بلا programmatic API** حتى 7.1. الأدوات التي
تستورد `typescript` (typescript-eslint، بعض الإضافات) تحتاج 6.0: ثبّت `"@typescript/native":
"npm:typescript@^7"` للـ`tsc` و`"typescript": "npm:@typescript/typescript6@^6"` للأدوات (مطبق ومختبر في
المثال الذهبي). تحقق من الوضع الحالي قبل الترقية.

## مكونات generic تحافظ على الاستنتاج

```tsx
type Column<TRow> = { id: string; header: string; cell: (row: TRow) => ReactNode };

type DataTableProps<TRow> = {
  rows: readonly TRow[];
  columns: readonly Column<TRow>[];
  getRowId: (row: TRow) => string;
  onRowSelect?: (row: TRow) => void;
};

export function DataTable<TRow>({ rows, columns, getRowId, onRowSelect }: DataTableProps<TRow>) { /* … */ }
// <DataTable rows={requests} getRowId={(r) => r.id} … />  → TRow inferred; cell(row) is typed.
```

في ملفات `.tsx` تحتاج arrow function generic إلى `<T,>`. لا تضف generic لا يربط مدخلًا بمخرج.

## Props من عناصر HTML

- `ComponentProps<'button'>` (يتضمن `ref` في أنواع React 19) أو `ComponentPropsWithoutRef<'input'>`
  لتمرير الخصائص الأصلية؛ احذف ما تتحكم فيه بـ`Omit`.
- في React 19 `ref` خاصية عادية لمكونات الدوال؛ `forwardRef` ما زال يعمل للتوافق، لا تستخدمه في كود جديد.
- props متنافية بـdiscriminated union بدل اختيارية متصارعة:

```ts
type ActionProps =
  | { kind: 'link'; href: string }
  | { kind: 'button'; onClick: () => void; disabled?: boolean };
```

## تعدد الأشكال (polymorphism)

`as` prop مع أنواع polymorphic معقد ويبطئ الفحص. فضّل نمط `asChild` (Slot من Radix): المكون يمرر
خصائصه وسلوكه إلى العنصر الابن الذي يختاره المستهلك (`<Button asChild><Link to="…"/></Button>`).

## المعرفات والقيم ذات المعنى

- معرفات مميزة (branded) عندما يختلط نوعان من المعرفات في نفس الشاشة:
  `type RequestId = string & { readonly __brand: 'RequestId' }` مع دالة تحقق تنتجها.
- المبالغ نص decimal (`` `${number}` `` بعد تحقق) لا `number`؛ التواريخ: `date-only` نص `YYYY-MM-DD`،
  واللحظة ISO مع offset. لا `new Date('2026-10-05')` لتاريخ أعمال (يُفسَّر UTC ويتغير اليوم).
- union حرفي (`as const`) بدل `enum` للقيم القادمة من JSON؛ تحقق منها وقت التشغيل.

## exhaustive handling

```ts
function assertNever(value: never): never { throw new Error(`Unhandled: ${JSON.stringify(value)}`); }
switch (error.kind) { /* every case */ default: return assertNever(error); }
```

إضافة variant جديد تكسر البناء في كل مكان لم يعالجه، وهذا المقصود. `satisfies` لخرائط الإعدادات
(`messages satisfies Record<Status, string>`) يتحقق من الاكتمال دون توسيع النوع.

## أحداث مكتوبة

`ChangeEvent<HTMLInputElement>`، و`FormEvent<HTMLFormElement>`، و`KeyboardEvent<HTMLDivElement>`؛ استخدم
`event.currentTarget` (مكتوب بنوع العنصر) لا `event.target`. handlers async في props: انتبه لقاعدة
`no-misused-promises`؛ أغلف بـ`void` عن قصد مع معالجة الخطأ داخلها.

## عقود .NET المولدة

| الأداة | يناسب |
| --- | --- |
| openapi-typescript (+ openapi-fetch) | أنواع فقط من OpenAPI مع عميل صغير؛ أقل حجمًا |
| orval | يولد عميلًا وhooks لـTanStack Query؛ وفّر وقتًا لكن راجع الأنماط المولدة |
| Kiota | مولد Microsoft متعدد اللغات |
| NSwag | شائع في مشاريع .NET القائمة؛ يولد من المشروع مباشرة |

- منذ .NET 9 تولد ASP.NET Core وثيقة OpenAPI عبر `Microsoft.AspNetCore.OpenApi`؛ Swashbuckle لم يعد في
  القوالب. ثبّت الوثيقة في CI وقارن الفروقات (breaking changes) قبل الدمج.
- لا تعدّل الكود المولد؛ ضع adapters خارجه (تحويل DTO إلى view model، decimal، تواريخ).
- الأنواع المولدة لا تتحقق وقت التشغيل: أضف parsing (zod) عند الحدود المهمة، أو ولّد schemas.
- تحقق من تمثيل `decimal` و`long` و`DateOnly` و`Guid` والـnullability في الوثيقة المولدة فعليًا.

## اختبر الأنواع

typecheck يشمل ملفات الاختبار والإعدادات (في المثال الذهبي كشف خيار MSW 3 المعاد تسميته). عند بناء
مكون generic مشترك أضف حالات `// @ts-expect-error` في اختبار أنواع لما يجب أن يُرفض.
