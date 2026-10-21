import { api } from '@/api/client';
import {
  MovieResponseSchema,
  MoviesResponseSchema,
  type Movie,
  type MovieDateRange,
  type MoviesResponse,
} from '@/api/schemas';

/**
 * Repository: the data-source boundary (Swift: `protocol MovieRepository`).
 * ViewModels depend on this interface, never on endpoints or schemas directly —
 * swap the impl (mock, real starter API, cache) without touching View/ViewModel.
 */
export interface MovieRepository {
  /** `GET /movies?primary_release_date_gte=…&primary_release_date_lte=…` (server-side filter). */
  movies(range: MovieDateRange): Promise<MoviesResponse>;
  /** `GET /movies/:id` */
  movie(id: string): Promise<Movie>;
}

export const movieRepository: MovieRepository = {
  movies: (range) =>
    api(`/movies?primary_release_date_gte=${range.gte}&primary_release_date_lte=${range.lte}`, {
      schema: MoviesResponseSchema,
    }),
  movie: (id) => api(`/movies/${id}`, { schema: MovieResponseSchema }),
};
