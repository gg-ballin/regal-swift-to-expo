// SWIFT: no XCTest counterpart; `enum Formatters` is only exercised indirectly through the view models.
import {
  displayTime,
  formatRuntime,
  formattedAddress,
  isoDay,
  longDate,
  makeDateStrip,
  money,
  monthShort,
  parseIsoDay,
  weekdayShort,
} from './formatters';

describe('formatters', () => {
  test('runtime uses Regal format', () => {
    expect(formatRuntime(112)).toBe('1HR 52MINS');
    expect(formatRuntime(52)).toBe('52MINS');
    expect(formatRuntime(120)).toBe('2HR');
  });

  test('showtime converts 24h to 12h', () => {
    expect(displayTime('13:30')).toBe('1:30 PM');
    expect(displayTime('00:05')).toBe('12:05 AM');
    expect(displayTime('12:00')).toBe('12:00 PM');
    expect(displayTime('24:00')).toBeNull();
    expect(displayTime('9')).toBeNull();
  });

  test('address shows distance with 0-2 fraction digits', () => {
    expect(formattedAddress({ address: '33 Le Count Place', distanceMi: 0.56 })).toBe('33 Le Count Place (0.56mi)');
    expect(formattedAddress({ address: 'X', distanceMi: 9.8 })).toBe('X (9.8mi)');
    expect(formattedAddress({ address: 'X', distanceMi: 3 })).toBe('X (3mi)');
  });

  test('dates are en-US', () => {
    const sunday = new Date(2026, 9, 4);
    expect(longDate(sunday)).toBe('Sunday, Oct 4');
    expect(weekdayShort(sunday)).toBe('Sun');
    expect(monthShort(sunday)).toBe('Oct');
    expect(isoDay(sunday)).toBe('2026-10-04');
    expect(parseIsoDay('2026-10-04')?.getTime()).toBe(sunday.getTime());
  });

  test('money formats integer cents', () => {
    expect(money(3098, 'USD')).toBe('$30.98');
    expect(money(1549, 'USD')).toBe('$15.49');
  });

  test('date strip is today at start of day + 6 days', () => {
    const strip = makeDateStrip(new Date(2026, 9, 4, 15, 23));
    expect(strip).toHaveLength(7);
    expect(strip[0]).toEqual(new Date(2026, 9, 4));
    expect(strip[6]).toEqual(new Date(2026, 9, 10));
  });
});
