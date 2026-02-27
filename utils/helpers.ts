/**
 * تنسيق التاريخ من timestamp إلى يوم/شهر/سنة
 */
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * تحويل نص تاريخ (يوم/شهر/سنة) إلى timestamp
 */
export function parseDate(dateStr: string): number | null {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) return null;
  return new Date(year, month - 1, day).getTime();
}
