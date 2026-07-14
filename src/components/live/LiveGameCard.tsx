import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import type { Game } from '@/types';
import { InningHalf } from '@/types';
import { colors, spacing, typography } from '@/theme';

type LiveGameCardProps = {
  game: Game;
  onPress: () => void;
};

export function LiveGameCard({ game, onPress }: LiveGameCardProps) {
  const halfLabel =
    game.half === InningHalf.Top ? t('scorer.top') : t('scorer.bottom');
  const lastPlay = game.plays[game.plays.length - 1];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.meta}>
        <Text style={styles.liveTag}>{t('live.liveBadge')}</Text>
        <Text style={styles.inning}>
          {halfLabel} {game.inning}
        </Text>
      </View>
      <View style={styles.scoreRow}>
        <View style={styles.team}>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.awayTeamName}
          </Text>
          <Text style={styles.score}>{game.awayRuns}</Text>
        </View>
        <Text style={styles.vs}>{t('live.vs')}</Text>
        <View style={[styles.team, styles.teamRight]}>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.homeTeamName}
          </Text>
          <Text style={styles.score}>{game.homeRuns}</Text>
        </View>
      </View>
      {lastPlay ? (
        <Text style={styles.lastPlay} numberOfLines={1}>
          {t('live.lastPlay')}: {lastPlay.label}
        </Text>
      ) : (
        <Text style={styles.lastPlay}>{t('live.waitingPlay')}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveTag: {
    fontFamily: typography.bodyBlack,
    color: colors.primary,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  inning: {
    fontFamily: typography.bodyBold,
    color: colors.secondary,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  team: {
    flex: 1,
  },
  teamRight: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  score: {
    fontFamily: typography.display,
    color: colors.text,
    fontSize: 42,
    lineHeight: 42,
  },
  vs: {
    fontFamily: typography.bodyBold,
    color: colors.textDim,
    fontSize: 12,
  },
  lastPlay: {
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 13,
  },
});
