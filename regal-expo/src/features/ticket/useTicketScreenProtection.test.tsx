// SWIFT: no XCTest counterpart; the TicketViewController lifecycle (viewWillAppear/Disappear + NotificationCenter) is untested there.
import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import * as TicketKit from 'ticket-kit';

import { boostBrightness, restoreBrightness } from './brightness';
import { useTicketScreenProtection } from './useTicketScreenProtection';

// Focus = mounted, blur = unmounted: enough to exercise the focus-effect contract without a navigator.
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return { useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]) };
});

jest.mock('./brightness', () => ({
  boostBrightness: jest.fn(async () => {}),
  restoreBrightness: jest.fn(async () => {}),
}));

const mockScreenshotListeners = new Set<() => void>();
jest.mock('expo-screen-capture', () => ({
  addScreenshotListener: jest.fn((listener: () => void) => {
    mockScreenshotListeners.add(listener);
    return { remove: () => mockScreenshotListeners.delete(listener) };
  }),
}));

const mock = TicketKit as unknown as typeof import('../../../__mocks__/ticket-kit');
const boost = jest.mocked(boostBrightness);
const restore = jest.mocked(restoreBrightness);

let appStateListener: ((state: AppStateStatus) => void) | undefined;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    appStateListener = listener as (state: AppStateStatus) => void;
    return { remove: () => (appStateListener = undefined) };
  });
});

describe('useTicketScreenProtection', () => {
  test('boosts brightness and subscribes on focus, restores and unsubscribes on blur', async () => {
    const { unmount } = await renderHook(() => useTicketScreenProtection(jest.fn()));

    expect(boost).toHaveBeenCalledTimes(1);
    expect(restore).not.toHaveBeenCalled();
    expect(mock.isCaptured).toHaveBeenCalledTimes(1);
    expect(mockScreenshotListeners.size).toBe(1);
    expect(mock.captureListenerCount()).toBe(1);

    await act(async () => unmount());

    expect(restore).toHaveBeenCalledTimes(1);
    expect(mockScreenshotListeners.size).toBe(0);
    expect(mock.captureListenerCount()).toBe(0);
  });

  test('restores when the app leaves active and re-boosts on return while focused', async () => {
    await renderHook(() => useTicketScreenProtection(jest.fn()));
    boost.mockClear();

    await act(async () => appStateListener?.('inactive'));
    expect(restore).toHaveBeenCalledTimes(1);

    await act(async () => appStateListener?.('active'));
    expect(boost).toHaveBeenCalledTimes(1);
    expect(mock.isCaptured).toHaveBeenCalledTimes(2);
  });

  test('tracks capture state and forwards screenshots', async () => {
    const onScreenshot = jest.fn();
    const { result } = await renderHook(() => useTicketScreenProtection(onScreenshot));
    expect(result.current.isCaptured).toBe(false);

    await act(async () => mock.emitCaptureChange(true));
    expect(result.current.isCaptured).toBe(true);

    await act(async () => mockScreenshotListeners.forEach((listener) => listener()));
    expect(onScreenshot).toHaveBeenCalledTimes(1);
  });
});
