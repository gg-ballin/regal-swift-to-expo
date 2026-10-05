import UIKit

// RN: presentational component <MovieHero movie={movie} /> (first row of the FlashList).
final class HeroHeaderView: UICollectionReusableView {
    static let elementKind = "hero-header"

    private let backdropView = UIImageView()
    private let scrimView = GradientView(
        colors: [Theme.Color.background.withAlphaComponent(0.55), Theme.Color.background],
        startPoint: CGPoint(x: 0.5, y: 0),
        endPoint: CGPoint(x: 0.5, y: 1)
    )
    private let posterView = UIImageView()
    private let ratingLabel = PaddedLabel(insets: UIEdgeInsets(top: 2, left: 6, bottom: 2, right: 6))
    private let runtimeLabel = UILabel()
    private let titleLabel = UILabel()
    private var imageTask: Task<Void, Never>?
    private var posterURL: URL?
    private var contentTopConstraint: NSLayoutConstraint!

    override init(frame: CGRect) {
        super.init(frame: frame)
        setUp()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    // RN: = effect cleanup / FlashList recycling; expo-image cancels in-flight loads itself.
    override func prepareForReuse() {
        super.prepareForReuse()
        imageTask?.cancel()
        imageTask = nil
        posterURL = nil
        posterView.image = nil
        backdropView.image = nil
    }

    // RN: configure(...) = props -> render. The image task below = <Image source={posterURL} transition={250} /> (expo-image).
    // RN: topInset = useSafeAreaInsets().top.
    func configure(with movie: Movie, topInset: CGFloat) {
        contentTopConstraint.constant = topInset + Theme.Spacing.xl
        ratingLabel.text = movie.rating
        runtimeLabel.text = "|  \(movie.formattedRuntime)"
        titleLabel.text = movie.title
        accessibilityLabel = "\(movie.title), rated \(movie.rating), \(movie.formattedRuntime)"

        guard movie.posterURL != posterURL else { return }
        posterURL = movie.posterURL
        imageTask?.cancel()
        guard let url = movie.posterURL else { return }
        imageTask = Task { [weak self] in
            let image = await ImageLoader.shared.image(for: url)
            guard !Task.isCancelled, let self, self.posterURL == url else { return }
            UIView.transition(with: self, duration: 0.25, options: .transitionCrossDissolve) {
                self.posterView.image = image
                self.backdropView.image = image
            }
        }
    }

    private func setUp() {
        clipsToBounds = true
        backgroundColor = Theme.Color.background
        isAccessibilityElement = true
        accessibilityTraits = .header

        backdropView.contentMode = .scaleAspectFill
        backdropView.alpha = 0.35
        backdropView.clipsToBounds = true
        // Below fittingSizeLevel (50): otherwise the loaded image's intrinsic height drives the self-sized header height.
        backdropView.setContentHuggingPriority(UILayoutPriority(1), for: .vertical)
        backdropView.setContentCompressionResistancePriority(UILayoutPriority(1), for: .vertical)

        let posterGradient = GradientView(colors: Theme.Color.backgroundWarm, startPoint: .zero, endPoint: CGPoint(x: 1, y: 1))
        posterView.contentMode = .scaleAspectFill
        posterView.clipsToBounds = true
        posterView.layer.cornerRadius = Theme.Radius.sm
        posterView.backgroundColor = .clear
        posterGradient.layer.cornerRadius = Theme.Radius.sm
        posterGradient.clipsToBounds = true

        ratingLabel.font = UIFont.systemFont(ofSize: 15, weight: .black)
        ratingLabel.textColor = Theme.Color.tabInactive
        ratingLabel.layer.borderColor = Theme.Color.tabInactive.cgColor
        ratingLabel.layer.borderWidth = 1.5
        ratingLabel.layer.cornerRadius = 2

        runtimeLabel.font = Theme.Font.subtitle
        runtimeLabel.textColor = Theme.Color.textSecondary

        titleLabel.font = Theme.Font.hero
        titleLabel.textColor = Theme.Color.textPrimary
        titleLabel.numberOfLines = 3
        titleLabel.adjustsFontSizeToFitWidth = true
        titleLabel.minimumScaleFactor = 0.7

        let metaRow = UIStackView(arrangedSubviews: [ratingLabel, runtimeLabel])
        metaRow.spacing = Theme.Spacing.sm
        metaRow.alignment = .center

        let textStack = UIStackView(arrangedSubviews: [metaRow, titleLabel])
        textStack.axis = .vertical
        textStack.spacing = Theme.Spacing.sm
        textStack.alignment = .leading

        let contentRow = UIStackView(arrangedSubviews: [posterGradient, textStack])
        contentRow.spacing = Theme.Spacing.xl
        contentRow.alignment = .center

        posterGradient.addSubview(posterView)
        [backdropView, scrimView, contentRow, posterView].forEach { $0.translatesAutoresizingMaskIntoConstraints = false }
        addSubview(backdropView)
        addSubview(scrimView)
        addSubview(contentRow)

        let posterWidth: CGFloat = 120
        // Not safeAreaLayoutGuide: inside a scroll view its inset grows with contentOffset, inflating the self-sized height.
        contentTopConstraint = contentRow.topAnchor.constraint(equalTo: topAnchor, constant: Theme.Spacing.xl)
        NSLayoutConstraint.activate([
            backdropView.topAnchor.constraint(equalTo: topAnchor),
            backdropView.leadingAnchor.constraint(equalTo: leadingAnchor),
            backdropView.trailingAnchor.constraint(equalTo: trailingAnchor),
            backdropView.bottomAnchor.constraint(equalTo: bottomAnchor),
            scrimView.topAnchor.constraint(equalTo: topAnchor),
            scrimView.leadingAnchor.constraint(equalTo: leadingAnchor),
            scrimView.trailingAnchor.constraint(equalTo: trailingAnchor),
            scrimView.bottomAnchor.constraint(equalTo: bottomAnchor),

            posterGradient.widthAnchor.constraint(equalToConstant: posterWidth),
            posterGradient.heightAnchor.constraint(equalTo: posterGradient.widthAnchor, multiplier: 1.5),
            posterView.topAnchor.constraint(equalTo: posterGradient.topAnchor),
            posterView.leadingAnchor.constraint(equalTo: posterGradient.leadingAnchor),
            posterView.trailingAnchor.constraint(equalTo: posterGradient.trailingAnchor),
            posterView.bottomAnchor.constraint(equalTo: posterGradient.bottomAnchor),

            contentTopConstraint,
            contentRow.leadingAnchor.constraint(equalTo: leadingAnchor, constant: Theme.Spacing.lg),
            contentRow.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -Theme.Spacing.lg),
            contentRow.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -Theme.Spacing.lg),
        ])
    }
}

// RN: not needed; <Text style={{ paddingHorizontal: 6, paddingVertical: 2 }}> already pads.
final class PaddedLabel: UILabel {
    private let insets: UIEdgeInsets

    init(insets: UIEdgeInsets) {
        self.insets = insets
        super.init(frame: .zero)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func drawText(in rect: CGRect) {
        super.drawText(in: rect.inset(by: insets))
    }

    override var intrinsicContentSize: CGSize {
        let size = super.intrinsicContentSize
        return CGSize(width: size.width + insets.left + insets.right, height: size.height + insets.top + insets.bottom)
    }
}
