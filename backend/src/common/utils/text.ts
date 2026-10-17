export const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v)).trim();

export const clip = (v: unknown, n: number): string => str(v).slice(0, n);

export function slugify(input: string): string {
  return str(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Escapes a value for CSV output. */
export function csvCell(v: unknown): string {
  const s = v === undefined || v === null ? '' : String(v);
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
