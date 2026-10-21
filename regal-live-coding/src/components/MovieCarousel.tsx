import { FlashList, type ViewToken } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { Movie } from '@/api/schemas';
import { apiAssetUrl } from '@/config/api';
import { useMoviesCarousel } from '@/context/MoviesCarouselContext';
import { colors, radius, spacing } from '@/theme';

const POSTER_ASPECT = 2 / 3;
/** 4 full cards + ~30% of the 5th visible as scroll affordance. */
const CARDS_VISIBLE = 4.3;

type Props = { movies: Movie[] };

export function MovieCarousel({ movies }: Props) {
  const { width } = useWindowDimensions();
  const { activeIndex, setActiveMovie } = useMoviesCarousel();

  const cardWidth = useMemo(() => {
    const horizontalInset = spacing.lg * 2;
    return (width - horizontalInset) / CARDS_VISIBLE;
  }, [width]);

  const cardHeight = cardWidth / POSTER_ASPECT;
  const snapInterval = cardWidth + spacing.sm;
  const listHeight = cardHeight + spacing.md * 2;

  const setActiveMovieRef = useRef(setActiveMovie);
  useEffect(() => {
    setActiveMovieRef.current = setActiveMovie;
  }, [setActiveMovie]);

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 50, minimumViewTime: 0 }),
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<Movie>[] }) => {
      const first = viewableItems[0];
      if (first?.item != null && first.index != null) {
        setActiveMovieRef.current(first.item, first.index);
      }
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Movie; index: number }) => {
      const isActive = index === activeIndex;
      return (
        <Pressable
          onPress={() => router.push(`/movie/${item.id}`)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          style={[styles.card, { width: cardWidth, marginRight: spacing.sm }]}
        >
          <Image
            source={{ uri: apiAssetUrl(item.poster_path) }}
            style={[
              styles.poster,
              { width: cardWidth, height: cardHeight },
              isActive ? styles.posterActive : styles.posterInactive,
            ]}
          />
        </Pressable>
      );
    },
    [activeIndex, cardWidth, cardHeight],
  );

  return (
    <View style={[styles.listWrap, { height: listHeight }]}>
      <FlashList
        data={movies}
        horizontal
        renderItem={renderItem}
        keyExtractor={(m) => m.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: { width: '100%' },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  card: {},
  poster: {
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  posterActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  posterInactive: {
    opacity: 0.65,
  },
});
