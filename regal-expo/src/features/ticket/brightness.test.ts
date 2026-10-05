// SWIFT: no XCTest counterpart for BrightnessController.
import * as Brightness from 'expo-brightness';

import { boostBrightness, restoreBrightness } from './brightness';

let mockSystemBrightness = 0.4;

jest.mock('expo-brightness', () => ({
  getBrightnessAsync: jest.fn(async () => mockSystemBrightness),
  setBrightnessAsync: jest.fn(async (value: number) => {
    mockSystemBrightness = value;
  }),
}));

const set = jest.mocked(Brightness.setBrightnessAsync);
const get = jest.mocked(Brightness.getBrightnessAsync);

beforeEach(async () => {
  await restoreBrightness();
  mockSystemBrightness = 0.4;
  jest.clearAllMocks();
});

describe('brightness', () => {
  test('boost raises to full and restore returns to the original value', async () => {
    await boostBrightness();
    expect(mockSystemBrightness).toBe(1);

    await restoreBrightness();
    expect(mockSystemBrightness).toBe(0.4);
  });

  test('repeated boosts keep the first original value', async () => {
    await boostBrightness();
    await boostBrightness();
    await restoreBrightness();

    expect(get).toHaveBeenCalledTimes(1);
    expect(mockSystemBrightness).toBe(0.4);
  });

  test('restore without a boost is a no-op', async () => {
    await restoreBrightness();

    expect(set).not.toHaveBeenCalled();
  });

  test('a restore issued while a boost is in flight still wins', async () => {
    const boost = boostBrightness();
    const restore = restoreBrightness();
    await Promise.all([boost, restore]);

    expect(mockSystemBrightness).toBe(0.4);
  });
});
