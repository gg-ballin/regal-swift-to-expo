import type { ZodType } from 'zod';
import { API_BASE_URL } from '../config/api';
import { apiLogger } from './logger';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Options<T> = Omit<RequestInit, 'body'> & {
  schema?: ZodType<T>; // validate at the boundary — never trust the payload shape
  body?: unknown;
  timeoutMs?: number;
};

/** Single fetch wrapper: timeout, JSON errors, optional zod validation. All API calls go through here. */
export async function api<T>(path: string, { schema, body, timeoutMs = 10_000, ...init }: Options<T> = {}): Promise<T> {
  const method = init.method ?? 'GET';
  const url = `${API_BASE_URL}${path}`;
  const startedAt = Date.now();
  apiLogger.request(method, url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiError(text || `Request failed (${res.status})`, res.status);
    }
    const json: unknown = await res.json();
    apiLogger.response(method, url, res.status, Date.now() - startedAt, json);
    return schema ? schema.parse(json) : (json as T);
  } catch (error) {
    apiLogger.error(method, url, Date.now() - startedAt, error);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new ApiError('Request timed out');
    throw new ApiError(error instanceof Error ? error.message : 'Network error — is the API server running on :3001?');
  } finally {
    clearTimeout(timer);
  }
}
