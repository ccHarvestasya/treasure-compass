const DECIMAL_COORDINATE = /^\d+(?:\.\d+)?$/u;
const IDENTIFIER = /^[A-Za-z0-9._~-]+$/u;

function hasControlCharacters(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 0x1f || code >= 0x7f && code <= 0x9f) return true;
  }
  return false;
}

export function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (hasControlCharacters(value)) return null;
  const normalized = value.trim().normalize('NFC');
  if (!normalized) return null;
  return normalized;
}

export function normalizeIdentifier(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized && IDENTIFIER.test(normalized) ? normalized : null;
}

/**
 * Parse the user-facing decimal grammar and round half up to one decimal
 * place without relying on binary floating point rounding.
 */
export function normalizeCoordinate(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  if (!DECIMAL_COORDINATE.test(value)) return null;

  const [integerPart, fractionPart = ''] = value.split('.');
  const integer = Number(integerPart);
  if (!Number.isSafeInteger(integer)) return null;

  const tenths = Number(`${integerPart}${fractionPart.slice(0, 1) || '0'}`);
  if (!Number.isSafeInteger(tenths)) return null;
  const roundedTenths = tenths + (fractionPart.length > 1 && fractionPart[1] >= '5' ? 1 : 0);
  const result = roundedTenths / 10;
  return Number.isFinite(result) && result >= 0 ? result : null;
}

export function normalizeCoordinateNumber(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  return normalizeCoordinate(value.toString());
}

export function formatCoordinate(value: number): string {
  return value.toFixed(1);
}

export function sameCoordinate(a: number, b: number): boolean {
  return Object.is(a, b) || Math.abs(a - b) < Number.EPSILON;
}
