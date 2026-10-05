import Foundation

// RN: zod schema (enums -> z.enum([...])); helpers below -> src/domain/seatSelection.ts.
struct SeatMap: Codable, Sendable, Hashable {
    let auditorium: String
    let pricePerSeatCents: Int
    let currency: String
    /// Grid width including aisle gaps; each seat declares its own column.
    let columns: Int
    let rows: [SeatRow]
}

struct SeatRow: Codable, Sendable, Hashable {
    let label: String
    let seats: [Seat]
}

struct Seat: Codable, Sendable, Hashable, Identifiable {
    enum State: String, Codable, Sendable {
        case available
        case taken
    }

    enum Kind: String, Codable, Sendable {
        case standard
        case wheelchair
    }

    let id: String
    let number: Int
    let column: Int
    let state: State
    let type: Kind
}

extension SeatMap {
    func seat(withID id: String) -> Seat? {
        for row in rows {
            if let seat = row.seats.first(where: { $0.id == id }) { return seat }
        }
        return nil
    }

    /// Orders seat IDs by row (as declared in the map), then seat number.
    func sortedSeatIDs(_ ids: some Sequence<String>) -> [String] {
        let wanted = Set(ids)
        return rows.flatMap { row in
            row.seats.filter { wanted.contains($0.id) }.sorted { $0.number < $1.number }.map(\.id)
        }
    }
}
