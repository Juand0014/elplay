import { StyleSheet, Text, View } from "react-native";

import { t } from "@/i18n";
import { colors, radii, spacing, typography } from "@/theme";
import type { Game } from "@/types";
import { InningHalf } from "@/types";

type ScoreBoardProps = {
  game: Game;
};

function Dot({ filled, color }: { filled: boolean; color: string }) {
  return (
    <View
      style={[styles.dot, filled && { backgroundColor: color }]}
      accessibilityRole="image"
      accessibilityLabel={filled ? "1" : "0"}
    />
  );
}

function DotRow({
  total,
  filled,
  color,
}: {
  total: number;
  filled: number;
  color: string;
}) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} filled={i < filled} color={color} />
      ))}
    </View>
  );
}

export function ScoreBoard({ game }: ScoreBoardProps) {
  const halfLabel =
    game.half === InningHalf.Top ? t("scorer.top") : t("scorer.bottom");

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.teamCol}>
          <Text style={styles.teamLabel}>{game.awayTeamName}</Text>
          <Text style={styles.score}>{game.awayRuns}</Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.inning}>
            {halfLabel} {game.inning}
          </Text>
          <View style={styles.countGroup}>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>{t("scorer.outs")}</Text>
              <DotRow total={3} filled={game.outs} color={colors.danger} />
            </View>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>{t("scorer.balls")}</Text>
              <DotRow total={4} filled={game.balls} color={colors.info} />
            </View>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>{t("scorer.strikes")}</Text>
              <DotRow total={2} filled={game.strikes} color={colors.warning} />
            </View>
          </View>
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
  panel: {
    backgroundColor: colors.surface2,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  teamCol: {
    flex: 1,
  },
  teamRight: {
    alignItems: "flex-end",
  },
  teamLabel: {
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 8,
  },
  score: {
    fontFamily: typography.display,
    color: colors.text,
    fontSize: 64,
    lineHeight: 64,
  },
  mid: {
    alignItems: "center",
    minWidth: 110,
  },
  inning: {
    fontFamily: typography.bodyBlack,
    color: colors.primary,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  countGroup: {
    gap: 6,
    alignSelf: "stretch",
  },
  countItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countLabel: {
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
    fontSize: 12,
    width: 50,
    textAlign: "left",
  },
  dotRow: {
    flexDirection: "row",
    gap: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
});
