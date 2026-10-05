import type { Movie, ShowFormat, Showtime, Theatre } from '@/data/schemas';

// SWIFT: `struct ShowtimeSelection: Sendable, Hashable` and `struct Ticket` (Models/Booking.swift); passed by value between VCs.
export type ShowtimeSelection = {
  movie: Movie;
  theatre: Theatre;
  format: ShowFormat;
  showtime: Showtime;
  date: Date;
};

export type Ticket = {
  id: string;
  selection: ShowtimeSelection;
  auditorium: string;
  seatIds: string[];
  totalCents: number;
  currency: string;
  /** Orders the ticket history (newest first). */
  purchasedAt: Date;
};

/** Resolves a showtime id against the showtimes response (deep links carry ids, not objects). */
// SWIFT: not needed; the coordinator hands the full ShowtimeSelection to the next view model.
export function findShowtime(
  theatres: readonly Theatre[],
  showtimeId: string,
): { theatre: Theatre; format: ShowFormat; showtime: Showtime } | null {
  for (const theatre of theatres) {
    for (const format of theatre.formats) {
      const showtime = format.times.find((t) => t.id === showtimeId);
      if (showtime) return { theatre, format, showtime };
    }
  }
  return null;
}
