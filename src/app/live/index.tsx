import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiveGameCard } from '@/components/live';
import { useLiveGames } from '@/features/live';
import { t } from '@/i18n';
import { colors, spacing, typography } from '@/theme';

export default function LiveDashboardScreen() {
  const { games, isLoading, isError } = useLiveGames();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#07070c', '#120a00', colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.back}>{t('live.back')}</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">
            {t('live.dashboardTitle')}
          </Text>
          <Text style={styles.subtitle}>{t('live.dashboardSubtitle')}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : null}

        {isError ? (
          <Text style={styles.empty}>{t('common.error')}</Text>
        ) : null}

        <ScrollView contentContainerStyle={styles.list}>
          {games.length === 0 && !isLoading ? (
            <Text style={styles.empty}>{t('live.empty')}</Text>
          ) : (
            games.map((game) => (
              <LiveGameCard
                key={game.id}
                game={game}
                onPress={() => router.push(`/live/${game.id}` as Href)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  back: {
    fontFamily: typography.body,
    color: colors.textDim,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.display,
    color: colors.text,
    fontSize: 44,
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  empty: {
    marginTop: spacing.xl,
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
  },
  loader: {
    marginVertical: spacing.lg,
  },
});
