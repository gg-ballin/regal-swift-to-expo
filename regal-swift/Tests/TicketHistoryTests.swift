import XCTest
@testable import RegalNative

// RN: src/store/booking.test.ts (persist round-trip through MMKV, Date revival) + ticket.test.ts "history lists purchases newest first".
@MainActor
final class MMKVTicketHistoryTests: XCTestCase {
    private var mmapID = ""

    override func setUp() async throws {
        mmapID = "ticket-history-tests-\(UUID().uuidString)"
    }

    override func tearDown() async throws {
        MMKVTicketHistory(mmapID: mmapID).removeAll()
    }

    func testStartsEmpty() {
        XCTAssertTrue(MMKVTicketHistory(mmapID: mmapID).all().isEmpty)
    }

    func testRoundTripsTheFullTicket() {
        let history = MMKVTicketHistory(mmapID: mmapID)
        let ticket = Fixtures.ticket(seatIDs: ["A1", "B1"])

        history.add(ticket)

        XCTAssertEqual(history.all(), [ticket])
    }

    func testListsPurchasesNewestFirst() {
        let history = MMKVTicketHistory(mmapID: mmapID)
        history.add(Fixtures.ticket(id: "older", purchasedAt: Date(timeIntervalSince1970: 1_000)))
        history.add(Fixtures.ticket(id: "newest", purchasedAt: Date(timeIntervalSince1970: 3_000)))
        history.add(Fixtures.ticket(id: "middle", purchasedAt: Date(timeIntervalSince1970: 2_000)))

        XCTAssertEqual(history.all().map(\.id), ["newest", "middle", "older"])
    }

    func testPersistsAcrossInstances() {
        MMKVTicketHistory(mmapID: mmapID).add(Fixtures.ticket(id: "persisted"))

        XCTAssertEqual(MMKVTicketHistory(mmapID: mmapID).all().map(\.id), ["persisted"])
    }

    func testSameIDOverwrites() {
        let history = MMKVTicketHistory(mmapID: mmapID)
        history.add(Fixtures.ticket(id: "t-1", seatIDs: ["A1"]))
        history.add(Fixtures.ticket(id: "t-1", seatIDs: ["B2"]))

        XCTAssertEqual(history.all().map(\.seatIDs), [["B2"]])
    }
}

@MainActor
final class TicketHistoryViewModelTests: XCTestCase {
    func testReloadBuildsRowsNewestFirst() {
        let history = InMemoryTicketHistory([
            Fixtures.ticket(id: "abcdef12-old", seatIDs: ["A1"], purchasedAt: Date(timeIntervalSince1970: 1_000)),
            Fixtures.ticket(id: "fedcba98-new", seatIDs: ["B1", "B2"], purchasedAt: Date(timeIntervalSince1970: 2_000)),
        ])
        let viewModel = TicketHistoryViewModel(history: history)
        var received: [[String]] = []
        viewModel.onChange = { received.append($0.map(\.id)) }

        viewModel.reload()

        XCTAssertEqual(received, [["fedcba98-new", "abcdef12-old"]])
        let row = viewModel.rows[0]
        XCTAssertEqual(row.movieTitle, "Test Movie")
        XCTAssertEqual(row.details, "Regal Test · B1, B2")
        XCTAssertEqual(row.shortCode, "FEDCBA98")
        XCTAssertEqual(row.qrPayload, try TicketPayload(ticket: history.all()[0]).jsonString())
    }

    func testReloadPicksUpNewPurchases() {
        let history = InMemoryTicketHistory()
        let viewModel = TicketHistoryViewModel(history: history)
        viewModel.reload()
        XCTAssertTrue(viewModel.rows.isEmpty)

        history.add(Fixtures.ticket(id: "new"))
        viewModel.reload()

        XCTAssertEqual(viewModel.rows.map(\.id), ["new"])
    }

    func testSelectEmitsTheStoredTicket() {
        let ticket = Fixtures.ticket(id: "t-1")
        let viewModel = TicketHistoryViewModel(history: InMemoryTicketHistory([ticket]))
        var selected: Ticket?
        viewModel.onSelect = { selected = $0 }
        viewModel.reload()

        viewModel.select(rowID: "missing")
        XCTAssertNil(selected)

        viewModel.select(rowID: "t-1")
        XCTAssertEqual(selected, ticket)
    }
}
