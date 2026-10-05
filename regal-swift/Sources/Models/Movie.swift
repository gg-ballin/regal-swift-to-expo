import Foundation

// RN: Codable struct = zod schema + `type Movie = z.infer<typeof movieSchema>` (src/data/schemas.ts).
struct Movie: Codable, Sendable, Hashable, Identifiable {
    let id: String
    let title: String
    let rating: String
    let runtimeMinutes: Int
    let posterURL: URL?
    let genres: [String]
    let director: String
    let cast: [String]
    let synopsis: String
}

// RN: computed extensions = pure functions in src/domain/formatters.ts (formatRuntime).
extension Movie {
    /// Regal formatting: "1HR 52MINS".
    var formattedRuntime: String {
        let hours = runtimeMinutes / 60
        let minutes = runtimeMinutes % 60
        switch (hours, minutes) {
        case (0, _): return "\(minutes)MINS"
        case (_, 0): return "\(hours)HR"
        default: return "\(hours)HR \(minutes)MINS"
        }
    }
}
