import { View } from 'react-native';

import type { CaptureChangeEvent } from '../modules/ticket-kit';

// SOLID (D) Dependency inversion: Jest's moduleNameMapper swaps the native facade for this mock (package.json),
// so hooks and screens are tested without native code.

type Listener<T> = (event: T) => void;

const captureListeners = new Set<Listener<CaptureChangeEvent>>();

export const isCaptured = jest.fn(async () => false);

export const SecureView = View;

export const addCaptureChangeListener = jest.fn((listener: Listener<CaptureChangeEvent>) => {
  captureListeners.add(listener);
  return { remove: () => captureListeners.delete(listener) };
});

/** Test helpers: drive native events from a test. */
export function emitCaptureChange(isCaptured: boolean) {
  captureListeners.forEach((listener) => listener({ isCaptured }));
}

export function captureListenerCount() {
  return captureListeners.size;
}
