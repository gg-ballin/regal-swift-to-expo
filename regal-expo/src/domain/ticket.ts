import type { Ticket } from './booking';
import { formatRuntime, isoDay, longDate, money, showtimeDisplay } from './formatters';

export type TicketPayload = {
  date: string;
  seats: string[];
  showtimeId: string;
  ticketId: string;
};

// SWIFT: `struct TicketPayload: Codable` + `init(ticket:)`.
export function ticketPayload(ticket: Ticket): TicketPayload {
  return {
    date: isoDay(ticket.selection.date),
    seats: [...ticket.seatIds],
    showtimeId: ticket.selection.showtime.id,
    ticketId: ticket.id,
  };
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

/** Matches Swift `JSONEncoder` with `.sortedKeys` + `.withoutEscapingSlashes`: sorted keys, no whitespace. */
export function ticketPayloadJson(ticket: Ticket): string {
  return JSON.stringify(sortKeys(ticketPayload(ticket)));
}

export const shortCode = (ticketId: string) => ticketId.slice(0, 8).toUpperCase();

/** Purchases newest first. */
// SWIFT: MMKVTicketHistory.all() sorts by `purchasedAt` descending.
export function ticketHistory(tickets: Readonly<Record<string, Ticket>>): Ticket[] {
  return Object.values(tickets).sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());
}

export type TicketHistoryRow = {
  id: string;
  movieTitle: string;
  showtime: string;
  details: string;
  shortCode: string;
  qrPayload: string;
};

// SWIFT: TicketHistoryViewModel.Row.init(ticket:).
export function ticketHistoryRow(ticket: Ticket): TicketHistoryRow {
  const { movie, theatre, showtime, date } = ticket.selection;
  return {
    id: ticket.id,
    movieTitle: movie.title,
    showtime: `${longDate(date)} · ${showtimeDisplay(showtime.time)}`,
    details: `${theatre.name} · ${ticket.seatIds.join(', ')}`,
    shortCode: shortCode(ticket.id),
    qrPayload: ticketPayloadJson(ticket),
  };
}

/** Presentation strings, ported from `TicketViewModel`. */
// SWIFT: computed properties on TicketViewModel (`var movieTitle: String { ... }`, `var admitCount`, `var total`, ...).
export function ticketPresentation(ticket: Ticket) {
  const { movie, theatre, format, showtime, date } = ticket.selection;
  return {
    movieTitle: movie.title,
    movieMeta: `${movie.rating}  ·  ${formatRuntime(movie.runtimeMinutes)}`,
    theatre: theatre.name,
    format: `${format.name} · ${format.seating}`,
    auditorium: ticket.auditorium,
    date: longDate(date),
    time: showtimeDisplay(showtime.time),
    seats: ticket.seatIds.join(', '),
    admitCount: `ADMIT ${ticket.seatIds.length}`,
    total: money(ticket.totalCents, ticket.currency),
    shortCode: shortCode(ticket.id),
  };
}
