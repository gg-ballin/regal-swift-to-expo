import Foundation
import os

/// In-memory QR PNGs, one per purchase (ticket ID), kept for the app session.
/// An entry is reused only while its payload and pixel size match; otherwise it is re-rendered and replaced.
// RN: no equivalent; TS encoding takes ~1 ms and `useQRCode` memoizes per payload, so there is nothing to cache.
public final class QRCodeStore: Sendable {
    public typealias Generator = @Sendable (_ payload: String, _ pixelSize: CGFloat) throws -> Data

    public static let shared = QRCodeStore()

    private struct Entry: Sendable {
        let payload: String
        let pixelSize: CGFloat
        let png: Data
    }

    private let entries = OSAllocatedUnfairLock<[String: Entry]>(initialState: [:])
    private let generator: Generator

    public init(generator: @escaping Generator = { try QRCodeGenerator.png(from: $0, size: $1) }) {
        self.generator = generator
    }

    public var count: Int { entries.withLock { $0.count } }

    /// Stored PNG for `ticketID`, or `nil` if missing or rendered from a different payload/size. Never renders.
    public func cachedPNG(ticketID: String, payload: String, pixelSize: CGFloat) -> Data? {
        guard let entry = entries.withLock({ $0[ticketID] }), entry.payload == payload, entry.pixelSize == pixelSize else {
            return nil
        }
        return entry.png
    }

    /// Stored PNG when it matches, otherwise renders synchronously and stores it. Errors are not stored.
    public func png(ticketID: String, payload: String, pixelSize: CGFloat) throws -> Data {
        if let png = cachedPNG(ticketID: ticketID, payload: payload, pixelSize: pixelSize) { return png }
        let png = try generator(payload, pixelSize)
        let entry = Entry(payload: payload, pixelSize: pixelSize, png: png)
        entries.withLock { $0[ticketID] = entry }
        return png
    }

    public func remove(ticketID: String) {
        _ = entries.withLock { $0.removeValue(forKey: ticketID) }
    }

    public func removeAll() {
        entries.withLock { $0.removeAll() }
    }
}
