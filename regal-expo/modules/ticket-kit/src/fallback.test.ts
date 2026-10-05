import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

import { addCaptureChangeListener } from './fallback';

jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(async () => {}),
  allowScreenCaptureAsync: jest.fn(async () => {}),
}));

const prevent = jest.mocked(ScreenCapture.preventScreenCaptureAsync);
const allow = jest.mocked(ScreenCapture.allowScreenCaptureAsync);
const flush = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('addCaptureChangeListener (fallback)', () => {
  test('android: FLAG_SECURE for the subscription lifetime, allowed with the same key on remove', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    const subscription = addCaptureChangeListener();
    expect(prevent).toHaveBeenCalledTimes(1);
    expect(allow).not.toHaveBeenCalled();

    subscription.remove();
    await flush();

    expect(allow).toHaveBeenCalledTimes(1);
    expect(allow).toHaveBeenCalledWith(prevent.mock.calls[0][0]);
  });

  test('android: overlapping subscriptions use distinct keys', () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    addCaptureChangeListener();
    addCaptureChangeListener();

    const [first, second] = prevent.mock.calls.map(([key]) => key);
    expect(first).not.toEqual(second);
  });

  test('android: a failed prevent does not throw on subscribe or remove', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    prevent.mockRejectedValueOnce(new Error('MissingActivity'));

    const subscription = addCaptureChangeListener();
    subscription.remove();
    await flush();

    expect(allow).toHaveBeenCalledTimes(1);
  });

  test('web: no-op', () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    addCaptureChangeListener().remove();

    expect(prevent).not.toHaveBeenCalled();
  });
});
