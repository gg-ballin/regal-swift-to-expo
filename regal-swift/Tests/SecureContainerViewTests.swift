import UIKit
import XCTest
@testable import RegalNative

@MainActor
final class SecureContainerViewTests: XCTestCase {
    func testHostsContentInSecureCanvas() {
        let container = SecureContainerView()

        XCTAssertTrue(container.isSecure, "UITextField no longer exposes its secure canvas: content would be captured")
        XCTAssertNotEqual(ObjectIdentifier(type(of: container.contentView)), ObjectIdentifier(UIView.self))
        XCTAssertTrue(container.contentView.subviews.isEmpty)
    }

    func testContentViewFillsContainer() {
        let container = SecureContainerView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
        let child = UIView()
        container.contentView.addSubview(child)

        container.frame.size = CGSize(width: 240, height: 240)
        container.layoutIfNeeded()

        XCTAssertTrue(container.contentView.superview === container)
        XCTAssertEqual(container.contentView.frame, container.bounds)
        XCTAssertTrue(child.isDescendant(of: container))
    }
}
