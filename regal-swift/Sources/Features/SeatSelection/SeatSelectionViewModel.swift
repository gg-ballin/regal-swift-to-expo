import Foundation

// RN: rules -> pure functions in src/domain/seatSelection.ts; state -> Zustand booking store; load -> useQuery(['seatMap', id]).
@MainActor
final class SeatSelectionViewModel {
    enum ToggleResult: Equatable {
        case selected
        case deselected
        case rejected(Rejection)
    }

    enum Rejection: Equatable {
        case unavailable
        case maxReached
    }

    struct State: Equatable {
        var seatMap: SeatMap?
        /// Ordered by row, then seat number.
        var selectedSeatIDs: [String] = []
        var isLoading = false
        var errorMessage: String?

        // RN: computed properties = derived values computed during render (no extra state).
        var totalCents: Int { (seatMap?.pricePerSeatCents ?? 0) * selectedSeatIDs.count }
        var canCheckout: Bool { !selectedSeatIDs.isEmpty }
    }

    static let defaultMaxSeats = 10

    private(set) var state = State() {
        didSet { onChange?(state) }
    }

    var onChange: ((State) -> Void)?
    var onCheckout: ((Ticket) -> Void)?

    let selection: ShowtimeSelection
    let maxSeats: Int
    private let repository: any MovieRepository
    private let history: any TicketHistory
    private let makeTicketID: () -> String
    private let now: () -> Date

    init(
        selection: ShowtimeSelection,
        repository: any MovieRepository,
        history: any TicketHistory,
        maxSeats: Int = SeatSelectionViewModel.defaultMaxSeats,
        makeTicketID: @escaping () -> String = { UUID().uuidString },
        now: @escaping () -> Date = Date.init
    ) {
        self.selection = selection
        self.repository = repository
        self.history = history
        self.maxSeats = maxSeats
        self.makeTicketID = makeTicketID
        self.now = now
    }

    var formattedTotal: String {
        Formatters.money(cents: state.totalCents, currency: state.seatMap?.currency ?? "USD")
    }

    func load() async {
        guard !state.isLoading else { return }
        state.isLoading = true
        state.errorMessage = nil
        do {
            state.seatMap = try await repository.seatMap(showtimeID: selection.showtime.id)
        } catch {
            state.errorMessage = "Couldn't load the seat map. Please try again."
        }
        state.isLoading = false
    }

    func isSelected(_ seatID: String) -> Bool {
        state.selectedSeatIDs.contains(seatID)
    }

    // RN: = toggleSeat(seatMap, selected, seatId, maxSeats) -> { result, selected } in src/domain, tested 1:1 in Jest.
    @discardableResult
    func toggle(seatID: String) -> ToggleResult {
        guard let seatMap = state.seatMap, let seat = seatMap.seat(withID: seatID), seat.state == .available else {
            return .rejected(.unavailable)
        }

        if let index = state.selectedSeatIDs.firstIndex(of: seatID) {
            state.selectedSeatIDs.remove(at: index)
            return .deselected
        }

        guard state.selectedSeatIDs.count < maxSeats else { return .rejected(.maxReached) }
        state.selectedSeatIDs = seatMap.sortedSeatIDs(state.selectedSeatIDs + [seatID])
        return .selected
    }

    // RN: = store.checkout(seatMap): buildTicket + `tickets[id] = ticket` (persisted to MMKV by zustand `persist`).
    func checkout() {
        guard state.canCheckout, let seatMap = state.seatMap else { return }
        let ticket = Ticket(
            id: makeTicketID(),
            selection: selection,
            auditorium: seatMap.auditorium,
            seatIDs: state.selectedSeatIDs,
            totalCents: state.totalCents,
            currency: seatMap.currency,
            purchasedAt: now()
        )
        history.add(ticket)
        onCheckout?(ticket)
    }
}
