import UIKit

// RN: = useTicket(ticketId) hook (presentation strings) + useTicketScreenProtection() (capture state).
@MainActor
final class TicketViewModel {
    struct State {
        var qrImage: UIImage?
        var isGeneratingQR = false
        var errorMessage: String?
        var isCaptured = false
        var screenshotCount = 0
    }

    private(set) var state = State() {
        didSet { onChange?(state) }
    }

    var onChange: ((State) -> Void)?
    var onScreenshot: (() -> Void)?
    var onDone: (() -> Void)?

    let ticket: Ticket
    private let qrCodes: QRCodeStore

    init(ticket: Ticket, qrCodes: QRCodeStore = .shared) {
        self.ticket = ticket
        self.qrCodes = qrCodes
    }

    // MARK: - Presentation

    var movieTitle: String { ticket.selection.movie.title }
    var movieMeta: String { "\(ticket.selection.movie.rating)  ·  \(ticket.selection.movie.formattedRuntime)" }
    var theatre: String { ticket.selection.theatre.name }
    var format: String { "\(ticket.selection.format.name) · \(ticket.selection.format.seating)" }
    var auditorium: String { ticket.auditorium }
    var date: String { Formatters.longDate(ticket.selection.date) }
    var time: String { ticket.selection.showtime.displayTime }
    var seats: String { ticket.seatIDs.joined(separator: ", ") }
    var admitCount: String { "ADMIT \(ticket.seatIDs.count)" }
    var total: String { Formatters.money(cents: ticket.totalCents, currency: ticket.currency) }
    var shortCode: String { String(ticket.id.prefix(8)).uppercased() }

    // MARK: - Intents

    /// Serves the purchase's stored QR synchronously; otherwise renders it off the main actor and stores it.
    /// `pointSize * scale` pixels keeps it sharp on device.
    // RN: `useQRCode(payload)` in QRSection; synchronous TS encode, so no Task.detached / loading state.
    func generateQRCode(pointSize: CGFloat, scale: CGFloat) async {
        guard state.qrImage == nil, !state.isGeneratingQR else { return }
        state.errorMessage = nil

        do {
            let payload = try TicketPayload(ticket: ticket).jsonString()
            let ticketID = ticket.id
            let pixelSize = pointSize * scale
            if let png = qrCodes.cachedPNG(ticketID: ticketID, payload: payload, pixelSize: pixelSize) {
                state.qrImage = UIImage(data: png, scale: scale)
                return
            }

            state.isGeneratingQR = true
            let qrCodes = self.qrCodes
            let png = try await Task.detached(priority: .userInitiated) {
                try qrCodes.png(ticketID: ticketID, payload: payload, pixelSize: pixelSize)
            }.value
            state.qrImage = UIImage(data: png, scale: scale)
        } catch {
            state.errorMessage = "Couldn't generate your ticket code."
        }
        state.isGeneratingQR = false
    }

    // RN: = ScreenCapture.addScreenshotListener / TicketKit.addCaptureChangeListener callbacks updating useState.
    func handle(_ event: CaptureEvent) {
        switch event {
        case .screenshot:
            state.screenshotCount += 1
            onScreenshot?()
        case .recordingChanged(let isCaptured):
            state.isCaptured = isCaptured
        }
    }

    func done() {
        onDone?()
    }
}
