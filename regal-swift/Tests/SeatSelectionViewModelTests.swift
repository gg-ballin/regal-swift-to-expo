import XCTest
@testable import RegalNative

@MainActor
final class SeatSelectionViewModelTests: XCTestCase {
    private static let purchaseDate = Date(timeIntervalSince1970: 1_790_500_000)

    private func makeLoadedViewModel(
        maxSeats: Int = SeatSelectionViewModel.defaultMaxSeats,
        repository: FakeMovieRepository = FakeMovieRepository(),
        history: InMemoryTicketHistory = InMemoryTicketHistory()
    ) async -> SeatSelectionViewModel {
        let viewModel = SeatSelectionViewModel(
            selection: Fixtures.selection,
            repository: repository,
            history: history,
            maxSeats: maxSeats,
            makeTicketID: { "ticket-123" },
            now: { Self.purchaseDate }
        )
        await viewModel.load()
        return viewModel
    }

    func testLoadPopulatesSeatMap() async {
        let viewModel = await makeLoadedViewModel()

        XCTAssertEqual(viewModel.state.seatMap, Fixtures.seatMap)
        XCTAssertFalse(viewModel.state.isLoading)
        XCTAssertNil(viewModel.state.errorMessage)
    }

    func testLoadFailureSetsErrorMessage() async {
        var repository = FakeMovieRepository()
        repository.seatMapResult = .failure(.missingResource("seatmap"))

        let viewModel = await makeLoadedViewModel(repository: repository)

        XCTAssertNil(viewModel.state.seatMap)
        XCTAssertNotNil(viewModel.state.errorMessage)
    }

    func testToggleSelectsThenDeselects() async {
        let viewModel = await makeLoadedViewModel()

        XCTAssertEqual(viewModel.toggle(seatID: "A1"), .selected)
        XCTAssertEqual(viewModel.state.selectedSeatIDs, ["A1"])
        XCTAssertTrue(viewModel.isSelected("A1"))

        XCTAssertEqual(viewModel.toggle(seatID: "A1"), .deselected)
        XCTAssertTrue(viewModel.state.selectedSeatIDs.isEmpty)
    }

    func testToggleRejectsTakenAndUnknownSeats() async {
        let viewModel = await makeLoadedViewModel()

        XCTAssertEqual(viewModel.toggle(seatID: "A2"), .rejected(.unavailable))
        XCTAssertEqual(viewModel.toggle(seatID: "Z9"), .rejected(.unavailable))
        XCTAssertTrue(viewModel.state.selectedSeatIDs.isEmpty)
    }

    func testToggleBeforeLoadIsRejected() {
        let viewModel = SeatSelectionViewModel(
            selection: Fixtures.selection,
            repository: FakeMovieRepository(),
            history: InMemoryTicketHistory()
        )

        XCTAssertEqual(viewModel.toggle(seatID: "A1"), .rejected(.unavailable))
    }

    func testToggleRespectsMaxSeats() async {
        let viewModel = await makeLoadedViewModel(maxSeats: 2)

        XCTAssertEqual(viewModel.toggle(seatID: "A1"), .selected)
        XCTAssertEqual(viewModel.toggle(seatID: "A3"), .selected)
        XCTAssertEqual(viewModel.toggle(seatID: "B1"), .rejected(.maxReached))
        XCTAssertEqual(viewModel.state.selectedSeatIDs, ["A1", "A3"])

        XCTAssertEqual(viewModel.toggle(seatID: "A1"), .deselected)
        XCTAssertEqual(viewModel.toggle(seatID: "B1"), .selected)
    }

    func testSelectedSeatsAreSortedByRowThenNumber() async {
        let viewModel = await makeLoadedViewModel()

        viewModel.toggle(seatID: "B2")
        viewModel.toggle(seatID: "A3")
        viewModel.toggle(seatID: "B1")
        viewModel.toggle(seatID: "A1")

        XCTAssertEqual(viewModel.state.selectedSeatIDs, ["A1", "A3", "B1", "B2"])
    }

    func testTotalPriceTracksSelection() async {
        let viewModel = await makeLoadedViewModel()
        XCTAssertEqual(viewModel.state.totalCents, 0)
        XCTAssertFalse(viewModel.state.canCheckout)

        viewModel.toggle(seatID: "A1")
        viewModel.toggle(seatID: "B1")

        XCTAssertEqual(viewModel.state.totalCents, 3098)
        XCTAssertEqual(viewModel.formattedTotal, "$30.98")
        XCTAssertTrue(viewModel.state.canCheckout)
    }

    func testOnChangeFiresOnToggle() async {
        let viewModel = await makeLoadedViewModel()
        var received: [[String]] = []
        viewModel.onChange = { received.append($0.selectedSeatIDs) }

        viewModel.toggle(seatID: "A1")
        viewModel.toggle(seatID: "A2")

        XCTAssertEqual(received, [["A1"]])
    }

    func testCheckoutEmitsTicket() async {
        let viewModel = await makeLoadedViewModel()
        var ticket: Ticket?
        viewModel.onCheckout = { ticket = $0 }

        viewModel.checkout()
        XCTAssertNil(ticket, "Checkout without seats must be a no-op")

        viewModel.toggle(seatID: "B1")
        viewModel.toggle(seatID: "A1")
        viewModel.checkout()

        XCTAssertEqual(ticket?.id, "ticket-123")
        XCTAssertEqual(ticket?.seatIDs, ["A1", "B1"])
        XCTAssertEqual(ticket?.totalCents, 3098)
        XCTAssertEqual(ticket?.auditorium, "Auditorium 1")
        XCTAssertEqual(ticket?.selection, Fixtures.selection)
        XCTAssertEqual(ticket?.purchasedAt, Self.purchaseDate)
    }

    // RN: seatSelection.test.tsx "checkout stores the ticket" (store.tickets, persisted by zustand + MMKV).
    func testCheckoutAddsTicketToHistory() async {
        let history = InMemoryTicketHistory()
        let viewModel = await makeLoadedViewModel(history: history)

        viewModel.checkout()
        XCTAssertTrue(history.tickets.isEmpty, "Checkout without seats must not record a purchase")

        viewModel.toggle(seatID: "A1")
        viewModel.checkout()

        XCTAssertEqual(history.tickets.map(\.id), ["ticket-123"])
        XCTAssertEqual(history.tickets.first?.seatIDs, ["A1"])
    }
}
