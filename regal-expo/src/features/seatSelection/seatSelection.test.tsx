// SWIFT: Tests/SeatSelectionViewModelTests.swift; test names match the XCTest methods 1:1.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createQueryClient, RepositoryProvider, useSeatMapQuery } from '@/data/queries';
import type { MovieRepository } from '@/data/repository';
import type { Ticket } from '@/domain/booking';
import { money } from '@/domain/formatters';
import { canCheckout, DEFAULT_MAX_SEATS, totalCents } from '@/domain/seatSelection';
import { createBookingStore } from '@/store/booking';
import * as Fixtures from '@/test/fixtures';

// Test names mirror regal-swift/Tests/SeatSelectionViewModelTests.swift.
// SeatSelectionViewModel is split into: useSeatMapQuery (load) + booking store (toggle/checkout) + src/domain rules.

function makeStore(maxSeats = DEFAULT_MAX_SEATS) {
  const store = createBookingStore({ maxSeats, makeTicketId: () => 'ticket-123', storage: Fixtures.memoryStorage() });
  store.getState().setSelection(Fixtures.selection);
  return store;
}

const clients: QueryClient[] = [];
afterEach(() => clients.splice(0).forEach((client) => client.clear()));

function renderSeatMap(repository: MovieRepository = Fixtures.fakeMovieRepository()) {
  const client = createQueryClient();
  clients.push(client);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RepositoryProvider value={repository}>{children}</RepositoryProvider>
    </QueryClientProvider>
  );
  return renderHook(() => useSeatMapQuery(Fixtures.showtime.id), { wrapper });
}

describe('SeatSelection', () => {
  test('testLoadPopulatesSeatMap', async () => {
    const { result } = await renderSeatMap();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(Fixtures.seatMap);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('testLoadFailureSetsErrorMessage', async () => {
    const { result } = await renderSeatMap(Fixtures.fakeMovieRepository({ seatMap: Fixtures.missingResource('seatmap') }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).not.toBeNull();
  });

  test('testToggleSelectsThenDeselects', () => {
    const store = makeStore();

    expect(store.getState().toggleSeat(Fixtures.seatMap, 'A1')).toEqual({ type: 'selected' });
    expect(store.getState().selected).toEqual(['A1']);
    expect(store.getState().selected.includes('A1')).toBe(true);

    expect(store.getState().toggleSeat(Fixtures.seatMap, 'A1')).toEqual({ type: 'deselected' });
    expect(store.getState().selected).toEqual([]);
  });

  test('testToggleRejectsTakenAndUnknownSeats', () => {
    const store = makeStore();

    expect(store.getState().toggleSeat(Fixtures.seatMap, 'A2')).toEqual({ type: 'rejected', reason: 'unavailable' });
    expect(store.getState().toggleSeat(Fixtures.seatMap, 'Z9')).toEqual({ type: 'rejected', reason: 'unavailable' });
    expect(store.getState().selected).toEqual([]);
  });

  test('testToggleBeforeLoadIsRejected', () => {
    const store = makeStore();

    expect(store.getState().toggleSeat(undefined, 'A1')).toEqual({ type: 'rejected', reason: 'unavailable' });
  });

  test('testToggleRespectsMaxSeats', () => {
    const store = makeStore(2);
    const toggle = (id: string) => store.getState().toggleSeat(Fixtures.seatMap, id);

    expect(toggle('A1')).toEqual({ type: 'selected' });
    expect(toggle('A3')).toEqual({ type: 'selected' });
    expect(toggle('B1')).toEqual({ type: 'rejected', reason: 'maxReached' });
    expect(store.getState().selected).toEqual(['A1', 'A3']);

    expect(toggle('A1')).toEqual({ type: 'deselected' });
    expect(toggle('B1')).toEqual({ type: 'selected' });
  });

  test('testSelectedSeatsAreSortedByRowThenNumber', () => {
    const store = makeStore();
    for (const id of ['B2', 'A3', 'B1', 'A1']) store.getState().toggleSeat(Fixtures.seatMap, id);

    expect(store.getState().selected).toEqual(['A1', 'A3', 'B1', 'B2']);
  });

  test('testTotalPriceTracksSelection', () => {
    const store = makeStore();
    const total = () => totalCents(Fixtures.seatMap, store.getState().selected.length);
    expect(total()).toBe(0);
    expect(canCheckout(store.getState().selected)).toBe(false);

    store.getState().toggleSeat(Fixtures.seatMap, 'A1');
    store.getState().toggleSeat(Fixtures.seatMap, 'B1');

    expect(total()).toBe(3098);
    expect(money(total(), Fixtures.seatMap.currency)).toBe('$30.98');
    expect(canCheckout(store.getState().selected)).toBe(true);
  });

  test('testOnChangeFiresOnToggle', () => {
    const store = makeStore();
    const received: (readonly string[])[] = [];
    const unsubscribe = store.subscribe((state) => received.push(state.selected));

    store.getState().toggleSeat(Fixtures.seatMap, 'A1');
    store.getState().toggleSeat(Fixtures.seatMap, 'A2');
    unsubscribe();

    expect(received).toEqual([['A1']]);
  });

  test('testCheckoutEmitsTicket', () => {
    const store = makeStore();

    expect(store.getState().checkout(Fixtures.seatMap)).toBeNull();

    store.getState().toggleSeat(Fixtures.seatMap, 'B1');
    store.getState().toggleSeat(Fixtures.seatMap, 'A1');
    const ticket = store.getState().checkout(Fixtures.seatMap) as Ticket;

    expect(ticket.id).toBe('ticket-123');
    expect(ticket.seatIds).toEqual(['A1', 'B1']);
    expect(ticket.totalCents).toBe(3098);
    expect(ticket.auditorium).toBe('Auditorium 1');
    expect(ticket.selection).toEqual(Fixtures.selection);
    expect(store.getState().tickets['ticket-123']).toBe(ticket);
  });
});
