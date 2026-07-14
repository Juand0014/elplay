import { StyleSheet, Text, View } from 'react-native';

import { DiamondMark } from '@/components/ui';
import { ScoreBoard } from '@/components/scorer';
import { t } from '@/i18n';
import type { Game } from '@/types';
import { colors, spacing, typography } from '@/theme';

type LiveSummaryProps = {
  game: Game;
};

/** Public live summary — scoreboard + diamond + last play. No scorer pad. */
export function LiveSummary({ game }: LiveSummaryProps) {
  const lastPlay = game.plays[game.plays.length - 1];

  return (
    <View style={styles.wrap}>
      <ScoreBoard game={game} />

      <View style={styles.statsRow}>
        <Stat label={t('live.hits')} away={game.awayHits} home={game.homeHits} />
        <Stat
          label={t('live.errors')}
          away={game.awayErrors}
          home={game.homeErrors}
        />
      </View>

      <View style={styles.diamondBlock}>
        <DiamondMark
          size={180}
          runnerJerseyNumber={game.runnerJerseyNumber}
          runnerLabel={t('home.runnerA11y')}
        />
        <View style={styles.bases}>
          <Text style={styles.baseLine}>
            {t('scorer.base1')}: {game.bases.first ?? '—'}
          </Text>
          <Text style={styles.baseLine}>
            {t('scorer.base2')}: {game.bases.second ?? '—'}
          </Text>
          <Text style={styles.baseLine}>
            {t('scorer.base3')}: {game.bases.third ?? '—'}
          </Text>
        </View>
      </View>

      <Text style={styles.lastTitle}>{t('live.lastPlay')}</Text>
      <Text style={styles.lastBody}>
        {lastPlay ? lastPlay.label : t('live.waitingPlay')}
      </Text>
    </View>
  );
}

function Stat({
  label,
  away,
  home,
}: {
  label: string;
  away: number;
  home: number;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {away} — {home}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  stat: {
    gap: 4,
  },
  statLabel: {
    fontFamily: typography.bodyBold,
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: typography.display,
    color: colors.textMuted,
    fontSize: 28,
    lineHeight: 28,
  },
  diamondBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginVertical: spacing.md,
  },
  bases: {
    gap: spacing.sm,
  },
  baseLine: {
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
    fontSize: 16,
  },
  lastTitle: {
    fontFamily: typography.bodyBold,
    color: colors.primary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lastBody: {
    fontFamily: typography.body,
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
  },
});
