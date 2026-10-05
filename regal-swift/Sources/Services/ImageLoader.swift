import UIKit

// RN: not needed; expo-image handles download, memory/disk cache and cancellation (SDWebImage on iOS).
actor ImageLoader {
    static let shared = ImageLoader()

    private var cache: [URL: UIImage] = [:]
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func image(for url: URL) async -> UIImage? {
        if let cached = cache[url] { return cached }
        guard
            let (data, response) = try? await session.data(from: url),
            (response as? HTTPURLResponse)?.statusCode == 200,
            let image = UIImage(data: data)
        else { return nil }
        cache[url] = image
        return image
    }
}
