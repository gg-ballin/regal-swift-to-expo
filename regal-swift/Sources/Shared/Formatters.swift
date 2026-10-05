import Foundation

// RN: src/domain/formatters.ts using Intl.DateTimeFormat / Intl.NumberFormat pinned to 'en-US'.
enum Formatters {
    private static let posix = Locale(identifier: "en_US_POSIX")

    static func displayTime(fromTwentyFourHour value: String) -> String? {
        let parts = value.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2, (0..<24).contains(parts[0]), (0..<60).contains(parts[1]) else { return nil }
        let hour12 = parts[0] % 12 == 0 ? 12 : parts[0] % 12
        let suffix = parts[0] < 12 ? "AM" : "PM"
        return String(format: "%d:%02d %@", hour12, parts[1], suffix)
    }

    static func isoDay(_ date: Date, calendar: Calendar = .current) -> String {
        let components = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", components.year ?? 0, components.month ?? 0, components.day ?? 0)
    }

    static func weekdayShort(_ date: Date) -> String {
        date.formatted(.dateTime.weekday(.abbreviated).locale(posix))
    }

    static func dayOfMonth(_ date: Date) -> String {
        date.formatted(.dateTime.day().locale(posix))
    }

    static func longDate(_ date: Date) -> String {
        date.formatted(.dateTime.weekday(.wide).month(.abbreviated).day().locale(posix))
    }

    static func money(cents: Int, currency: String) -> String {
        let amount = Decimal(cents) / 100
        return amount.formatted(.currency(code: currency).locale(Locale(identifier: "en_US")))
    }
}
