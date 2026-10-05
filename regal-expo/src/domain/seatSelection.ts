import type { Seat, SeatMap } from '@/data/schemas';

import type { ShowtimeSelection, Ticket } from './booking';

// SOLID (S) Single responsibility: seat rules only, as pure functions; no React, storage, navigation or platform APIs.
export const DEFAULT_MAX_SEATS = 10;

// SWIFT: nested `enum ToggleResult { case selected, deselected, rejected(Rejection) }` (enum with associated value) on SeatSelectionViewModel.
export type Rejection = 'unavailable' | 'maxReached';

export type ToggleResult =
  | { type: 'selected' }
  | { type: 'deselected' }
  | { type: 'rejected'; reason: Rejection };

// SWIFT: `extension SeatMap { func seat(withID:) }` and `sortedSeatIDs(_:)` below.
export function findSeat(seatMap: SeatMap, seatId: string): Seat | undefined {
  for (const row of seatMap.rows) {
    const seat = row.seats.find((s) => s.id === seatId);
    if (seat) return seat;
  }
  return undefined;
}

/** Orders seat ids by row (as declared in the map), then seat number. */
export function sortedSeatIds(seatMap: SeatMap, ids: Iterable<string>): string[] {
  const wanted = new Set(ids);
  return seatMap.rows.flatMap((row) =>
    row.seats
      .filter((s) => wanted.has(s.id))
      .sort((a, b) => a.number - b.number)
      .map((s) => s.id),
  );
}

/** Pure port of `SeatSelectionViewModel.toggle(seatID:)`. Returns the same array when rejected. */
export function toggleSeat(
  seatMap: SeatMap | undefined,
  selected: readonly string[],
  seatId: string,
  maxSeats: number = DEFAULT_MAX_SEATS,
): { result: ToggleResult; selected: readonly string[] } {
  const seat = seatMap ? findSeat(seatMap, seatId) : undefined;
  if (!seatMap || !seat || seat.state !== 'available') {
    return { result: { type: 'rejected', reason: 'unavailable' }, selected };
  }
  if (selected.includes(seatId)) {
    return { result: { type: 'deselected' }, selected: selected.filter((id) => id !== seatId) };
  }
  if (selected.length >= maxSeats) {
    return { result: { type: 'rejected', reason: 'maxReached' }, selected };
  }
  return { result: { type: 'selected' }, selected: sortedSeatIds(seatMap, [...selected, seatId]) };
}

// SWIFT: computed `State.totalCents` / `State.canCheckout` on SeatSelectionViewModel.
export function totalCents(seatMap: SeatMap | undefined, count: number): number {
  return (seatMap?.pricePerSeatCents ?? 0) * count;
}

export const canCheckout = (selected: readonly string[]) => selected.length > 0;

// SWIFT: `Ticket(id: makeTicketID(), ...)` built inside SeatSelectionViewModel.checkout().
export function buildTicket(params: {
  id: string;
  selection: ShowtimeSelection;
  seatMap: SeatMap;
  seatIds: readonly string[];
  purchasedAt: Date;
}): Ticket {
  const { id, selection, seatMap, seatIds, purchasedAt } = params;
  return {
    id,
    selection,
    auditorium: seatMap.auditorium,
    seatIds: [...seatIds],
    totalCents: totalCents(seatMap, seatIds.length),
    currency: seatMap.currency,
    purchasedAt,
  };
}

/** "Select your seats" | "2 Seats · A1, B1". */
// SWIFT: SeatSummaryBar.configure(seatIDs:total:canContinue:) sets seatsLabel.text.
export function seatSummary(seatIds: readonly string[]): string {
  if (seatIds.length === 0) return 'Select your seats';
  return `${seatIds.length} ${seatIds.length === 1 ? 'Seat' : 'Seats'} · ${seatIds.join(', ')}`;
}
