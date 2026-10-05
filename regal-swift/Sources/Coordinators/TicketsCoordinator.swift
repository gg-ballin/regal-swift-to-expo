import UIKit

/// Owns the Movies tab stack: Movie Detail -> Seat Selection -> Ticket.
/// View controllers never push each other; view models report intents through closures.
// RN: no coordinator object; file routes replace it and screens call `router.push` from their hooks.
@MainActor
final class TicketsCoordinator {
    private let navigationController: UINavigationController
    private let repository: any MovieRepository
    private let history: any TicketHistory
    private let haptics = HapticsEngine()
    private let qrCodes = QRCodeStore.shared

    init(navigationController: UINavigationController, repository: any MovieRepository, history: any TicketHistory) {
        self.navigationController = navigationController
        self.repository = repository
        self.history = history
    }

    func start() {
        let viewModel = MovieDetailViewModel(repository: repository)
        viewModel.onShowtimeSelected = { [weak self] selection in
            self?.showSeats(for: selection)
        }
        navigationController.setViewControllers([MovieDetailViewController(viewModel: viewModel)], animated: false)

        #if DEBUG
        openDemoRouteIfRequested()
        #endif
    }

    func showSeats(for selection: ShowtimeSelection) {
        let viewModel = SeatSelectionViewModel(selection: selection, repository: repository, history: history)
        viewModel.onCheckout = { [weak self] ticket in
            self?.showTicket(ticket)
        }
        let viewController = SeatSelectionViewController(viewModel: viewModel, haptics: haptics)
        // RN: router.push({ pathname: '/seats/[showtimeId]', params: { showtimeId, date } }); objects stay in the Zustand store.
        navigationController.pushViewController(viewController, animated: true)
    }

    func showTicket(_ ticket: Ticket) {
        haptics.success()
        let viewModel = TicketViewModel(ticket: ticket, qrCodes: qrCodes)
        viewModel.onDone = { [weak self] in
            // RN: router.dismissTo('/movies').
            self?.navigationController.popToRootViewController(animated: true)
        }
        let viewController = TicketViewController(
            viewModel: viewModel,
            brightness: BrightnessController(),
            captureObserver: CaptureObserver()
        )
        // RN: router.push({ pathname: '/ticket/[ticketId]', params: { ticketId } }).
        navigationController.pushViewController(viewController, animated: true)
    }
}

#if DEBUG
extension TicketsCoordinator {
    /// Deep link for demos/screenshots: launch with `-demoRoute seats` or `-demoRoute ticket`.
    // RN: = deep links `regalexpo://seats/<showtimeId>` and `regalexpo://ticket/demo` (__DEV__ only).
    private func openDemoRouteIfRequested() {
        guard let route = UserDefaults.standard.string(forKey: "demoRoute") else { return }
        Task {
            guard
                let movie = try? await repository.movie(),
                let theatre = try? await repository.showtimes().theatres.first,
                let format = theatre.formats.first,
                let showtime = format.times.first,
                let seatMap = try? await repository.seatMap(showtimeID: showtime.id)
            else { return }

            let selection = ShowtimeSelection(movie: movie, theatre: theatre, format: format, showtime: showtime, date: .now)
            switch route {
            case "seats":
                showSeats(for: selection)
            case "ticket":
                let seatIDs = ["F6", "F7"]
                showTicket(
                    Ticket(
                        id: UUID().uuidString,
                        selection: selection,
                        auditorium: seatMap.auditorium,
                        seatIDs: seatIDs,
                        totalCents: seatMap.pricePerSeatCents * seatIDs.count,
                        currency: seatMap.currency,
                        purchasedAt: .now
                    )
                )
            default:
                break
            }
        }
    }
}
#endif
