import * as Brightness from 'expo-brightness';

/**
 * Screen brightness is system-wide on iOS and outlives the screen, so every boost must be paired with a restore.
 * Calls run one at a time: a restore issued while a boost is still reading the original value waits for it.
 */
// SWIFT: TicketKitCore.BrightnessController (`@MainActor` serializes boost()/restore(); `originalBrightness` is captured once).
let originalBrightness: number | null = null;
let queue: Promise<void> = Promise.resolve();

function enqueue(operation: () => Promise<void>): Promise<void> {
  const next = queue.then(operation);
  queue = next.catch(() => {});
  return next;
}

export function boostBrightness(): Promise<void> {
  return enqueue(async () => {
    if (originalBrightness === null) originalBrightness = await Brightness.getBrightnessAsync();
    await Brightness.setBrightnessAsync(1);
  });
}

export function restoreBrightness(): Promise<void> {
  return enqueue(async () => {
    if (originalBrightness === null) return;
    const original = originalBrightness;
    originalBrightness = null;
    await Brightness.setBrightnessAsync(original);
  });
}
