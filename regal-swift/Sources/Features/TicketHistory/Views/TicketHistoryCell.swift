import UIKit

// RN: <TicketHistoryRow /> (src/features/tickets/components/TicketHistoryRow.tsx).
final class TicketHistoryCell: UICollectionViewListCell {
    static let qrPointSize: CGFloat = 64

    private let qrContainer = UIView()
    // RN: <SecureView> around the thumbnail <QRCode>.
    private let qrSecureContainer = SecureContainerView()
    private let qrImageView = UIImageView()
    private let titleLabel = UILabel()
    private let showtimeLabel = UILabel()
    private let detailsLabel = UILabel()
    private let codeLabel = UILabel()

    private var payload: String?
    private var qrTask: Task<Void, Never>?

    override init(frame: CGRect) {
        super.init(frame: frame)
        configureHierarchy()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    /// Thumbnails render straight from `QRCodeGenerator`: `QRCodeStore` keeps one size per purchase (the ticket screen's).
    func configure(with row: TicketHistoryViewModel.Row, scale: CGFloat) {
        titleLabel.text = row.movieTitle
        showtimeLabel.text = row.showtime
        detailsLabel.text = row.details
        codeLabel.text = row.shortCode
        accessibilityLabel = "\(row.movieTitle), \(row.showtime), \(row.details), code \(row.shortCode)"

        guard payload != row.qrPayload else { return }
        payload = row.qrPayload
        qrImageView.image = nil
        qrTask?.cancel()

        let payload = row.qrPayload
        let pixelSize = Self.qrPointSize * scale
        qrTask = Task { [weak self] in
            let png = try? await Task.detached(priority: .utility) {
                try QRCodeGenerator.png(from: payload, size: pixelSize)
            }.value
            guard let self, !Task.isCancelled, self.payload == payload, let png else { return }
            self.qrImageView.image = UIImage(data: png, scale: scale)
        }
    }

    override func updateConfiguration(using state: UICellConfigurationState) {
        var background = UIBackgroundConfiguration.clear()
        background.backgroundColor = state.isHighlighted || state.isSelected ? Theme.Color.surfaceElevated : .clear
        backgroundConfiguration = background
    }

    private func configureHierarchy() {
        isAccessibilityElement = true
        accessibilityTraits = .button
        accessories = [.disclosureIndicator(options: .init(tintColor: Theme.Color.textMuted))]

        qrContainer.backgroundColor = .white
        qrContainer.layer.cornerRadius = Theme.Radius.sm
        qrContainer.clipsToBounds = true
        qrImageView.contentMode = .scaleAspectFit
        qrImageView.layer.magnificationFilter = .nearest
        qrImageView.translatesAutoresizingMaskIntoConstraints = false
        qrSecureContainer.contentView.addSubview(qrImageView)
        qrSecureContainer.translatesAutoresizingMaskIntoConstraints = false
        qrContainer.addSubview(qrSecureContainer)

        titleLabel.font = Theme.Font.subtitle
        titleLabel.textColor = Theme.Color.textPrimary
        showtimeLabel.font = Theme.Font.body
        showtimeLabel.textColor = Theme.Color.textSecondary
        detailsLabel.font = Theme.Font.body
        detailsLabel.textColor = Theme.Color.textSecondary
        detailsLabel.numberOfLines = 0
        codeLabel.font = Theme.Font.caption
        codeLabel.textColor = Theme.Color.primary

        let text = UIStackView(arrangedSubviews: [titleLabel, showtimeLabel, detailsLabel, codeLabel])
        text.axis = .vertical
        text.spacing = Theme.Spacing.xs

        let row = UIStackView(arrangedSubviews: [qrContainer, text])
        row.alignment = .center
        row.spacing = Theme.Spacing.lg
        row.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(row)

        let inset: CGFloat = 4
        NSLayoutConstraint.activate([
            qrContainer.widthAnchor.constraint(equalToConstant: Self.qrPointSize + inset * 2),
            qrContainer.heightAnchor.constraint(equalTo: qrContainer.widthAnchor),
            qrSecureContainer.topAnchor.constraint(equalTo: qrContainer.topAnchor, constant: inset),
            qrSecureContainer.leadingAnchor.constraint(equalTo: qrContainer.leadingAnchor, constant: inset),
            qrSecureContainer.trailingAnchor.constraint(equalTo: qrContainer.trailingAnchor, constant: -inset),
            qrSecureContainer.bottomAnchor.constraint(equalTo: qrContainer.bottomAnchor, constant: -inset),
            qrImageView.topAnchor.constraint(equalTo: qrSecureContainer.contentView.topAnchor),
            qrImageView.leadingAnchor.constraint(equalTo: qrSecureContainer.contentView.leadingAnchor),
            qrImageView.trailingAnchor.constraint(equalTo: qrSecureContainer.contentView.trailingAnchor),
            qrImageView.bottomAnchor.constraint(equalTo: qrSecureContainer.contentView.bottomAnchor),

            row.topAnchor.constraint(equalTo: contentView.topAnchor, constant: Theme.Spacing.md),
            row.leadingAnchor.constraint(equalTo: contentView.layoutMarginsGuide.leadingAnchor),
            row.trailingAnchor.constraint(equalTo: contentView.layoutMarginsGuide.trailingAnchor),
            row.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -Theme.Spacing.md),
        ])
    }
}
