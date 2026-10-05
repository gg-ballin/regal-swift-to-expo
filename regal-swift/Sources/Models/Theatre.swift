import Foundation

// RN: zod schemas in src/data/schemas.ts; extensions below -> src/domain/formatters.ts.
struct ShowtimesResponse: Codable, Sendable, Hashable {
    let movieId: String
    let theatres: [Theatre]
}

struct Theatre: Codable, Sendable, Hashable, Identifiable {
    let id: String
    let name: String
    let address: String
    let distanceMi: Double
    let formats: [ShowFormat]
}

struct ShowFormat: Codable, Sendable, Hashable, Identifiable {
    let id: String
    let name: String
    let seating: String
    let attributes: [String]
    let times: [Showtime]
}

struct Showtime: Codable, Sendable, Hashable, Identifiable {
    let id: String
    /// 24h local time, "HH:mm".
    let time: String
}

extension Theatre {
    var formattedAddress: String {
        let distance = distanceMi.formatted(.number.precision(.fractionLength(0...2)).locale(Locale(identifier: "en_US")))
        return "\(address) (\(distance)mi)"
    }
}

extension Showtime {
    var displayTime: String { Formatters.displayTime(fromTwentyFourHour: time) ?? time }
}
