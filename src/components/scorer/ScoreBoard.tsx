import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import type { Game } from '@/types';
import { InningHalf } from '@/types';
import { colors, spacing, typography } from '@/theme';

type ScoreBoardProps = {
  game: Game;
};

export function ScoreBoard({ game }: ScoreBoardProps) {
  const halfLabel =
    game.half === InningHalf.Top ? t('scorer.top') : t('scorer.bottom');

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.teamCol}>
          <Text style={styles.teamLabel}>{game.awayTeamName}</Text>
          <Text style={styles.score}>{game.awayRuns}</Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.inning}>
            {halfLabel} {game.inning}
          </Text>
          <Text style={styles.count}>
            {t('scorer.outs')} {game.outs} · B{game.balls} S{game.strikes}
          </Text>
        </View>
        <View style={[styles.teamCol, styles.teamRight]}>
          <Text style={styles.teamLabel}>{game.homeTeamName}</Text>
          <Text style={styles.score}>{game.homeRuns}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  teamCol: {
    flex: 1,
  },
  teamRight: {
    alignItems: 'flex-end',
  },
  teamLabel: {
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  score: {
    fontFamily: typography.display,
    color: colors.text,
    fontSize: 56,
    lineHeight: 56,
  },
  mid: {
    alignItems: 'center',
    minWidth: 110,
  },
  inning: {
    fontFamily: typography.bodyBlack,
    color: colors.primary,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  count: {
    marginTop: 6,
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 12,
  },
});
