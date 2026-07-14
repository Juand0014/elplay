import { type Href, router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiveSummary } from '@/components/live';
import { useLiveGame } from '@/features/live';
import { t } from '@/i18n';
import { GameType } from '@/types';
import { colors, spacing, typography } from '@/theme';

export default function LiveGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { game, isLoading, missing } = useLiveGame(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (missing || !game || game.gameType === GameType.Internal) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>{t('live.missing')}</Text>
        <Pressable onPress={() => router.replace('/live' as Href)}>
          <Text style={styles.link}>{t('live.backToDashboard')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>{t('live.back')}</Text>
        </Pressable>
        <Text style={styles.badge}>{t('live.liveBadge')}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {t('live.gameTitle')}
        </Text>
        <LiveSummary game={game} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  back: {
    fontFamily: typography.body,
    color: colors.textDim,
    marginBottom: spacing.md,
  },
  badge: {
    fontFamily: typography.bodyBlack,
    color: colors.primary,
    letterSpacing: 2,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.display,
    color: colors.text,
    fontSize: 40,
    lineHeight: 40,
    marginBottom: spacing.lg,
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
