import { z } from 'zod';

/**
 * Data contract for the Candidate Prompt Movie API (json-server, :3001).
 * Verified live against `db.json` (40 movies, 2026-01-09 → 2026-05-08):
 * every field below is always present, never null. Unknown fields are
 * stripped (not rejected) so an extended payload on the day still parses.
 *
 * Types are inferred from these schemas — never hand-duplicate them.
 */

/** ISO calendar date, `yyyy-MM-dd` (the API's date-filter format). */
export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected yyyy-MM-dd');
export type IsoDate = z.infer<typeof IsoDateSchema>;

/**
 * json-server v1 returns ids as strings ("23") although the prompt
 * documents a number (23). Accept both, normalize to string — route
 * params and list keys are strings everywhere downstream.
 */
export const MovieIdSchema = z.union([z.string(), z.number()]).transform(String);
export type MovieId = z.infer<typeof MovieIdSchema>;

export const MovieSchema = z.object({
  id: MovieIdSchema,
  title: z.string().min(1),
  primary_release_date: IsoDateSchema,
  /** Relative path ("/images/23.png") — prepend API_BASE_URL for a full URL. */
  poster_path: z.string().min(1),
  overview: z.string(),
  vote_average: z.number().min(0).max(10),
  /** Relative path ("/images/backdrop_23.jpg"). NOTE: 404s on the practice server — consumers must fall back to the poster. */
  backdrop_path: z.string(),
  genres: z.array(z.string()),
  director: z.string(),
  cast: z.array(z.string()),
  /** Runtime in minutes. */
  runtime: z.number().int().nonnegative(),
  /** MPAA rating, e.g. "PG-13". */
  rating: z.string(),
  tagline: z.string(),
  plot_summary: z.string(),
});
export type Movie = z.infer<typeof MovieSchema>;

/** `GET /movies` and `GET /movies/:id` — list is a bare array, no envelope. */
export const MoviesResponseSchema = z.array(MovieSchema);
export type MoviesResponse = z.infer<typeof MoviesResponseSchema>;

export const MovieResponseSchema = MovieSchema;
export type MovieResponse = z.infer<typeof MovieResponseSchema>;

/**
 * Server-side date filter: `GET /movies?primary_release_date_gte=…&primary_release_date_lte=…`
 * Both bounds inclusive, `yyyy-MM-dd`.
 */
export type MovieDateRange = {
  gte: IsoDate;
  lte: IsoDate;
};
