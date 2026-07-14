import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';

import { colors, typography } from '@/theme';

type DiamondMarkProps = {
  size?: number;
  opacity?: number;
  /**
   * Jersey number of the runner currently advancing.
   * Always shown in the center of the diamond when present.
   */
  runnerJerseyNumber?: number | string | null;
  /** Accessibility / screen-reader label prefix (Spanish from i18n at call site). */
  runnerLabel?: string;
};

/**
 * Softball infield diamond.
 * Center = jersey number of the player running the bases.
 */
export function DiamondMark({
  size = 220,
  opacity = 0.9,
  runnerJerseyNumber = null,
  runnerLabel,
}: DiamondMarkProps) {
  const hasRunner =
    runnerJerseyNumber !== null &&
    runnerJerseyNumber !== undefined &&
    String(runnerJerseyNumber).length > 0;
  const numberText = hasRunner ? String(runnerJerseyNumber) : '';
  const fontSize =
    numberText.length >= 3 ? size * 0.18 : numberText.length === 2 ? size * 0.26 : size * 0.32;

  return (
    <View
      style={[styles.wrap, { width: size, height: size, opacity }]}
      accessibilityRole="image"
      accessibilityLabel={
        hasRunner
          ? `${runnerLabel ?? 'Corredor'} ${numberText}`
          : runnerLabel ?? 'Diamante'
      }
    >
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Polygon
          points="40,4 76,40 40,76 4,40"
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.2}
        />
        <Polygon
          points="40,18 62,40 40,62 18,40"
          fill="rgba(255,77,0,0.10)"
          stroke={colors.secondary}
          strokeWidth={1.2}
        />
        {/* Home */}
        <Rect
          x="37"
          y="73"
          width="6"
          height="6"
          rx="1"
          fill={colors.primary}
          transform="rotate(45 40 76)"
        />
        {/* 2B */}
        <Rect
          x="37"
          y="1"
          width="6"
          height="6"
          rx="1"
          fill={colors.primary}
          transform="rotate(45 40 4)"
        />
        {/* 3B */}
        <Rect
          x="1"
          y="37"
          width="6"
          height="6"
          rx="1"
          fill={colors.secondary}
          transform="rotate(45 4 40)"
        />
        {/* 1B */}
        <Rect
          x="73"
          y="37"
          width="6"
          height="6"
          rx="1"
          fill={colors.secondary}
          transform="rotate(45 76 40)"
        />
      </Svg>

      {/* Jersey number sits in the middle of the diamond — the running player */}
      <View style={styles.center} pointerEvents="none">
        {hasRunner ? (
          <Text
            style={[
              styles.jersey,
              {
                fontSize,
                lineHeight: fontSize * 1.05,
              },
            ]}
            numberOfLines={1}
          >
            {numberText}
          </Text>
        ) : (
          <View style={styles.emptyDot} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jersey: {
    fontFamily: typography.display,
    color: colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(255,77,0,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 1,
  },
  emptyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
