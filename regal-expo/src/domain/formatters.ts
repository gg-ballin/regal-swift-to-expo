import type { Theatre } from '@/data/schemas';

// SWIFT: `enum Formatters` (Shared/Formatters.swift) using `Date.formatted(.dateTime...)` / `Decimal.formatted(.currency)` pinned to en_US.
const LOCALE = 'en-US';

const weekdayShortFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });
const weekdayLongFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' });
const monthShortFormat = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const distanceFormat = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const moneyFormats = new Map<string, Intl.NumberFormat>();

/** Regal formatting: "1HR 52MINS", "52MINS", "2HR". */
// SWIFT: computed `extension Movie { var formattedRuntime: String }`.
export function formatRuntime(runtimeMinutes: number): string {
  const hours = Math.floor(runtimeMinutes / 60);
  const minutes = runtimeMinutes % 60;
  if (hours === 0) return `${minutes}MINS`;
  if (minutes === 0) return `${hours}HR`;
  return `${hours}HR ${minutes}MINS`;
}

/** "13:30" -> "1:30 PM". Returns null for malformed input. */
export function displayTime(twentyFourHour: string): string | null {
  const parts = twentyFourHour.split(':');
  if (parts.length !== 2 || !parts.every((p) => /^\d+$/.test(p))) return null;
  const [hour, minute] = parts.map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

// SWIFT: `extension Showtime { var displayTime: String }`.
export function showtimeDisplay(time: string): string {
  return displayTime(time) ?? time;
}

/** "{address} ({distance}mi)" with 0-2 fraction digits. */
// SWIFT: `extension Theatre { var formattedAddress: String }` with `.number.precision(.fractionLength(0...2))`.
export function formattedAddress(theatre: Pick<Theatre, 'address' | 'distanceMi'>): string {
  return `${theatre.address} (${distanceFormat.format(theatre.distanceMi)}mi)`;
}

/** Local calendar day as "YYYY-MM-DD". */
export function isoDay(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Inverse of `isoDay`, at local midnight. */
export function parseIsoDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export const weekdayShort = (date: Date) => weekdayShortFormat.format(date);
export const monthShort = (date: Date) => monthShortFormat.format(date);
export const dayOfMonth = (date: Date) => String(date.getDate());

/** "Sunday, Oct 4". */
export function longDate(date: Date): string {
  return `${weekdayLongFormat.format(date)}, ${monthShort(date)} ${dayOfMonth(date)}`;
}

/** Integer cents -> "$30.98". */
export function money(cents: number, currency: string): string {
  let format = moneyFormats.get(currency);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE, { style: 'currency', currency });
    moneyFormats.set(currency, format);
  }
  return format.format(cents / 100);
}

export const VISIBLE_DAYS = 7;

/** Today (start of day) + the following days; generated, not from JSON. */
// SWIFT: MovieDetailViewModel.init: `calendar.startOfDay(for: now)` + `calendar.date(byAdding: .day, value: i, to: today)`.
export function makeDateStrip(now: Date, days: number = VISIBLE_DAYS): Date[] {
  return Array.from({ length: days }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
}
