import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScoreBoard, ScorerPad } from "@/components/scorer";
import { DiamondMark } from "@/components/ui";
import { useScorerStore } from "@/features/scorer";
import { t } from "@/i18n";
import { colors, spacing, typography } from "@/theme";
import { GameStatus, PlayType } from "@/types";

export default function ScorerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = useScorerStore((s) => (id ? s.games[id] : undefined));
  const store = useScorerStore();
  const [copied, setCopied] = useState(false);

  const finished = game?.status === GameStatus.Done;
  const playsNewestFirst = useMemo(
    () => (game ? [...game.plays].reverse().slice(0, 12) : []),
    [game],
  );

  if (!id || !game) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>{t("scorer.missing")}</Text>
        <Pressable onPress={() => router.replace("/")}>
          <Text style={styles.link}>{t("scorer.backHome")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const copyInvite = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/scorer/invite/${game.inviteToken}`
        : `elplay://scorer/invite/${game.inviteToken}`;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {finished ? (
          <Text style={styles.over}>{t("scorer.gameOver")}</Text>
        ) : null}

        <ScoreBoard game={game} />

        <View style={styles.diamondRow}>
          <DiamondMark
            size={160}
            runnerJerseyNumber={game.runnerJerseyNumber}
            runnerLabel={t("home.runnerA11y")}
          />
          <View style={styles.basesCol}>
            <BaseField
              label={t("scorer.base3")}
              value={game.bases.third}
              onChange={(v) => store.setBaseOccupant(game.id, "third", v)}
              disabled={finished}
            />
            <BaseField
              label={t("scorer.base2")}
              value={game.bases.second}
              onChange={(v) => store.setBaseOccupant(game.id, "second", v)}
              disabled={finished}
            />
            <BaseField
              label={t("scorer.base1")}
              value={game.bases.first}
              onChange={(v) => store.setBaseOccupant(game.id, "first", v)}
              disabled={finished}
            />
          </View>
        </View>

        <Text style={styles.label}>{t("scorer.runner")}</Text>
        <TextInput
          value={game.runnerJerseyNumber ?? ""}
          onChangeText={(v) => store.setRunnerNumber(game.id, v)}
          placeholder={t("scorer.runnerPlaceholder")}
          placeholderTextColor={colors.textDim}
          keyboardType="number-pad"
          editable={!finished}
          style={styles.input}
        />

        <Pressable
          onPress={() => {
            void copyInvite();
          }}
          style={styles.invite}
        >
          <Text style={styles.inviteText}>
            {copied ? t("scorer.inviteCopied") : t("scorer.invite")}
          </Text>
        </Pressable>

        <Text style={styles.playsTitle}>{t("scorer.plays")}</Text>
        {playsNewestFirst.length === 0 ? (
          <Text style={styles.playLine}>{t("scorer.noPlays")}</Text>
        ) : (
          playsNewestFirst.map((play) => (
            <Text key={play.id} style={styles.playLine}>
              {play.sequence}. {play.label}
              {play.runsScored > 0 ? ` (+${play.runsScored})` : ""}
            </Text>
          ))
        )}
      </ScrollView>

      <View style={styles.padArea}>
        <ScorerPad
          disabled={finished}
          onBall={() => store.bumpBalls(game.id)}
          onStrike={() => store.bumpStrikes(game.id)}
          onOut={() => store.recordOut(game.id)}
          onWalk={() => store.recordWalk(game.id)}
          onSingle={() => store.recordHit(game.id, PlayType.Single)}
          onDouble={() => store.recordHit(game.id, PlayType.Double)}
          onTriple={() => store.recordHit(game.id, PlayType.Triple)}
          onHomer={() => store.recordHit(game.id, PlayType.HomeRun)}
          onRun={() => store.addRun(game.id)}
          onHalf={() => store.advanceHalf(game.id)}
          onUndo={() => store.undo(game.id)}
          onFinish={() => store.finish(game.id)}
        />
      </View>
    </SafeAreaView>
  );
}

function BaseField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.baseField}>
      <Text style={styles.baseLabel}>{label}</Text>
      <TextInput
        value={value ?? ""}
        onChangeText={(v) => onChange(v || null)}
        editable={!disabled}
        keyboardType="number-pad"
        placeholder="#"
        placeholderTextColor={colors.textDim}
        style={styles.baseInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  over: {
    fontFamily: typography.bodyBold,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  padArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  diamondRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  basesCol: {
    flex: 1,
    gap: spacing.sm,
  },
  baseField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  baseLabel: {
    width: 28,
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
  },
  baseInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    fontFamily: typography.display,
    fontSize: 22,
  },
  label: {
    fontFamily: typography.bodyBold,
    color: colors.secondary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 4,
    marginBottom: spacing.lg,
    fontFamily: typography.display,
    fontSize: 28,
  },
  invite: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  inviteText: {
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
  },
  playsTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: typography.bodyBold,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
  },
  playLine: {
    fontFamily: typography.body,
    color: colors.textMuted,
    marginBottom: 4,
  },
  missing: {
    color: colors.text,
    fontFamily: typography.bodyBold,
    padding: spacing.lg,
  },
  link: {
    color: colors.primary,
    paddingHorizontal: spacing.lg,
    fontFamily: typography.body,
  },
});
