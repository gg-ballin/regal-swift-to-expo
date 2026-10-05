# Regal Port POC: Swift (UIKit) to React Native (Expo)

> Two apps, one feature. `regal-swift/` is fully native (Swift 6, UIKit). `regal-expo/` is React Native + Expo, using Expo libraries first and a small Swift Expo Module only where no library covers the capability.
> Status: both apps implemented; XCTest and Jest suites green.

---

## 1. Goal

- Reproduce, at small scale, a Swift app being ported to React Native + Expo.
- Port **behavior**, not view hierarchies: same flow, same data, same UX contracts.
- Keep native code only where the platform owns the capability, and reuse the existing Swift instead of rewriting it.

## 2. Feature scope: "Get Tickets"

| # | Screen | Content | Platform capability |
|---|---|---|---|
| S1 | Movie Detail / Showtimes | Hero, `SHOWTIMES` / `DETAILS` tabs, 7-day date strip, theatre and format cards, showtime chips | none |
| S2 | Seat Selection | Auditorium grid (available / taken / selected / wheelchair), screen indicator, legend, summary bar + Continue | Haptics |
| S3 | Digital Ticket | Movie, theatre, seats, time, QR code, "Show this at the door" | QR, max brightness while visible, screenshot + recording detection, capture-proof QR |
| S4 | Ticket History | Purchased tickets, persisted across launches | Local persistence |

Out of scope: auth, payments, real API, Wallet.

**Shared data contract.** Both apps read the same JSON (`movie.json`, `showtimes.json`, `seatmap.json`). Prices are integer cents; the date strip is generated (today + 6 days). A Jest test fails if the Expo copy drifts from `regal-swift/MockData`.

## 3. Native core: `TicketKitCore`

Plain Swift in the Swift app (`regal-swift/TicketKitCore/`): `QRCodeGenerator`, `QRCodeStore`, `BrightnessController`, `HapticsEngine`, `CaptureObserver`, `SecureContainerView`.

The Expo app reuses `CaptureObserver` and `CaptureEvent` **as the same files**, through per-file symlinks in `regal-expo/modules/ticket-kit/ios/Core/` (CocoaPods skips symlinked directories, so each file is linked individually).

## 4. Capability sourcing in Expo (libraries first)

| Capability | Expo app source | Custom native code |
|---|---|---|
| Brightness | `expo-brightness` (serialized boost/restore) | none |
| Haptics | `expo-haptics` | none |
| Screenshot detection | `expo-screen-capture` `addScreenshotListener` | none |
| QR | `toqr` (error correction M, same as CoreImage) drawn as one `react-native-svg` path | none |
| Persistence | `react-native-mmkv` behind a Zustand `persist` adapter | none |
| Recording / mirroring detection (iOS) | `ticket-kit` wrapping `TicketKitCore.CaptureObserver` | Swift (shared file) |
| Hide one view from captures (iOS) | `ticket-kit` `<SecureView>` (same technique as `SecureContainerView`) | Swift |
| Recording (Android) | `expo-screen-capture` `preventScreenCaptureAsync` (`FLAG_SECURE`): blocks instead of detecting | none |

## 5. `ticket-kit` design decisions

| Concern | Decision |
|---|---|
| Native scope | Only what no Expo library exposes: `UIScreen.isCaptured` observation and per-view capture hiding |
| Threading | UIKit state read via `AsyncFunction(...).runOnQueue(.main)` + `MainActor.assumeIsolated` |
| Event lifecycle | `OnStartObserving` / `OnStopObserving`: the observer lives only while JS listens (RN equivalent of add/remove observers in `viewWillAppear` / `viewWillDisappear`) |
| Memory | Observer closure captures `[weak self]`; no module → observer → closure retain cycle |
| Cross-platform contract | One JS facade (`isCaptured`, `addCaptureChangeListener`, `SecureView`); Android/web fallback behind the same API |
| Testability | Jest maps `ticket-kit` to a mock; hooks are tested without native code |
| Release cost | Small native surface: most PRs are JS-only, keep the build fingerprint unchanged and ship via EAS Update |

```ts
// modules/ticket-kit/index.ts
export function isCaptured(): Promise<boolean>;
export function addCaptureChangeListener(cb: (e: { isCaptured: boolean }) => void): EventSubscription;
export function SecureView(props: ViewProps): JSX.Element;
```

`useTicketScreenProtection` (S3): on focus, boost brightness, read `isCaptured()`, subscribe to screenshots and recording changes. On blur, restore and unsubscribe. `AppState`: restore when the app leaves `active` (brightness is system-wide), re-boost on return if still focused.

## 6. Architecture parity

| Concern | Swift (UIKit) | Expo |
|---|---|---|
| Navigation | Coordinator + `UINavigationController` / `UITabBarController` | `expo-router` native stack + `NativeTabs` (same UIKit containers) |
| Route arguments | Objects passed in memory | IDs only; screens rehydrate from cache/store (deep links, process death) |
| Screen state | `@MainActor` ViewModel + `onChange` | Hook (logic) + Zustand selectors (state) |
| Business rules | Inside ViewModels | Pure TS in `src/domain/`, unit-tested |
| Data | `MovieRepository` protocol + `Codable` | Same repository interface, zod at the boundary, React Query cache |
| Lists | `UICollectionView` compositional + diffable | FlashList v2 with a row union; per-cell store selectors |
| Lifecycle | `viewWillAppear` / `NotificationCenter` | `useFocusEffect` + `AppState` |
| Persistence | `MMKVTicketHistory` | Zustand `persist` over MMKV |
| Tests | XCTest | Jest + React Native Testing Library (seat tests use the same names as the XCTests) |

## 7. Known limits

- iOS recording **detection** needs native code; no Expo API exposes it. Dropping the shield for `expo-screen-capture` blocking would remove that code but change the Swift UX.
- Android cannot detect recordings without Kotlin; it blocks them with `FLAG_SECURE` instead.
- Brightness changes are system-wide and must be restored manually (blur, background).
- Brightness and haptics have no effect on the simulator; test on a device.
- `<SecureView>` relies on the secure text field canvas (no public UIKit API). If a future iOS changes it, content still renders, just unprotected.
- Wallet (PassKit) needs a paid Apple Developer account and server-side signing.

## 8. Next native modules

PassKit (Add to Wallet), Apple Pay, Live Activities (showtime countdown), with Kotlin counterparts for Android.
