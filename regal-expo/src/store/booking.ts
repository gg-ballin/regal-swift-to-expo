import { randomUUID } from 'expo-crypto';
import { useStore } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type { SeatMap } from '@/data/schemas';
import type { ShowtimeSelection, Ticket } from '@/domain/booking';
import { buildTicket, canCheckout, DEFAULT_MAX_SEATS, toggleSeat, type ToggleResult } from '@/domain/seatSelection';

import { reviveDates, ticketHistoryStorage } from './storage';

// SWIFT: no global store; selection lives in SeatSelectionViewModel.State (`private(set) var state { didSet { onChange?(state) } }`)
// and the coordinator hands ShowtimeSelection/Ticket objects to the next view model. Purchases persist in MMKVTicketHistory.
export type BookingState = {
  selection: ShowtimeSelection | null;
  /** Ordered by row, then seat number. */
  selected: readonly string[];
  /** Issued tickets by id: the ticket history, persisted to MMKV. The ticket route rehydrates from its param. */
  tickets: Record<string, Ticket>;
  maxSeats: number;

  setSelection: (selection: ShowtimeSelection) => void;
  toggleSeat: (seatMap: SeatMap | undefined, seatId: string) => ToggleResult;
  /** No-op (returns null) without seats or seat map. */
  checkout: (seatMap: SeatMap | undefined) => Ticket | null;
  addTicket: (ticket: Ticket) => void;
};

export type BookingDeps = {
  maxSeats?: number;
  makeTicketId?: () => string;
  now?: () => Date;
  storage?: StateStorage;
};

// SWIFT: deps = SeatSelectionViewModel.init(history:maxSeats:makeTicketID:now:), injected for tests.
// SOLID (D) Dependency inversion: id generation, clock and storage are injected, not hard-wired.
export function createBookingStore({
  maxSeats = DEFAULT_MAX_SEATS,
  makeTicketId = randomUUID,
  now = () => new Date(),
  storage = ticketHistoryStorage,
}: BookingDeps = {}) {
  return createStore<BookingState>()(
    persist(
      (set, get) => ({
        selection: null,
        selected: [],
        tickets: {},
        maxSeats,

        // SWIFT: a new SeatSelectionViewModel(selection:) per push, so selection always starts empty.
        setSelection: (selection) => set({ selection, selected: [] }),

        // SWIFT: SeatSelectionViewModel.toggle(seatID:) -> ToggleResult (@discardableResult).
        toggleSeat: (seatMap, seatId) => {
          const { result, selected } = toggleSeat(seatMap, get().selected, seatId, get().maxSeats);
          if (selected !== get().selected) set({ selected });
          return result;
        },

        // SWIFT: SeatSelectionViewModel.checkout(): history.add(ticket) + onCheckout?(ticket), handled by TicketsCoordinator.
        checkout: (seatMap) => {
          const { selection, selected } = get();
          if (!selection || !seatMap || !canCheckout(selected)) return null;
          const ticket = buildTicket({ id: makeTicketId(), selection, seatMap, seatIds: selected, purchasedAt: now() });
          set((state) => ({ tickets: { ...state.tickets, [ticket.id]: ticket } }));
          return ticket;
        },

        addTicket: (ticket) => set((state) => ({ tickets: { ...state.tickets, [ticket.id]: ticket } })),
      }),
      {
        name: 'booking',
        version: 1,
        storage: createJSONStorage(() => storage, { reviver: reviveDates }),
        // Only purchases survive a relaunch; an in-progress seat selection does not (same as Swift).
        partialize: (state) => ({ tickets: state.tickets }),
      },
    ),
  );
}

export type BookingStore = ReturnType<typeof createBookingStore>;

export const bookingStore = createBookingStore();

// SWIFT: `viewModel.onChange = { [weak self] state in self?.render(state) }`; selectors limit re-renders like reconfigureItems.
// SOLID (I) Interface segregation: consumers subscribe to the slice they use, never the whole store.
export function useBooking<T>(selector: (state: BookingState) => T): T {
  return useStore(bookingStore, selector);
}
