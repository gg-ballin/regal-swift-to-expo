import { memo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme/theme';

type Props = {
  titles: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

const TIMING = { duration: 250, easing: Easing.inOut(Easing.ease) };

/** Port of `SegmentedTabsControl`: text tabs with an animated 4pt orange underline (UI-thread animation). */
// SWIFT: UIControl subclass: horizontal UIStackView of plain UIButtons + an underline UIView; onChange = sendActions(for: .valueChanged).
export const SegmentedTabs = memo(function SegmentedTabs({ titles, selectedIndex, onChange }: Props) {
  // SWIFT: not needed; Auto Layout pins underline.leadingAnchor/widthAnchor to the selected button, RN measures via onLayout.
  const layouts = useRef<{ x: number; width: number }[]>([]);
  const hasLaidOut = useRef(false);
  const x = useSharedValue(0);
  const width = useSharedValue(0);

  // SWIFT: setSelectedIndex(_:animated:): swap constraints, then `UIView.animate(withDuration: 0.25, options: .curveEaseInOut) { layoutIfNeeded() }`.
  const moveUnderline = (index: number, animated: boolean) => {
    const target = layouts.current[index];
    if (!target) return;
    x.value = animated ? withTiming(target.x, TIMING) : target.x;
    width.value = animated ? withTiming(target.width, TIMING) : target.width;
  };

  const onItemLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x: itemX, width: itemWidth } = event.nativeEvent.layout;
    layouts.current[index] = { x: itemX, width: itemWidth };
    if (index === selectedIndex) {
      moveUnderline(index, hasLaidOut.current);
      hasLaidOut.current = true;
    }
  };

  // SWIFT: didTap(_:) target-action on `.touchUpInside`; ignores a tap on the already selected tab.
  const select = (index: number) => {
    if (index === selectedIndex) return;
    moveUnderline(index, true);
    onChange(index);
  };

  const underlineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], width: width.value }));

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {titles.map((title, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={title}
            onLayout={onItemLayout(index)}
            onPress={() => select(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={styles.item}>
            <Text style={[styles.title, { color: selected ? colors.textPrimary : colors.textSecondary }]}>{title}</Text>
          </Pressable>
        );
      })}
      <Animated.View style={[styles.underline, underlineStyle]} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xl, alignSelf: 'flex-start' },
  item: { paddingVertical: spacing.md },
  title: { ...typography.tab },
  underline: { position: 'absolute', left: 0, bottom: 0, height: 4, backgroundColor: colors.primary },
});
