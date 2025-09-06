// lib/date.ts
// Utilities to parse/format dates safely without timezone surprises

const pad2 = (n: number) => String(n).padStart(2, "0");

function fromParts(y: number, m: number, d: number): Date {
  // Create as local date without time-zone shifting
  return new Date(y, m - 1, d);
}

function parseISOish(s: string): Date | null {
  if (!s) return null;

  // yyyy-MM-dd
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [_, yy, mm, dd] = m;
    return fromParts(+yy, +mm, +dd);
  }

  // dd-MM-yyyy or dd/MM/yyyy or dd MM yyyy
  m = s.match(/^(\d{2})[-/ ](\d{2})[-/ ](\d{4})$/);
  if (m) {
    const [_, dd, mm, yy] = m;
    return fromParts(+yy, +mm, +dd);
  }

  // ISO timestamp: 2000-01-02T00:00:00Z / with offset
  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime())) return dt;

  return null;
}

/** Convert any reasonable input to API string yyyy-MM-dd (or undefined if invalid/empty). */
export function toApiDate(v?: string | Date | null): string | undefined {
  if (!v) return undefined;
  const d = typeof v === "string" ? parseISOish(v) : v;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

/** Coerce API/DB date to UI input value (yyyy-MM-dd) or empty string. */
export function fromApiDate(v?: string | Date | null): string {
  return toApiDate(v) ?? "";
}

/** For read-only display, e.g., "dd-MM-yyyy". */
export function toDisplayDate(v?: string | Date | null): string {
  if (!v) return "";
  const d = typeof v === "string" ? parseISOish(v) : v;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
}
