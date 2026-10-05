// SWIFT: Tests/TicketHistoryTests.swift (MMKVTicketHistoryTests: round-trip, persists across instances).
import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

import type { Ticket } from '@/domain/booking';
import * as Fixtures from '@/test/fixtures';

import { createBookingStore } from './booking';
import { mmkvStateStorage } from './storage';

const purchasedAt = new Date(1_790_500_000_000);

function purchase<S extends StateStorage>(storage: S, id = 'ticket-123') {
  const store = createBookingStore({ makeTicketId: () => id, now: () => purchasedAt, storage });
  store.getState().setSelection(Fixtures.selection);
  store.getState().toggleSeat(Fixtures.seatMap, 'A1');
  const ticket = store.getState().checkout(Fixtures.seatMap) as Ticket;
  return { store, storage, ticket };
}

describe('booking store persistence', () => {
  test('checkout stamps purchasedAt', () => {
    expect(purchase(Fixtures.memoryStorage()).ticket.purchasedAt).toEqual(purchasedAt);
  });

  test('purchases survive a new store (relaunch) with Dates revived', () => {
    const { storage, ticket } = purchase(Fixtures.memoryStorage());

    const relaunched = createBookingStore({ storage });
    const restored = relaunched.getState().tickets[ticket.id];

    expect(restored).toEqual(ticket);
    expect(restored.purchasedAt).toBeInstanceOf(Date);
    expect(restored.selection.date).toBeInstanceOf(Date);
  });

  test('only tickets are persisted, not the in-progress selection', () => {
    const { storage } = purchase(Fixtures.memoryStorage());

    const persisted = JSON.parse(storage.entries.get('booking') ?? '{}');
    expect(Object.keys(persisted.state)).toEqual(['tickets']);

    const relaunched = createBookingStore({ storage });
    expect(relaunched.getState().selection).toBeNull();
    expect(relaunched.getState().selected).toEqual([]);
  });

  test('round-trips through the MMKV adapter', () => {
    const storage = mmkvStateStorage(createMMKV({ id: 'booking-test' }));
    const { ticket } = purchase(storage, 'mmkv-ticket');

    expect(createBookingStore({ storage }).getState().tickets[ticket.id]).toEqual(ticket);
  });
});
