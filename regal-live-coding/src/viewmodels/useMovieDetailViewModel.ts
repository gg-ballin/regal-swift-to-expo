import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/api/client';
import type { Movie } from '@/api/schemas';
import { apiAssetUrl } from '@/config/api';
import { formatReleaseDate } from '@/domain/releaseWindow';
import { movieRepository, type MovieRepository } from '@/repositories/movieRepository';

/** Render-ready movie detail — all formatting lives here, not in the View. */
export type MovieDetailContent = {
  title: string;
  tagline: string;
  genres: string[];
  rating: string;
  director: string;
  cast: string[];
  overview: string;
  plotSummary: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDateLabel: string;
  runtimeLabel: string;
  voteLabel: string;
};

export type MovieDetailState = {
  content: MovieDetailContent | null;
  isLoading: boolean;
  errorMessage: string | null;
  isNotFound: boolean;
};

export type MovieDetailActions = {
  retry: () => void;
};

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function toContent(movie: Movie): MovieDetailContent {
  return {
    title: movie.title,
    tagline: movie.tagline,
    genres: movie.genres,
    rating: movie.rating,
    director: movie.director,
    cast: movie.cast,
    overview: movie.overview,
    plotSummary: movie.plot_summary,
    posterUrl: apiAssetUrl(movie.poster_path),
    backdropUrl: apiAssetUrl(movie.backdrop_path),
    releaseDateLabel: formatReleaseDate(movie.primary_release_date),
    runtimeLabel: formatRuntime(movie.runtime),
    voteLabel: `${movie.vote_average.toFixed(1)} / 10`,
  };
}

/**
 * ViewModel for the movie-detail screen (Swift: `MovieDetailViewModel`).
 * Route passes ONLY the id; data rehydrates via `GET /movies/:id` (deep-link safe).
 */
export function useMovieDetailViewModel(
  id: string | undefined,
  repository: MovieRepository = movieRepository,
): { state: MovieDetailState; actions: MovieDetailActions } {
  const movieQuery = useQuery({
    queryKey: ['movie', id],
    queryFn: () => repository.movie(id as string),
    enabled: !!id,
  });

  const is404 =
    movieQuery.isError && movieQuery.error instanceof ApiError && movieQuery.error.status === 404;

  return {
    state: {
      content: movieQuery.data ? toContent(movieQuery.data) : null,
      isLoading: !!id && movieQuery.isPending,
      errorMessage: movieQuery.isError && !is404 ? movieQuery.error.message : null,
      isNotFound: !id || is404,
    },
    actions: {
      retry: () => void movieQuery.refetch(),
    },
  };
}
