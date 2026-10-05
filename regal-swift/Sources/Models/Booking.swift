import Foundation

// RN: plain TS types held in the Zustand booking store (src/store/booking.ts); tickets persisted to MMKV as JSON there too.
// Codable only for the ticket history (MMKVTicketHistory); never decoded from the API.
struct ShowtimeSelection: Codable, Sendable, Hashable {
    let movie: Movie
    let theatre: Theatre
    let format: ShowFormat
    let showtime: Showtime
    let date: Date
}

struct Ticket: Codable, Sendable, Hashable, Identifiable {
    let id: String
    let selection: ShowtimeSelection
    let auditorium: String
    let seatIDs: [String]
    let totalCents: Int
    let currency: String
    /// Orders the ticket history (newest first).
    let purchasedAt: Date
}

/// Encoded into the ticket QR code. Keys are sorted so the payload (and the QR) is deterministic.
struct TicketPayload: Codable, Sendable, Hashable {
    let ticketId: String
    let showtimeId: String
    let date: String
    let seats: [String]

    init(ticket: Ticket) {
        ticketId = ticket.id
        showtimeId = ticket.selection.showtime.id
        date = Formatters.isoDay(ticket.selection.date)
        seats = ticket.seatIDs
    }

    // RN: JSON.stringify with explicitly sorted keys (src/domain/ticket.ts); must produce the identical string.
    func jsonString() throws -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
        return String(decoding: try encoder.encode(self), as: UTF8.self)
    }
}
