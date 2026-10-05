import Foundation
@testable import RegalNative

struct FakeMovieRepository: MovieRepository {
    var movieResult: Result<Movie, RepositoryError> = .success(Fixtures.movie)
    var showtimesResult: Result<ShowtimesResponse, RepositoryError> = .success(Fixtures.showtimes)
    var seatMapResult: Result<SeatMap, RepositoryError> = .success(Fixtures.seatMap)

    func movie() async throws -> Movie { try movieResult.get() }
    func showtimes() async throws -> ShowtimesResponse { try showtimesResult.get() }
    func seatMap(showtimeID: String) async throws -> SeatMap { try seatMapResult.get() }
}

@MainActor
final class InMemoryTicketHistory: TicketHistory {
    private(set) var tickets: [Ticket] = []

    init(_ tickets: [Ticket] = []) {
        self.tickets = tickets
    }

    func all() -> [Ticket] { tickets.sorted { $0.purchasedAt > $1.purchasedAt } }
    func add(_ ticket: Ticket) { tickets.append(ticket) }
}

enum Fixtures {
    static let movie = Movie(
        id: "movie-1",
        title: "Test Movie",
        rating: "PG-13",
        runtimeMinutes: 112,
        posterURL: nil,
        genres: ["Drama"],
        director: "Director",
        cast: ["Actor"],
        synopsis: "Synopsis"
    )

    static let showtime = Showtime(id: "st-1900", time: "19:00")

    static let format = ShowFormat(
        id: "fmt-standard",
        name: "Standard",
        seating: "Recliner Seating",
        attributes: ["CC"],
        times: [showtime]
    )

    static let theatre = Theatre(id: "theatre-1", name: "Regal Test", address: "1 Main St", distanceMi: 0.5, formats: [format])

    static let showtimes = ShowtimesResponse(movieId: movie.id, theatres: [theatre])

    /// Row A: A1 available, A2 taken, A3 available (wheelchair). Row B: B1, B2 available.
    static let seatMap = SeatMap(
        auditorium: "Auditorium 1",
        pricePerSeatCents: 1549,
        currency: "USD",
        columns: 3,
        rows: [
            SeatRow(label: "A", seats: [
                Seat(id: "A1", number: 1, column: 0, state: .available, type: .standard),
                Seat(id: "A2", number: 2, column: 1, state: .taken, type: .standard),
                Seat(id: "A3", number: 3, column: 2, state: .available, type: .wheelchair),
            ]),
            SeatRow(label: "B", seats: [
                Seat(id: "B1", number: 1, column: 0, state: .available, type: .standard),
                Seat(id: "B2", number: 2, column: 1, state: .available, type: .standard),
            ]),
        ]
    )

    static let selection = ShowtimeSelection(
        movie: movie,
        theatre: theatre,
        format: format,
        showtime: showtime,
        date: Date(timeIntervalSince1970: 1_791_000_000)
    )

    static func ticket(id: String = "ticket-123", seatIDs: [String] = ["A1"], purchasedAt: Date = Date(timeIntervalSince1970: 1_790_000_000)) -> Ticket {
        Ticket(
            id: id,
            selection: selection,
            auditorium: "Auditorium 1",
            seatIDs: seatIDs,
            totalCents: 1549 * seatIDs.count,
            currency: "USD",
            purchasedAt: purchasedAt
        )
    }
}
