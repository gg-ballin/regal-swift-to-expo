import XCTest
@testable import RegalNative

final class BundleMovieRepositoryTests: XCTestCase {
    private let repository = BundleMovieRepository(bundle: Bundle(for: AppDelegate.self))

    func testMockDataDecodes() async throws {
        let movie = try await repository.movie()
        let showtimes = try await repository.showtimes()
        let seatMap = try await repository.seatMap(showtimeID: "any")

        XCTAssertEqual(showtimes.movieId, movie.id)
        XCTAssertFalse(showtimes.theatres.isEmpty)
        XCTAssertEqual(seatMap.rows.map(\.label), ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"])
    }

    func testSeatMapIsConsistent() async throws {
        let seatMap = try await repository.seatMap(showtimeID: "any")
        let ids = seatMap.rows.flatMap { $0.seats.map(\.id) }

        XCTAssertEqual(Set(ids).count, ids.count, "Seat IDs must be unique")
        for row in seatMap.rows {
            let columns = row.seats.map(\.column)
            XCTAssertEqual(Set(columns).count, columns.count, "Row \(row.label) has overlapping columns")
            XCTAssertTrue(columns.allSatisfy { (0..<seatMap.columns).contains($0) }, "Row \(row.label) exceeds grid width")
        }
    }

    func testMissingResourceThrows() async {
        let empty = BundleMovieRepository(bundle: Bundle(for: BundleMovieRepositoryTests.self))
        do {
            _ = try await empty.movie()
            XCTFail("Expected missingResource")
        } catch {
            XCTAssertEqual(error as? RepositoryError, .missingResource("movie"))
        }
    }
}
