// ============================================================
// ProgressBar — 더빙 진행 바 컴포넌트
// ============================================================

import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface ProgressBarProps {
  /** 0 ~ 100 */
  percent: number;
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedPercent }}
      accessibilityLabel={`진행률 ${clampedPercent}%`}
    >
      <View style={[styles.fill, { width: `${clampedPercent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    backgroundColor: colors.slate200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});
