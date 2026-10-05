import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, FeGaussianBlur, FeMerge, FeMergeNode, FeOffset, Filter, Path } from 'react-native-svg';

import { colors, typography } from '@/theme/theme';

const HEIGHT = 44;
const INSET = 24;
const BASELINE = 20;
/** Room for the glow above the arc's apex (CALayer shadows are not clipped; an SVG viewport is). */
const BLEED = 8;

/** Port of `ScreenIndicatorView`: quad-curve arc with an orange glow, "SCREEN" caption underneath. */
// SWIFT: UIView with a CAShapeLayer arc + UILabel; the path is rebuilt in layoutSubviews() from bounds.
export function ScreenIndicator() {
  // SWIFT: not needed; layoutSubviews() reads bounds.width directly, RN gets it from onLayout.
  const [width, setWidth] = useState(0);
  // SWIFT: UIBezierPath.addQuadCurve(to:controlPoint:) with the control point at bounds.midX.
  const d = `M ${INSET} ${BASELINE + BLEED} Q ${width / 2} ${BLEED} ${width - INSET} ${BASELINE + BLEED}`;

  return (
    <View
      style={styles.container}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel="Screen">
      {width > 0 && (
        <Svg width={width} height={HEIGHT + BLEED} style={styles.svg}>
          <Defs>
            {/* SWIFT: arcLayer.shadowColor = primary, shadowOpacity 0.8, shadowRadius 8, shadowOffset (0, 4). */}
            <Filter id="glow" x="-10%" y="-100%" width="120%" height="400%">
              <FeGaussianBlur in="SourceGraphic" stdDeviation={4} result="blur" />
              <FeOffset in="blur" dx={0} dy={4} result="shadow" />
              <FeMerge>
                <FeMergeNode in="shadow" />
                <FeMergeNode in="SourceGraphic" />
              </FeMerge>
            </Filter>
          </Defs>
          <Path d={d} stroke={colors.primary} strokeWidth={3} strokeLinecap="round" fill="none" filter="url(#glow)" />
        </Svg>
      )}
      <Text style={styles.label}>SCREEN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: HEIGHT, justifyContent: 'flex-end', alignItems: 'center' },
  svg: { position: 'absolute', top: -BLEED, left: 0 },
  label: { ...typography.caption, color: colors.textMuted },
});
