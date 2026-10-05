// SWIFT: QRCodeGenerator (CoreImage, correction level M); emptyPayload/overflow throw there, return null here.
import { encodeQR } from './QRCode';

describe('encodeQR', () => {
  test('encodes at correction level M', () => {
    // 15 bytes fit version 1 (21x21) at L but need version 2 (25x25) at M.
    expect(encodeQR('a'.repeat(15))?.size).toBe(25);
  });

  test('is deterministic for the same payload', () => {
    const payload = '{"ticketId":"t-1","seats":["F6","F7"]}';

    expect(encodeQR(payload)).toEqual(encodeQR(payload));
  });

  test('draws only inside the module grid', () => {
    const code = encodeQR('{"ticketId":"t-1"}');
    expect(code).not.toBeNull();

    const coordinates = [...code!.path.matchAll(/M(\d+) (\d+)/g)].flatMap(([, x, y]) => [Number(x), Number(y)]);
    expect(coordinates.length).toBeGreaterThan(0);
    expect(Math.max(...coordinates)).toBeLessThan(code!.size);
  });

  test('returns null for an empty payload', () => {
    expect(encodeQR('')).toBeNull();
  });

  test('returns null when the payload exceeds QR capacity', () => {
    expect(encodeQR('x'.repeat(5000))).toBeNull();
  });
});
