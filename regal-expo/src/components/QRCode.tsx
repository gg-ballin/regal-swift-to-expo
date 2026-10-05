import { useMemo } from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { toQR } from 'toqr';

/** QR modules (`size` x `size`) as one SVG path in module units. */
export type QRMatrix = { size: number; path: string };

// toqr's `ECLevel` is a non-exported const enum (M = 0); its default is L.
const ERROR_CORRECTION_M = 0;

/**
 * Encodes `payload` (UTF-8, byte mode) at error correction M, `null` if it is empty or too long for a QR code.
 * Each row's dark runs become one rectangle, so the whole code is a single `<Path>`.
 */
// SWIFT: QRCodeGenerator.png(from:size:): CIFilter.qrCodeGenerator() with correctionLevel "M"; throws = null here.
export function encodeQR(payload: string): QRMatrix | null {
  if (!payload) return null;

  let modules: Uint8Array;
  try {
    modules = toQR(payload, ERROR_CORRECTION_M);
  } catch {
    return null;
  }

  const size = Math.sqrt(modules.length);
  let path = '';
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!modules[y * size + x]) {
        x++;
        continue;
      }
      const start = x;
      while (x < size && modules[y * size + x]) x++;
      path += `M${start} ${y}h${x - start}v1H${start}z`;
    }
  }
  return { size, path };
}

export function useQRCode(payload: string): QRMatrix | null {
  return useMemo(() => encodeQR(payload), [payload]);
}

type Props = {
  /** From `useQRCode`; `null` renders an empty square. */
  code: QRMatrix | null;
  /** Side in points; the code is drawn at the largest whole number of device pixels per module that fits, centered. */
  size: number;
};

/** Shared QR for iOS, Android and web. */
// SWIFT: integer scaling in QRCodeGenerator + `magnificationFilter = .nearest` keep modules crisp; here whole device pixels per module.
export function QRCode({ code, size }: Props) {
  let side = size;
  if (code) {
    const pixelsPerModule = Math.max(1, Math.floor(PixelRatio.getPixelSizeForLayoutSize(size) / code.size));
    side = (pixelsPerModule * code.size) / PixelRatio.get();
  }

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {code && (
        <Svg width={side} height={side} viewBox={`0 0 ${code.size} ${code.size}`}>
          <Path d={code.path} fill="#000000" />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center' },
});
