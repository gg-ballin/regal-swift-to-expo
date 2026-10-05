import UIKit
import XCTest
@testable import RegalNative

final class QRCodeGeneratorTests: XCTestCase {
    private let pngSignature: [UInt8] = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]

    func testProducesNonEmptyPNG() throws {
        let data = try QRCodeGenerator.png(from: "ticket-123", size: 280)

        XCTAssertFalse(data.isEmpty)
        XCTAssertEqual(Array(data.prefix(8)), pngSignature)
    }

    func testOutputIsDeterministicForSamePayload() throws {
        let first = try QRCodeGenerator.png(from: #"{"seats":["A1"],"ticketId":"t-1"}"#, size: 280)
        let second = try QRCodeGenerator.png(from: #"{"seats":["A1"],"ticketId":"t-1"}"#, size: 280)

        XCTAssertEqual(first, second)
    }

    func testDifferentPayloadsProduceDifferentImages() throws {
        let first = try QRCodeGenerator.png(from: "ticket-1", size: 280)
        let second = try QRCodeGenerator.png(from: "ticket-2", size: 280)

        XCTAssertNotEqual(first, second)
    }

    func testImageIsSquareAndFitsRequestedSize() throws {
        let data = try QRCodeGenerator.png(from: "ticket-123", size: 280)
        let image = try XCTUnwrap(UIImage(data: data, scale: 1))

        XCTAssertEqual(image.size.width, image.size.height)
        XCTAssertLessThanOrEqual(image.size.width, 280)
        XCTAssertGreaterThan(image.size.width, 140, "Integer scaling should still fill most of the requested size")
    }

    func testEmptyPayloadThrows() {
        XCTAssertThrowsError(try QRCodeGenerator.png(from: "", size: 280)) { error in
            XCTAssertEqual(error as? QRCodeError, .emptyPayload)
        }
    }

    func testInvalidSizeThrows() {
        for size in [0, -10, CGFloat.infinity, CGFloat.nan] {
            XCTAssertThrowsError(try QRCodeGenerator.png(from: "ticket", size: size)) { error in
                XCTAssertEqual(error as? QRCodeError, .invalidSize)
            }
        }
    }

    func testRunsOffMainThread() async throws {
        let data = try await Task.detached {
            XCTAssertFalse(Thread.isMainThread)
            return try QRCodeGenerator.png(from: "background", size: 200)
        }.value

        XCTAssertFalse(data.isEmpty)
    }
}
