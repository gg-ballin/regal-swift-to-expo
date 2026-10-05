// SWIFT: Tests/Support/Fixtures.swift (sample models + `struct FakeMovieRepository: MovieRepository`).
import type { MovieRepository } from '@/data/repository';
import { RepositoryError } from '@/data/repository';
import type { Movie, SeatMap, ShowFormat, Showtime, ShowtimesResponse, Theatre } from '@/data/schemas';
import type { ShowtimeSelection } from '@/domain/booking';
import type { StateStorage } from 'zustand/middleware';

/** Mirrors regal-swift/Tests/Support/Fixtures.swift. */
export const movie: Movie = {
  id: 'movie-1',
  title: 'Test Movie',
  rating: 'PG-13',
  runtimeMinutes: 112,
  posterURL: null,
  genres: ['Drama'],
  director: 'Director',
  cast: ['Actor'],
  synopsis: 'Synopsis',
};

export const showtime: Showtime = { id: 'st-1900', time: '19:00' };

export const format: ShowFormat = {
  id: 'fmt-standard',
  name: 'Standard',
  seating: 'Recliner Seating',
  attributes: ['CC'],
  times: [showtime],
};

export const theatre: Theatre = {
  id: 'theatre-1',
  name: 'Regal Test',
  address: '1 Main St',
  distanceMi: 0.5,
  formats: [format],
};

export const showtimes: ShowtimesResponse = { movieId: movie.id, theatres: [theatre] };

/** Row A: A1 available, A2 taken, A3 available (wheelchair). Row B: B1, B2 available. */
export const seatMap: SeatMap = {
  auditorium: 'Auditorium 1',
  pricePerSeatCents: 1549,
  currency: 'USD',
  columns: 3,
  rows: [
    {
      label: 'A',
      seats: [
        { id: 'A1', number: 1, column: 0, state: 'available', type: 'standard' },
        { id: 'A2', number: 2, column: 1, state: 'taken', type: 'standard' },
        { id: 'A3', number: 3, column: 2, state: 'available', type: 'wheelchair' },
      ],
    },
    {
      label: 'B',
      seats: [
        { id: 'B1', number: 1, column: 0, state: 'available', type: 'standard' },
        { id: 'B2', number: 2, column: 1, state: 'available', type: 'standard' },
      ],
    },
  ],
};

export const selection: ShowtimeSelection = {
  movie,
  theatre,
  format,
  showtime,
  date: new Date(1_791_000_000_000),
};

type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export function fakeMovieRepository(
  overrides: Partial<{ movie: Result<Movie>; showtimes: Result<ShowtimesResponse>; seatMap: Result<SeatMap> }> = {},
): MovieRepository {
  const results = {
    movie: { ok: true, value: movie } as Result<Movie>,
    showtimes: { ok: true, value: showtimes } as Result<ShowtimesResponse>,
    seatMap: { ok: true, value: seatMap } as Result<SeatMap>,
    ...overrides,
  };
  const get = async <T>(result: Result<T>) => {
    if (!result.ok) throw result.error;
    return result.value;
  };
  return {
    movie: () => get(results.movie),
    showtimes: () => get(results.showtimes),
    seatMap: () => get(results.seatMap),
  };
}

export const missingResource = (name: string): Result<never> => ({ ok: false, error: new RepositoryError(name) });

/** Isolated `persist` storage so stores created in tests never share hydrated tickets. */
export function memoryStorage(): StateStorage & { entries: Map<string, string> } {
  const entries = new Map<string, string>();
  return {
    entries,
    getItem: (name) => entries.get(name) ?? null,
    setItem: (name, value) => {
      entries.set(name, value);
    },
    removeItem: (name) => {
      entries.delete(name);
    },
  };
}
