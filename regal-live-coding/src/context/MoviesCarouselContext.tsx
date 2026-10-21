import type { Movie } from '@/api/schemas';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type MoviesCarouselContextValue = {
  activeIndex: number;
  activeMovie: Movie | null;
  setActiveMovie: (movie: Movie, index: number) => void;
};

const MoviesCarouselContext = createContext<MoviesCarouselContextValue | null>(null);

export function MoviesCarouselProvider({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeMovie, setActiveMovieState] = useState<Movie | null>(null);

  const setActiveMovie = useCallback((movie: Movie, index: number) => {
    setActiveMovieState(movie);
    setActiveIndex(index);
  }, []);

  const value = useMemo(
    () => ({ activeIndex, activeMovie, setActiveMovie }),
    [activeIndex, activeMovie, setActiveMovie],
  );

  return <MoviesCarouselContext.Provider value={value}>{children}</MoviesCarouselContext.Provider>;
}

export function useMoviesCarousel(): MoviesCarouselContextValue {
  const ctx = useContext(MoviesCarouselContext);
  if (!ctx) {
    throw new Error('useMoviesCarousel must be used within MoviesCarouselProvider');
  }
  return ctx;
}
