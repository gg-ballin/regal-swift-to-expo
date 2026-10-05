import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation

public enum QRCodeError: Error, Equatable, Sendable {
    case emptyPayload
    case invalidSize
    case generationFailed
    case encodingFailed
}

// RN: not bridged; `encodeQR(payload)` + <QRCode /> (src/components/QRCode.tsx): toqr at level M drawn as one react-native-svg <Path>. Throws = null.
public enum QRCodeGenerator {
    // Expensive to create and thread-safe, so a single instance is shared.
    private static let context = CIContext()

    /// Renders `payload` as a QR code PNG whose side is the largest integer multiple of the
    /// QR module count that fits in `size` points (integer scaling keeps the modules crisp).
    public static func png(from payload: String, size: CGFloat) throws -> Data {
        guard !payload.isEmpty else { throw QRCodeError.emptyPayload }
        guard size.isFinite, size > 0 else { throw QRCodeError.invalidSize }

        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(payload.utf8)
        filter.correctionLevel = "M"

        guard let output = filter.outputImage, output.extent.width > 0 else {
            throw QRCodeError.generationFailed
        }

        let scale = max(1, (size / output.extent.width).rounded(.down))
        let scaled = output.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

        guard
            let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
            let data = context.pngRepresentation(of: scaled, format: .RGBA8, colorSpace: colorSpace)
        else {
            throw QRCodeError.encodingFailed
        }
        return data
    }
}
