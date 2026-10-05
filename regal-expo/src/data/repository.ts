import movieJson from './movie.json';
import seatMapJson from './seatmap.json';
import showtimesJson from './showtimes.json';
import {
  movieSchema,
  seatMapSchema,
  showtimesResponseSchema,
  type Movie,
  type SeatMap,
  type ShowtimesResponse,
} from './schemas';

// SWIFT: `protocol MovieRepository: Sendable` with `async throws` methods (Promise rejection = thrown error).
// SOLID (L) Liskov substitution: bundled JSON, test fakes or a future HTTP client all satisfy this contract.
export interface MovieRepository {
  movie(): Promise<Movie>;
  showtimes(): Promise<ShowtimesResponse>;
  seatMap(showtimeId: string): Promise<SeatMap>;
}

// SWIFT: `enum RepositoryError: Error { case missingResource(String) }`.
export class RepositoryError extends Error {
  constructor(readonly resource: string) {
    super(`Missing resource: ${resource}`);
    this.name = 'RepositoryError';
  }
}

export type BundleSources = {
  movie?: unknown;
  showtimes?: unknown;
  seatmap?: unknown;
};

const bundledSources: BundleSources = {
  movie: movieJson,
  showtimes: showtimesJson,
  seatmap: seatMapJson,
};

/** Reads the mock JSON bundled by Metro and validates it at the boundary. */
// SWIFT: BundleMovieRepository: `Bundle.main.url(forResource:withExtension: "json")` + `JSONDecoder().decode(T.self, ...)`.
export function createBundleMovieRepository(sources: BundleSources = bundledSources): MovieRepository {
  const load = async <T>(name: keyof BundleSources, parse: (value: unknown) => T): Promise<T> => {
    const value = sources[name];
    if (value === undefined) throw new RepositoryError(name);
    return parse(value);
  };

  return {
    movie: () => load('movie', (v) => movieSchema.parse(v)),
    showtimes: () => load('showtimes', (v) => showtimesResponseSchema.parse(v)),
    // A single mock auditorium serves every showtime.
    seatMap: () => load('seatmap', (v) => seatMapSchema.parse(v)),
  };
}

export const bundleMovieRepository = createBundleMovieRepository();
