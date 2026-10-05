import { z } from 'zod';

// SWIFT: each schema = a `Codable` struct in Sources/Models (Movie, Theatre, SeatMap); `.parse` = JSONDecoder, z.enum = `enum: String, Codable`.
export const movieSchema = z.object({
  id: z.string(),
  title: z.string(),
  rating: z.string(),
  runtimeMinutes: z.number().int().nonnegative(),
  posterURL: z.url().nullish(),
  genres: z.array(z.string()),
  director: z.string(),
  cast: z.array(z.string()),
  synopsis: z.string(),
});

export const showtimeSchema = z.object({
  id: z.string(),
  /** 24h local time, "HH:mm". */
  time: z.string(),
});

export const showFormatSchema = z.object({
  id: z.string(),
  name: z.string(),
  seating: z.string(),
  attributes: z.array(z.string()),
  times: z.array(showtimeSchema),
});

export const theatreSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  distanceMi: z.number(),
  formats: z.array(showFormatSchema),
});

export const showtimesResponseSchema = z.object({
  movieId: z.string(),
  theatres: z.array(theatreSchema),
});

export const seatSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  column: z.number().int().nonnegative(),
  state: z.enum(['available', 'taken']),
  type: z.enum(['standard', 'wheelchair']),
});

export const seatRowSchema = z.object({
  label: z.string(),
  seats: z.array(seatSchema),
});

export const seatMapSchema = z.object({
  auditorium: z.string(),
  pricePerSeatCents: z.number().int().nonnegative(),
  currency: z.string(),
  /** Grid width including aisle gaps; each seat declares its own column. */
  columns: z.number().int().positive(),
  rows: z.array(seatRowSchema),
});

// SWIFT: no separate type; the struct is both the decoder and the type.
export type Movie = z.infer<typeof movieSchema>;
export type Showtime = z.infer<typeof showtimeSchema>;
export type ShowFormat = z.infer<typeof showFormatSchema>;
export type Theatre = z.infer<typeof theatreSchema>;
export type ShowtimesResponse = z.infer<typeof showtimesResponseSchema>;
export type Seat = z.infer<typeof seatSchema>;
export type SeatRow = z.infer<typeof seatRowSchema>;
export type SeatMap = z.infer<typeof seatMapSchema>;
