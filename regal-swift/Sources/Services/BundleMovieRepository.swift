import Foundation

/// Reads the mock JSON shipped in the app bundle. Async methods are nonisolated,
/// so decoding runs off the main actor.
// RN: bundleMovieRepository: `import movie from './movie.json'` + schema.parse(...) (Metro bundles the JSON).
struct BundleMovieRepository: MovieRepository {
    private let bundle: Bundle

    init(bundle: Bundle = .main) {
        self.bundle = bundle
    }

    func movie() async throws -> Movie {
        try load("movie")
    }

    func showtimes() async throws -> ShowtimesResponse {
        try load("showtimes")
    }

    func seatMap(showtimeID: String) async throws -> SeatMap {
        // A single mock auditorium serves every showtime.
        try load("seatmap")
    }

    private func load<T: Decodable>(_ name: String) throws -> T {
        guard let url = bundle.url(forResource: name, withExtension: "json") else {
            throw RepositoryError.missingResource(name)
        }
        return try JSONDecoder().decode(T.self, from: Data(contentsOf: url))
    }
}
