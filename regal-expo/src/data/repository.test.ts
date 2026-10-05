// SWIFT: Tests/BundleMovieRepositoryTests.swift (XCTestCase, `async throws` test methods).
import fs from 'node:fs';
import path from 'node:path';

import { createBundleMovieRepository, RepositoryError } from './repository';

// Test names mirror regal-swift/Tests/BundleMovieRepositoryTests.swift.
describe('BundleMovieRepository', () => {
  const repository = createBundleMovieRepository();

  test('testMockDataDecodes', async () => {
    const movie = await repository.movie();
    const showtimes = await repository.showtimes();
    const seatMap = await repository.seatMap('any');

    expect(showtimes.movieId).toBe(movie.id);
    expect(showtimes.theatres.length).toBeGreaterThan(0);
    expect(seatMap.rows.map((r) => r.label)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
  });

  test('testSeatMapIsConsistent', async () => {
    const seatMap = await repository.seatMap('any');
    const ids = seatMap.rows.flatMap((row) => row.seats.map((s) => s.id));

    expect(new Set(ids).size).toBe(ids.length);
    for (const row of seatMap.rows) {
      const columns = row.seats.map((s) => s.column);
      expect(new Set(columns).size).toBe(columns.length);
      expect(columns.every((c) => c >= 0 && c < seatMap.columns)).toBe(true);
    }
  });

  test('testMissingResourceThrows', async () => {
    const empty = createBundleMovieRepository({});
    await expect(empty.movie()).rejects.toEqual(new RepositoryError('movie'));
  });

  test('rejects malformed JSON at the boundary', async () => {
    const broken = createBundleMovieRepository({ movie: { id: 'x', title: 42 } });
    await expect(broken.movie()).rejects.toThrow();
  });

  test('mock JSON is identical to regal-swift/MockData', () => {
    const swiftDir = path.resolve(__dirname, '../../../regal-swift/MockData');
    for (const file of ['movie.json', 'showtimes.json', 'seatmap.json']) {
      const swift = fs.readFileSync(path.join(swiftDir, file), 'utf8');
      const expo = fs.readFileSync(path.join(__dirname, file), 'utf8');
      expect(expo).toBe(swift);
    }
  });
});
