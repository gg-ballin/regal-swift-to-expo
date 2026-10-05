import Foundation

// RN: = useTicketHistory() (src/features/tickets/useTicketHistory.ts): store selector + ticketHistory() + ticketHistoryRow().
@MainActor
final class TicketHistoryViewModel {
    struct Row: Hashable, Sendable, Identifiable {
        let id: String
        let movieTitle: String
        let showtime: String
        let details: String
        let shortCode: String
        let qrPayload: String

        init(ticket: Ticket) {
            id = ticket.id
            movieTitle = ticket.selection.movie.title
            showtime = "\(Formatters.longDate(ticket.selection.date)) · \(ticket.selection.showtime.displayTime)"
            details = "\(ticket.selection.theatre.name) · \(ticket.seatIDs.joined(separator: ", "))"
            shortCode = String(ticket.id.prefix(8)).uppercased()
            qrPayload = (try? TicketPayload(ticket: ticket).jsonString()) ?? ticket.id
        }
    }

    private(set) var rows: [Row] = [] {
        didSet { onChange?(rows) }
    }

    var onChange: (([Row]) -> Void)?
    var onSelect: ((Ticket) -> Void)?

    private let history: any TicketHistory
    private var ticketsByID: [String: Ticket] = [:]

    init(history: any TicketHistory) {
        self.history = history
    }

    // RN: not needed; the Zustand selector re-renders the list when `tickets` changes.
    func reload() {
        let tickets = history.all()
        ticketsByID = Dictionary(tickets.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        rows = tickets.map(Row.init)
    }

    func select(rowID: String) {
        guard let ticket = ticketsByID[rowID] else { return }
        onSelect?(ticket)
    }
}
