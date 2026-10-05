import UIKit

// RN: screen component src/app/ticket/[ticketId].tsx.
final class TicketViewController: UIViewController {
    private static let qrPointSize: CGFloat = 240

    private let viewModel: TicketViewModel
    private let brightness: BrightnessController
    private let captureObserver: CaptureObserver

    // RN: <SecureView> around <QRCode>: the QR is blank in screenshots/recordings.
    private let qrSecureContainer = SecureContainerView()
    private let qrImageView = UIImageView()
    private let qrSpinner = UIActivityIndicatorView(style: .medium)
    // RN: <BlurView tint="systemChromeMaterialDark" /> from expo-blur (wraps this same class).
    private let captureShield = UIVisualEffectView(effect: UIBlurEffect(style: .systemChromeMaterialDark))
    private let doorLabel = UILabel()
    private var isOnScreen = false

    init(viewModel: TicketViewModel, brightness: BrightnessController, captureObserver: CaptureObserver) {
        self.viewModel = viewModel
        self.brightness = brightness
        self.captureObserver = captureObserver
        super.init(nibName: nil, bundle: nil)
        // RN: Stack.Screen options { title: 'Your Ticket', headerBackVisible: false, gestureEnabled: false, headerRight: Done }.
        title = "Your Ticket"
        hidesBottomBarWhenPushed = true
        navigationItem.hidesBackButton = true
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.background
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            systemItem: .done,
            primaryAction: UIAction { [weak self] _ in self?.viewModel.done() }
        )
        configureHierarchy()

        viewModel.onChange = { [weak self] state in
            self?.render(state)
        }
        viewModel.onScreenshot = { [weak self] in
            self?.presentScreenshotWarning()
        }
        render(viewModel.state)

        // RN: AppState.addEventListener('change', ...) inside useTicketScreenProtection.
        NotificationCenter.default.addObserver(
            self, selector: #selector(appWillResignActive), name: UIApplication.willResignActiveNotification, object: nil
        )
        NotificationCenter.default.addObserver(
            self, selector: #selector(appDidBecomeActive), name: UIApplication.didBecomeActiveNotification, object: nil
        )

