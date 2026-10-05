// SWIFT: no XCTest counterpart; asserts the JSON string `TicketPayload.jsonString()` (.sortedKeys) would produce.
import * as Fixtures from '@/test/fixtures';

import type { Ticket } from './booking';
import { shortCode, ticketHistory, ticketHistoryRow, ticketPayloadJson, ticketPresentation } from './ticket';

const ticket: Ticket = {
  id: 'abcdef12-3456-7890-abcd-ef1234567890',
  selection: { ...Fixtures.selection, date: new Date(2026, 9, 4) },
  auditorium: 'Auditorium 7',
  seatIds: ['F6', 'F7'],
  totalCents: 3098,
  currency: 'USD',
  purchasedAt: new Date(2026, 9, 1, 18, 0),
};

describe('ticket', () => {
  test('QR payload has sorted keys and no whitespace (same string as Swift JSONEncoder)', () => {
    expect(ticketPayloadJson(ticket)).toBe(
      '{"date":"2026-10-04","seats":["F6","F7"],"showtimeId":"st-1900","ticketId":"abcdef12-3456-7890-abcd-ef1234567890"}',
    );
  });

  test('QR payload is deterministic', () => {
    expect(ticketPayloadJson(ticket)).toBe(ticketPayloadJson({ ...ticket, seatIds: [...ticket.seatIds] }));
  });

  test('short code is the first 8 characters uppercased', () => {
    expect(shortCode(ticket.id)).toBe('ABCDEF12');
  });

  test('presentation strings match TicketViewModel', () => {
    expect(ticketPresentation(ticket)).toEqual({
      movieTitle: 'Test Movie',
      movieMeta: 'PG-13  ·  1HR 52MINS',
      theatre: 'Regal Test',
      format: 'Standard · Recliner Seating',
      auditorium: 'Auditorium 7',
      date: 'Sunday, Oct 4',
      time: '7:00 PM',
      seats: 'F6, F7',
      admitCount: 'ADMIT 2',
      total: '$30.98',
      shortCode: 'ABCDEF12',
    });
  });

  test('history lists purchases newest first', () => {
    const older = { ...ticket, id: 'older', purchasedAt: new Date(2026, 8, 1) };
    const newer = { ...ticket, id: 'newer', purchasedAt: new Date(2026, 9, 2) };

    expect(ticketHistory({ older, [ticket.id]: ticket, newer }).map((t) => t.id)).toEqual([
      'newer',
      ticket.id,
      'older',
    ]);
    expect(ticketHistory({})).toEqual([]);
  });

  test('history row matches TicketHistoryViewModel.Row', () => {
    expect(ticketHistoryRow(ticket)).toEqual({
      id: ticket.id,
      movieTitle: 'Test Movie',
      showtime: 'Sunday, Oct 4 · 7:00 PM',
      details: 'Regal Test · F6, F7',
      shortCode: 'ABCDEF12',
      qrPayload: ticketPayloadJson(ticket),
    });
  });
});
