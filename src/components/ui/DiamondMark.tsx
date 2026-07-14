import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import { colors } from '@/theme';

type DiamondMarkProps = {
  size?: number;
  opacity?: number;
};

/** Brand diamond mark — used as hero visual anchor (softball infield motif). */
export function DiamondMark({ size = 220, opacity = 0.9 }: DiamondMarkProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size, opacity }]}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Polygon
          points="40,4 76,40 40,76 4,40"
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.2}
        />
        <Polygon
          points="40,18 62,40 40,62 18,40"
          fill="rgba(255,77,0,0.12)"
          stroke={colors.secondary}
          strokeWidth={1.2}
        />
        <Rect
          x="37"
          y="1"
          width="6"
          height="6"
          rx="1"
          fill={colors.primary}
          transform="rotate(45 40 4)"
        />
        <Rect
          x="37"
          y="73"
          width="6"
          height="6"
          rx="1"
          fill={colors.primary}
          transform="rotate(45 40 76)"
        />
        <Rect
          x="1"
          y="37"
          width="6"
          height="6"
          rx="1"
          fill={colors.secondary}
          transform="rotate(45 4 40)"
        />
        <Rect
          x="73"
          y="37"
          width="6"
          height="6"
          rx="1"
          fill={colors.secondary}
          transform="rotate(45 76 40)"
        />
        <Circle cx="40" cy="40" r="3.5" fill={colors.primary} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
