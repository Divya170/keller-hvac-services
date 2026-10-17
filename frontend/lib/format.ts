export const SITE_NAME = 'Keller HVAC Services';
export const SITE_DESCRIPTION = 'Keller HVAC Services: heating, ventilation and air-conditioning service. Tell us what your system needs and request service online.';

export const fmtDateTime = (iso: string | Date) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const fmtDate = (iso: string | Date) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
/** Formats a YYYY-MM-DD string without time-zone drift. */
export const fmtYmd = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
export const fmtBytes = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
