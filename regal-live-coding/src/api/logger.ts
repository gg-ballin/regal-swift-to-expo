import type { Movie, MovieDateRange } from './schemas';

/**
 * Dev-only API logger. `console.*` from the app prints to the Metro
 * terminal (and the browser console on web) — this is the "Terminal 6"
 * log feed during development. No-ops in production (`__DEV__` gate).
 *
 * Payloads are summarized, never dumped whole: a 40-movie response with
 * full plot summaries would bury the terminal. Use `movies()` for a
 * compact, readable listing of a GET /movies result.
 */
const enabled = __DEV__;

const summarize = (payload: unknown): string => {
  if (Array.isArray(payload)) return `${payload.length} item${payload.length === 1 ? '' : 's'}`;
  if (payload !== null && typeof payload === 'object') return `object {${Object.keys(payload).join(', ')}}`;
  return String(payload);
};

export const apiLogger = {
  request(method: string, url: string) {
    if (enabled) console.log(`[api] → ${method} ${url}`);
  },

  response(method: string, url: string, status: number, durationMs: number, payload: unknown) {
    if (enabled) console.log(`[api] ← ${status} ${method} ${url} (${Math.round(durationMs)}ms) — ${summarize(payload)}`);
  },

  error(method: string, url: string, durationMs: number, error: unknown) {
    if (enabled) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[api] ✕ ${method} ${url} (${Math.round(durationMs)}ms) — ${message}`);
    }
  },

  /** Compact listing of a consumed GET /movies result: one line per movie. */
  movies(movies: Movie[], range: MovieDateRange) {
    if (!enabled) return;
    console.log(`[movies] GET /movies ${range.gte} → ${range.lte}: ${movies.length} movie(s)`);
    for (const m of movies) {
      console.log(`[movies]   #${m.id} | ${m.primary_release_date} | ${m.title} | ★ ${m.vote_average.toFixed(1)} | ${m.runtime}min | ${m.rating}`);
    }
  },
};
