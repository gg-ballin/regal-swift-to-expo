import Foundation

// RN: = custom hook `useMovieDetail()` (useQuery for data + useState for tab/date). @MainActor ~ "runs on the JS thread".
@MainActor
final class MovieDetailViewModel {
    enum Tab: Int, CaseIterable, Sendable {
        case showtimes, details

        var title: String {
            switch self {
            case .showtimes: "SHOWTIMES"
            case .details: "DETAILS"
            }
        }
    }

    struct State: Equatable {
        var movie: Movie?
        var theatres: [Theatre] = []
        var dates: [Date]
        var selectedDateIndex = 0
        var selectedTab: Tab = .showtimes
        var isLoading = false
        var errorMessage: String?
    }

    static let visibleDays = 7

    // RN: `didSet -> onChange` = setState triggering a re-render; React wires this for you.
    private(set) var state: State {
        didSet { onChange?(state) }
    }

    var onChange: ((State) -> Void)?
    // RN: intent closure = the hook calling store.setSelection(...) then router.push(...).
    var onShowtimeSelected: ((ShowtimeSelection) -> Void)?

    private let repository: any MovieRepository

    init(repository: any MovieRepository, now: Date = .now, calendar: Calendar = .current) {
        self.repository = repository
        let today = calendar.startOfDay(for: now)
        let dates = (0..<Self.visibleDays).compactMap { calendar.date(byAdding: .day, value: $0, to: today) }
        state = State(dates: dates)
    }

    // RN: = useQuery(['movie']) + useQuery(['showtimes']); `async let` = Promise.all; isLoading/errorMessage come from the query.
    func load() async {
        guard !state.isLoading else { return }
        state.isLoading = true
        state.errorMessage = nil
        do {
            async let movie = repository.movie()
            async let showtimes = repository.showtimes()
            let (loadedMovie, loadedShowtimes) = try await (movie, showtimes)
            state.movie = loadedMovie
            state.theatres = loadedShowtimes.theatres
        } catch {
            state.errorMessage = "Couldn't load showtimes. Please try again."
        }
        state.isLoading = false
    }

    func selectTab(_ tab: Tab) {
        guard tab != state.selectedTab else { return }
        state.selectedTab = tab
    }

    func selectDate(at index: Int) {
        guard state.dates.indices.contains(index), index != state.selectedDateIndex else { return }
        state.selectedDateIndex = index
    }

    func selectShowtime(theatreID: String, formatID: String, showtimeID: String) {
        guard
            let movie = state.movie,
            let theatre = state.theatres.first(where: { $0.id == theatreID }),
            let format = theatre.formats.first(where: { $0.id == formatID }),
            let showtime = format.times.first(where: { $0.id == showtimeID })
        else { return }

        onShowtimeSelected?(
            ShowtimeSelection(
                movie: movie,
                theatre: theatre,
                format: format,
                showtime: showtime,
                date: state.dates[state.selectedDateIndex]
            )
        )
    }
}
