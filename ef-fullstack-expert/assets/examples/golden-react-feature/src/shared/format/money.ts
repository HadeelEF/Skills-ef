/** Decimal amounts travel as strings so values beyond Number precision survive JSON. */
export type DecimalString = `${number}`;

const DECIMAL = /^-?\d+(\.\d+)?$/;

export function toDecimalString(value: string | number): DecimalString | null {
  // A JSON number has already been rounded by JSON.parse; accept it only as a fallback contract.
  const text = typeof value === 'number' ? String(value) : value.trim();
  return DECIMAL.test(text) ? (text as DecimalString) : null;
}

/**
 * Never rely on the locale's default numbering system or calendar: for "ar-SA" they differ between
 * ICU/CLDR versions and engines. Make both explicit in the locale tag.
 */
export const DISPLAY_LOCALE = { ar: 'ar-SA-u-nu-latn-ca-gregory', en: 'en-GB' } as const;

export function formatMoney(amount: DecimalString, locale: string, currency = 'SAR'): string {
  // Intl.NumberFormat formats numeric strings exactly (no float conversion) in current engines.
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
