import Foundation
import MMKV

// RN: the persisted `tickets` map in the Zustand booking store (src/store/booking.ts, `persist` + react-native-mmkv).
@MainActor
protocol TicketHistory: AnyObject {
    /// Purchases newest first.
    func all() -> [Ticket]
    func add(_ ticket: Ticket)
}

/// One MMKV entry per purchase (`ticket.<id>` -> JSON), so a corrupt entry only drops that ticket.
/// The QR is not stored: it is re-rendered from `TicketPayload` (deterministic) and kept in `QRCodeStore`.
@MainActor
final class MMKVTicketHistory: TicketHistory {
    private static let keyPrefix = "ticket."
    // MMKV needs a one-time process-wide initialize before any instance is opened.
    private static let initialized: Void = { _ = MMKV.initialize(rootDir: nil) }()

    private let storage: MMKV
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(mmapID: String = "ticket-history") {
        Self.initialized
        guard let storage = MMKV(mmapID: mmapID) else {
            preconditionFailure("MMKV failed to open '\(mmapID)'")
        }
        self.storage = storage
    }

    func all() -> [Ticket] {
        storage.allKeys()
            .compactMap { key -> Ticket? in
                guard
                    let key = key as? String,
                    key.hasPrefix(Self.keyPrefix),
                    let data = storage.data(forKey: key)
                else { return nil }
                return try? decoder.decode(Ticket.self, from: data)
            }
            .sorted { $0.purchasedAt > $1.purchasedAt }
    }

    func add(_ ticket: Ticket) {
        guard let data = try? encoder.encode(ticket) else { return }
        storage.set(data, forKey: Self.keyPrefix + ticket.id)
    }

    func removeAll() {
        storage.clearAll()
    }
}
