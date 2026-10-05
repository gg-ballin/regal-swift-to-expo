import Foundation

// RN: TS `interface MovieRepository` with Promise-returning methods; injected into TanStack Query `queryFn`s.
protocol MovieRepository: Sendable {
    func movie() async throws -> Movie
    func showtimes() async throws -> ShowtimesResponse
    func seatMap(showtimeID: String) async throws -> SeatMap
}

enum RepositoryError: Error, Equatable, Sendable {
    case missingResource(String)
}
