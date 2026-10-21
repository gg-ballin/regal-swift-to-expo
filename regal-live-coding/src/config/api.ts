import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Starter API runs on the host machine (port 3001). "localhost" only works
 * on web / iOS Simulator — NOT on Android emulator or a physical device.
 * Resolution order:
 *  1. EXPO_PUBLIC_API_URL (.env) — explicit override, use it in the interview if needed.
 *  2. Host IP derived from the Metro hostUri (works for Expo Go on a real device, same Wi-Fi).
 *  3. 10.0.2.2 = host loopback alias for the Android emulator.
 *  4. localhost (web / iOS Simulator).
 */
const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (metroHost
    ? `http://${metroHost}:3001`
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:3001'
      : 'http://localhost:3001');

/**
 * Resolve an API-relative asset path (e.g. `movie.poster_path` =
 * "/images/23.png", served by json-server from `public/`) to an absolute
 * URL the carousel can pass to `<Image source={{ uri }}>`. Absolute URLs
 * pass through untouched; empty paths return '' (render a placeholder).
 * NOTE: `backdrop_path` files don't exist on the mock server (404) —
 * fall back to the poster.
 */
export const apiAssetUrl = (path: string): string =>
  !path ? '' : /^https?:\/\//.test(path) ? path : `${API_BASE_URL}/${path.replace(/^\//, '')}`;
