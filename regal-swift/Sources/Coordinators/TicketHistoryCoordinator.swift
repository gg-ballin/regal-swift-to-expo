import UIKit

/// Owns the Tickets tab stack: Ticket History -> Ticket.
// RN: file routes (tabs)/tickets/index.tsx -> router.push('/ticket/[ticketId]'); Done = router.dismissAll().
@MainActor
final class TicketHistoryCoordinator {
    private let navigationController: UINavigationController
    private let history: any TicketHistory
    private let qrCodes = QRCodeStore.shared

    init(navigationController: UINavigationController, history: any TicketHistory) {
        self.navigationController = navigationController
        self.history = history
    }

    func start() {
        let viewModel = TicketHistoryViewModel(history: history)
        viewModel.onSelect = { [weak self] ticket in
            self?.showTicket(ticket)
        }
        navigationController.setViewControllers([TicketHistoryViewController(viewModel: viewModel)], animated: false)
    }

    func showTicket(_ ticket: Ticket) {
        let viewModel = TicketViewModel(ticket: ticket, qrCodes: qrCodes)
        viewModel.onDone = { [weak self] in
            self?.navigationController.popToRootViewController(animated: true)
        }
        let viewController = TicketViewController(
            viewModel: viewModel,
            brightness: BrightnessController(),
            captureObserver: CaptureObserver()
        )
        navigationController.pushViewController(viewController, animated: true)
    }
}
