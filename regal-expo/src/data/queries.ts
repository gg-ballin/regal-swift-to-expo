import { QueryClient, useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

import { bundleMovieRepository, type MovieRepository } from './repository';

export const queryKeys = {
  movie: ['movie'] as const,
  showtimes: ['showtimes'] as const,
  seatMap: (showtimeId: string) => ['seatMap', showtimeId] as const,
};

// SWIFT: no client/cache; each view model holds `state.isLoading` / `state.errorMessage` and calls `load()` itself.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // Local JSON: never stale; surface errors immediately with a manual Retry (parity with the Swift VMs).
      queries: { staleTime: Infinity, retry: false },
    },
  });
}

// SWIFT: constructor injection, `init(repository: any MovieRepository)` on every view model and coordinator.
// SOLID (D) Dependency inversion: queries depend on the `MovieRepository` abstraction, provided through context.
const RepositoryContext = createContext<MovieRepository>(bundleMovieRepository);

export const RepositoryProvider = RepositoryContext.Provider;

export const useRepository = () => useContext(RepositoryContext);

// SWIFT: `try await repository.movie()` inside MovieDetailViewModel.load().
export function useMovieQuery() {
  const repository = useRepository();
  return useQuery({ queryKey: queryKeys.movie, queryFn: () => repository.movie() });
}

// SWIFT: `try await repository.showtimes()`, run concurrently with movie() via `async let`.
export function useShowtimesQuery() {
  const repository = useRepository();
  return useQuery({ queryKey: queryKeys.showtimes, queryFn: () => repository.showtimes() });
}

// SWIFT: `try await repository.seatMap(showtimeID:)` inside SeatSelectionViewModel.load().
export function useSeatMapQuery(showtimeId: string | undefined) {
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.seatMap(showtimeId ?? ''),
    queryFn: () => repository.seatMap(showtimeId ?? ''),
    enabled: Boolean(showtimeId),
  });
}
