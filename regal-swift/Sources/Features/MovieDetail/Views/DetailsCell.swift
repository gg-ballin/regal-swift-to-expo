import UIKit

// RN: presentational <MovieDetails movie />.
final class DetailsCell: UICollectionViewCell {
    private let stack = UIStackView()

    override init(frame: CGRect) {
        super.init(frame: frame)
        stack.axis = .vertical
        stack.spacing = Theme.Spacing.lg
        stack.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: contentView.topAnchor, constant: Theme.Spacing.xl),
            stack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: Theme.Spacing.lg),
            stack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -Theme.Spacing.lg),
            stack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -Theme.Spacing.xl),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func configure(with movie: Movie) {
        stack.arrangedSubviews.forEach { $0.removeFromSuperview() }

        let synopsis = UILabel()
        synopsis.text = movie.synopsis
        synopsis.font = Theme.Font.body
        synopsis.textColor = Theme.Color.textPrimary
        synopsis.numberOfLines = 0
        stack.addArrangedSubview(synopsis)

        stack.addArrangedSubview(makeRow(title: "DIRECTOR", value: movie.director))
        stack.addArrangedSubview(makeRow(title: "CAST", value: movie.cast.joined(separator: ", ")))
        let genre = makeRow(title: "GENRE", value: movie.genres.joined(separator: ", "))
        stack.addArrangedSubview(genre)
        stack.setCustomSpacing(Theme.Spacing.xxl, after: genre)
        stack.addArrangedSubview(makeBuiltWithFooter())
    }

    private func makeBuiltWithFooter() -> UIView {
        let icon = UIImageView(image: UIImage(named: "BuiltWith"))
        icon.contentMode = .scaleAspectFill
        icon.layer.cornerRadius = 11
        icon.layer.cornerCurve = .continuous
        icon.clipsToBounds = true
        icon.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            icon.widthAnchor.constraint(equalToConstant: 48),
            icon.heightAnchor.constraint(equalToConstant: 48),
        ])

        let label = UILabel()
        label.text = "This app was made with Swift"
        label.font = Theme.Font.caption
        label.textColor = Theme.Color.textMuted
        label.numberOfLines = 0

        let footer = UIStackView(arrangedSubviews: [icon, label])
        footer.axis = .horizontal
        footer.alignment = .center
        footer.spacing = Theme.Spacing.md
        footer.isAccessibilityElement = true
        footer.accessibilityLabel = label.text
        return footer
    }

    private func makeRow(title: String, value: String) -> UIView {
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = Theme.Font.caption
        titleLabel.textColor = Theme.Color.textMuted

        let valueLabel = UILabel()
        valueLabel.text = value
        valueLabel.font = Theme.Font.body
        valueLabel.textColor = Theme.Color.textSecondary
        valueLabel.numberOfLines = 0

        let row = UIStackView(arrangedSubviews: [titleLabel, valueLabel])
        row.axis = .vertical
        row.spacing = Theme.Spacing.xs
        row.isAccessibilityElement = true
        row.accessibilityLabel = "\(title.capitalized): \(value)"
        return row
    }
}
