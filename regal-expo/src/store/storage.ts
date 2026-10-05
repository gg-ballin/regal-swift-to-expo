import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/** Zustand `persist` adapter over a synchronous MMKV instance (hydration happens during store creation). */
export function mmkvStateStorage(mmkv: MMKV): StateStorage {
  return {
    getItem: (name) => mmkv.getString(name) ?? null,
    setItem: (name, value) => mmkv.set(name, value),
    removeItem: (name) => {
      mmkv.remove(name);
    },
  };
}

// SWIFT: `MMKV(mmapID: "ticket-history")` inside MMKVTicketHistory (one key per ticket there, one JSON blob here).
export const ticketHistoryStorage = mmkvStateStorage(createMMKV({ id: 'ticket-history' }));

const DATE_KEYS = new Set(['date', 'purchasedAt']);

/** JSON has no Date: revives `selection.date` and `purchasedAt` on hydration. */
// SWIFT: JSONEncoder/JSONDecoder round-trip `Date` natively.
export function reviveDates(key: string, value: unknown): unknown {
  return DATE_KEYS.has(key) && typeof value === 'string' ? new Date(value) : value;
}
