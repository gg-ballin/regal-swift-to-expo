import os
import XCTest
@testable import RegalNative

/// Counts renders so tests can tell a stored hit from a regeneration.
private final class CountingGenerator: Sendable {
    private let calls = OSAllocatedUnfairLock(initialState: 0)
    private let error: QRCodeError?

    init(failingWith error: QRCodeError? = nil) {
        self.error = error
    }

    var count: Int { calls.withLock { $0 } }

    func callAsFunction(_ payload: String, _ pixelSize: CGFloat) throws -> Data {
        calls.withLock { $0 += 1 }
        if let error { throw error }
        return Data("\(payload)@\(pixelSize)".utf8)
    }
}

final class QRCodeStoreTests: XCTestCase {
    func testStoresOnePNGPerPurchase() throws {
        let generator = CountingGenerator()
        let store = QRCodeStore(generator: { try generator($0, $1) })

        let first = try store.png(ticketID: "t-1", payload: "p-1", pixelSize: 720)
        let second = try store.png(ticketID: "t-1", payload: "p-1", pixelSize: 720)

        XCTAssertEqual(first, second)
        XCTAssertEqual(generator.count, 1)
        XCTAssertEqual(store.count, 1)
    }

    func testKeepsEachPurchaseSeparately() throws {
        let generator = CountingGenerator()
        let store = QRCodeStore(generator: { try generator($0, $1) })

        let first = try store.png(ticketID: "t-1", payload: "p-1", pixelSize: 720)
        let second = try store.png(ticketID: "t-2", payload: "p-2", pixelSize: 720)

        XCTAssertNotEqual(first, second)
        XCTAssertEqual(store.count, 2)
        XCTAssertEqual(store.cachedPNG(ticketID: "t-1", payload: "p-1", pixelSize: 720), first)
        XCTAssertEqual(store.cachedPNG(ticketID: "t-2", payload: "p-2", pixelSize: 720), second)
    }

    func testRerendersAndReplacesWhenPayloadOrSizeChanges() throws {
        let generator = CountingGenerator()
        let store = QRCodeStore(generator: { try generator($0, $1) })

        _ = try store.png(ticketID: "t-1", payload: "p-1", pixelSize: 720)
        _ = try store.png(ticketID: "t-1", payload: "p-1", pixelSize: 480)
        let latest = try store.png(ticketID: "t-1", payload: "p-1b", pixelSize: 480)

        XCTAssertEqual(generator.count, 3)
        XCTAssertEqual(store.count, 1)
        XCTAssertNil(store.cachedPNG(ticketID: "t-1", payload: "p-1", pixelSize: 720))
        XCTAssertEqual(store.cachedPNG(ticketID: "t-1", payload: "p-1b", pixelSize: 480), latest)
    }

    func testCachedPNGNeverRenders() {
        let generator = CountingGenerator()
        let store = QRCodeStore(generator: { try generator($0, $1) })

        XCTAssertNil(store.cachedPNG(ticketID: "t-1", payload: "p-1", pixelSize: 720))
        XCTAssertEqual(generator.count, 0)
    }

    func testFailuresAreNotStored() {
        let generator = CountingGenerator(failingWith: .generationFailed)
        let store = QRCodeStore(generator: { try generator($0, $1) })

        XCTAssertThrowsError(try store.png(ticketID: "t-1", payload: "p-1", pixelSize: 720)) { error in
            XCTAssertEqual(error as? QRCodeError, .generationFailed)
        }
        XCTAssertEqual(store.count, 0)
    }

    func testRemove() throws {
        let store = QRCodeStore(generator: { payload, _ in Data(payload.utf8) })
        _ = try store.png(ticketID: "t-1", payload: "p-1", pixelSize: 720)
        _ = try store.png(ticketID: "t-2", payload: "p-2", pixelSize: 720)

        store.remove(ticketID: "t-1")
        XCTAssertEqual(store.count, 1)

        store.removeAll()
        XCTAssertEqual(store.count, 0)
    }

    func testConcurrentAccessIsSafe() async throws {
        let store = QRCodeStore(generator: { payload, _ in Data(payload.utf8) })

        try await withThrowingTaskGroup(of: Void.self) { group in
            for index in 0..<100 {
                group.addTask {
                    _ = try store.png(ticketID: "t-\(index % 10)", payload: "p-\(index % 10)", pixelSize: 720)
                }
            }
            try await group.waitForAll()
        }

        XCTAssertEqual(store.count, 10)
    }
}

@MainActor
final class TicketViewModelQRTests: XCTestCase {
    private let ticket = Fixtures.ticket()

    private func realPNG() throws -> Data {
        try QRCodeGenerator.png(from: "ticket-123", size: 240)
    }

    func testFirstShowRendersAndStoresTheQR() async throws {
        let png = try realPNG()
        let generator = CountingGenerator()
        let store = QRCodeStore(generator: { payload, size in
            _ = try generator(payload, size)
            return png
        })
        let viewModel = TicketViewModel(ticket: ticket, qrCodes: store)

        await viewModel.generateQRCode(pointSize: 240, scale: 1)

        XCTAssertNotNil(viewModel.state.qrImage)
        XCTAssertFalse(viewModel.state.isGeneratingQR)
        XCTAssertEqual(generator.count, 1)
        XCTAssertEqual(store.count, 1)
    }

    func testReopeningThePurchaseReusesTheStoredQR() async throws {
        let png = try realPNG()
        let generator = CountingGenerator()
        let store = QRCodeStore(generator: { payload, size in
            _ = try generator(payload, size)
            return png
        })

        await TicketViewModel(ticket: ticket, qrCodes: store).generateQRCode(pointSize: 240, scale: 1)

        let reopened = TicketViewModel(ticket: ticket, qrCodes: store)
        var observedGenerating = false
        reopened.onChange = { observedGenerating = observedGenerating || $0.isGeneratingQR }
        await reopened.generateQRCode(pointSize: 240, scale: 1)

        XCTAssertNotNil(reopened.state.qrImage)
        XCTAssertFalse(observedGenerating, "A stored QR must show without the spinner")
        XCTAssertEqual(generator.count, 1)
    }

    func testGenerationFailureSetsErrorMessage() async {
        let generator = CountingGenerator(failingWith: .generationFailed)
        let store = QRCodeStore(generator: { try generator($0, $1) })
        let viewModel = TicketViewModel(ticket: ticket, qrCodes: store)

        await viewModel.generateQRCode(pointSize: 240, scale: 1)

        XCTAssertNil(viewModel.state.qrImage)
        XCTAssertNotNil(viewModel.state.errorMessage)
        XCTAssertFalse(viewModel.state.isGeneratingQR)
        XCTAssertEqual(store.count, 0)
    }
}
