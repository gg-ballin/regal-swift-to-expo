import type { IsoDate, MovieDateRange } from '@/api/schemas';

/** Prompt fixes "today" at 2026-03-18. A window is exactly 28 days, both ends inclusive. */
export const RELEASE_WINDOW_DAYS = 28;
export const RELEASE_ANCHOR: IsoDate = '2026-03-18';

/** Dataset bounds from the prompt: Jan 9, 2026 through May 8, 2026. */
export const RELEASE_SPAN_MIN: IsoDate = '2026-01-09';
export const RELEASE_SPAN_MAX: IsoDate = '2026-05-08';

export function rangeFromStart(start: IsoDate): MovieDateRange {
  return { gte: start, lte: addCalendarDays(start, RELEASE_WINDOW_DAYS) };
}

export function clampWindowStart(iso: string): IsoDate {
  if (iso < WINDOW_START_MIN) return WINDOW_START_MIN;
  if (iso > WINDOW_START_MAX) return WINDOW_START_MAX;
  return iso;
}

/** Local calendar date. The native picker reads and writes local days, not UTC midnight. */
export function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function localDateToIso(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(iso: string, days: number): IsoDate {
  const date = isoToLocalDate(iso);
  date.setDate(date.getDate() + days);
  return localDateToIso(date);
}

export const DEFAULT_WINDOW_START: IsoDate = addCalendarDays(RELEASE_ANCHOR, -RELEASE_WINDOW_DAYS);
/** Latest start that still keeps the window end on or before May 8. */
export const WINDOW_START_MIN: IsoDate = RELEASE_SPAN_MIN;
export const WINDOW_START_MAX: IsoDate = addCalendarDays(RELEASE_SPAN_MAX, -RELEASE_WINDOW_DAYS);

/** "Mar 20, 2026". UTC noon so a local timezone cannot shift the calendar day. */
export function formatReleaseDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Feb 18 – Mar 18, 2026". */
export function formatReleaseWindow(range: MovieDateRange): string {
  const endLabel = formatReleaseDate(range.lte);
  if (range.gte.slice(0, 4) !== range.lte.slice(0, 4)) {
    return `${formatReleaseDate(range.gte)} – ${endLabel}`;
  }
  const [year, month, day] = range.gte.split('-').map(Number);
  const startLabel = new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${startLabel} – ${endLabel}`;
}