        let scale = view.window?.windowScene?.screen.scale ?? traitCollection.displayScale
        Task { await viewModel.generateQRCode(pointSize: Self.qrPointSize, scale: max(scale, 1)) }
    }

    // RN: viewWillAppear/viewWillDisappear = useFocusEffect(() => { onFocus(); return onBlur; }). Not useEffect: a pushed screen stays mounted.
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        isOnScreen = true
        brightness.boost()
        startCaptureObservation()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        isOnScreen = false
        brightness.restore()
        captureObserver.stop()
    }

    // MARK: - Lifecycle & capture

    private func startCaptureObservation() {
        viewModel.handle(.recordingChanged(isCaptured: CaptureObserver.isCaptured))
        captureObserver.start { [weak viewModel] event in
            MainActor.assumeIsolated {
                viewModel?.handle(event)
            }
        }
    }

    /// Brightness is system-wide: never leave it boosted while the app is in the background.
    @objc private func appWillResignActive() {
        brightness.restore()
    }

    @objc private func appDidBecomeActive() {
        guard isOnScreen else { return }
        brightness.boost()
        viewModel.handle(.recordingChanged(isCaptured: CaptureObserver.isCaptured))
    }

    // MARK: - Rendering

    private func render(_ state: TicketViewModel.State) {
        qrImageView.image = state.qrImage
        if state.isGeneratingQR { qrSpinner.startAnimating() } else { qrSpinner.stopAnimating() }

        let shouldShield = state.isCaptured
        if captureShield.isHidden == shouldShield {
            UIView.transition(with: captureShield, duration: 0.2, options: .transitionCrossDissolve) {
                self.captureShield.isHidden = !shouldShield
            }
        }

        if let message = state.errorMessage {
            doorLabel.text = message
            doorLabel.textColor = Theme.Color.primary
        } else {
            doorLabel.text = shouldShield ? "Stop screen recording to show your code" : "Show this at the door"
            doorLabel.textColor = shouldShield ? Theme.Color.primary : Theme.Color.textSecondary
        }
        qrImageView.accessibilityLabel = shouldShield ? "Ticket code hidden while the screen is being recorded" : "Ticket QR code"
    }

    // RN: Alert.alert('Screenshot detected', message).
    private func presentScreenshotWarning() {
        guard presentedViewController == nil else { return }
        let alert = UIAlertController(
            title: "Screenshot detected",
            message: "Screenshots of your ticket may not be accepted at the door. Please show this screen instead.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    // MARK: - Layout

    private func configureHierarchy() {
        let scrollView = UIScrollView()
        scrollView.alwaysBounceVertical = true
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        let card = makeTicketCard()
        card.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(card)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            card.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor, constant: Theme.Spacing.lg),
            card.leadingAnchor.constraint(equalTo: scrollView.frameLayoutGuide.leadingAnchor, constant: Theme.Spacing.lg),
            card.trailingAnchor.constraint(equalTo: scrollView.frameLayoutGuide.trailingAnchor, constant: -Theme.Spacing.lg),
            card.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -Theme.Spacing.xl),
        ])
    }

    private func makeTicketCard() -> UIView {
        let card = UIView()
        card.backgroundColor = Theme.Color.surface
        card.layer.cornerRadius = Theme.Radius.lg
        card.layer.borderWidth = 1
        card.layer.borderColor = Theme.Color.border.cgColor
        card.clipsToBounds = true

        let header = makeHeader()

        let title = UILabel()
        title.text = viewModel.movieTitle
        title.font = Theme.Font.hero
        title.textColor = Theme.Color.textPrimary
        title.numberOfLines = 0
        title.accessibilityTraits = .header

        let meta = UILabel()
        meta.text = viewModel.movieMeta
        meta.font = Theme.Font.subtitle
        meta.textColor = Theme.Color.textSecondary

        let details = UIStackView(arrangedSubviews: [
            makeInfoRow([("THEATRE", viewModel.theatre)]),
            makeInfoRow([("FORMAT", viewModel.format)]),
            makeInfoRow([("DATE", viewModel.date), ("TIME", viewModel.time)]),
            makeInfoRow([("AUDITORIUM", viewModel.auditorium), ("SEATS", viewModel.seats)]),
            makeInfoRow([("TOTAL", viewModel.total), ("CODE", viewModel.shortCode)]),
        ])
        details.axis = .vertical
        details.spacing = Theme.Spacing.lg

        let qrSection = makeQRSection()
        let separator = DashedSeparatorView()
        let body = UIStackView(arrangedSubviews: [title, meta, qrSection, separator, details])
        body.axis = .vertical
        body.spacing = Theme.Spacing.sm
        body.setCustomSpacing(Theme.Spacing.xl, after: meta)
        body.setCustomSpacing(Theme.Spacing.xl, after: qrSection)
        body.setCustomSpacing(Theme.Spacing.xl, after: separator)

        [header, body].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            card.addSubview($0)
        }
        NSLayoutConstraint.activate([
            header.topAnchor.constraint(equalTo: card.topAnchor),
            header.leadingAnchor.constraint(equalTo: card.leadingAnchor),
            header.trailingAnchor.constraint(equalTo: card.trailingAnchor),
            header.heightAnchor.constraint(equalToConstant: 48),

            body.topAnchor.constraint(equalTo: header.bottomAnchor, constant: Theme.Spacing.xl),
            body.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: Theme.Spacing.xl),
            body.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -Theme.Spacing.xl),
            body.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -Theme.Spacing.xl),
        ])
        return card
    }

    private func makeHeader() -> UIView {
        let header = GradientView(colors: Theme.Color.primaryGradient)

        let brand = UILabel()
        brand.text = "REGAL"
        brand.font = UIFont.systemFont(ofSize: 20, weight: .black)
        brand.textColor = Theme.Color.textOnPrimary

        let admit = UILabel()
        admit.text = viewModel.admitCount
        admit.font = Theme.Font.tab
        admit.textColor = Theme.Color.textOnPrimary

        let row = UIStackView(arrangedSubviews: [brand, UIView(), admit])
        row.alignment = .center
        row.translatesAutoresizingMaskIntoConstraints = false
        header.addSubview(row)
        NSLayoutConstraint.activate([
            row.leadingAnchor.constraint(equalTo: header.leadingAnchor, constant: Theme.Spacing.xl),
            row.trailingAnchor.constraint(equalTo: header.trailingAnchor, constant: -Theme.Spacing.xl),
            row.centerYAnchor.constraint(equalTo: header.centerYAnchor),
        ])
        return header
    }

    private func makeInfoRow(_ entries: [(title: String, value: String)]) -> UIView {
        let row = UIStackView(arrangedSubviews: entries.map { entry in
            let title = UILabel()
            title.text = entry.title
            title.font = Theme.Font.caption
            title.textColor = Theme.Color.textMuted

            let value = UILabel()
            value.text = entry.value
            value.font = Theme.Font.subtitle
            value.textColor = Theme.Color.textPrimary
            value.numberOfLines = 0

            let column = UIStackView(arrangedSubviews: [title, value])
            column.axis = .vertical
            column.spacing = Theme.Spacing.xs
            column.alignment = .leading
            column.isAccessibilityElement = true
            column.accessibilityLabel = "\(entry.title.capitalized): \(entry.value)"
            return column
        })
        row.distribution = .fillEqually
        row.alignment = .top
        row.spacing = Theme.Spacing.lg
        return row
    }

    private func makeQRSection() -> UIView {
        let qrContainer = UIView()
        qrContainer.backgroundColor = .white
        qrContainer.layer.cornerRadius = Theme.Radius.md
        qrContainer.clipsToBounds = true

        qrImageView.contentMode = .scaleAspectFit
        qrImageView.layer.magnificationFilter = .nearest
        qrImageView.isAccessibilityElement = true

        qrSpinner.color = Theme.Color.background
        qrSpinner.hidesWhenStopped = true

        let shieldIcon = UIImageView(image: UIImage(systemName: "eye.slash.fill"))
        shieldIcon.tintColor = Theme.Color.textPrimary
        shieldIcon.preferredSymbolConfiguration = UIImage.SymbolConfiguration(pointSize: 36, weight: .semibold)
        shieldIcon.translatesAutoresizingMaskIntoConstraints = false
        captureShield.contentView.addSubview(shieldIcon)
        captureShield.isHidden = true

        qrImageView.translatesAutoresizingMaskIntoConstraints = false
        qrSecureContainer.contentView.addSubview(qrImageView)

        [qrSecureContainer, qrSpinner, captureShield].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            qrContainer.addSubview($0)
        }

        let padding = Theme.Spacing.md
        NSLayoutConstraint.activate([
            qrContainer.widthAnchor.constraint(equalToConstant: Self.qrPointSize + padding * 2),
            qrContainer.heightAnchor.constraint(equalTo: qrContainer.widthAnchor),
            qrSecureContainer.topAnchor.constraint(equalTo: qrContainer.topAnchor, constant: padding),
            qrSecureContainer.leadingAnchor.constraint(equalTo: qrContainer.leadingAnchor, constant: padding),
            qrSecureContainer.trailingAnchor.constraint(equalTo: qrContainer.trailingAnchor, constant: -padding),
            qrSecureContainer.bottomAnchor.constraint(equalTo: qrContainer.bottomAnchor, constant: -padding),
            qrImageView.topAnchor.constraint(equalTo: qrSecureContainer.contentView.topAnchor),
            qrImageView.leadingAnchor.constraint(equalTo: qrSecureContainer.contentView.leadingAnchor),
            qrImageView.trailingAnchor.constraint(equalTo: qrSecureContainer.contentView.trailingAnchor),
            qrImageView.bottomAnchor.constraint(equalTo: qrSecureContainer.contentView.bottomAnchor),
            qrSpinner.centerXAnchor.constraint(equalTo: qrContainer.centerXAnchor),
            qrSpinner.centerYAnchor.constraint(equalTo: qrContainer.centerYAnchor),
            captureShield.topAnchor.constraint(equalTo: qrContainer.topAnchor),
            captureShield.leadingAnchor.constraint(equalTo: qrContainer.leadingAnchor),
            captureShield.trailingAnchor.constraint(equalTo: qrContainer.trailingAnchor),
            captureShield.bottomAnchor.constraint(equalTo: qrContainer.bottomAnchor),
            shieldIcon.centerXAnchor.constraint(equalTo: captureShield.contentView.centerXAnchor),
            shieldIcon.centerYAnchor.constraint(equalTo: captureShield.contentView.centerYAnchor),
        ])

        doorLabel.font = Theme.Font.subtitle
        doorLabel.textAlignment = .center
        doorLabel.numberOfLines = 0

        let section = UIStackView(arrangedSubviews: [qrContainer, doorLabel])
        section.axis = .vertical
        section.alignment = .center
        section.spacing = Theme.Spacing.lg
        return section
    }
}

// RN: react-native-svg <Line strokeDasharray="6,4" />.
private final class DashedSeparatorView: UIView {
    private let shape = CAShapeLayer()

    override init(frame: CGRect) {
        super.init(frame: frame)
        shape.strokeColor = Theme.Color.border.cgColor
        shape.lineWidth = 1
        shape.lineDashPattern = [6, 4]
        layer.addSublayer(shape)
        heightAnchor.constraint(equalToConstant: 1).isActive = true
        isAccessibilityElement = false
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func layoutSubviews() {
        super.layoutSubviews()
        let path = UIBezierPath()
        path.move(to: CGPoint(x: 0, y: bounds.midY))
        path.addLine(to: CGPoint(x: bounds.width, y: bounds.midY))
        shape.path = path.cgPath
    }
}
