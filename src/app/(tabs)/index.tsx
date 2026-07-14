import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, '#1a0800', colors.field]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.brand}>
            <Text style={styles.brandEl}>EL</Text>
            <Text style={styles.brandPlay}>PLAY</Text>
          </Text>
          <Text style={styles.tagline}>{t('brand.tagline')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaLabel}>{t('home.activePart')}</Text>
          <Text style={styles.metaNext}>{t('home.nextPart')}</Text>
          <Text style={styles.metaCta}>{t('home.ctaSoon')}</Text>
        </View>
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
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  hero: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  brand: {
    fontSize: 72,
    lineHeight: 72,
    letterSpacing: 2,
  },
  brandEl: {
    fontFamily: typography.display,
    color: colors.text,
  },
  brandPlay: {
    fontFamily: typography.display,
    color: colors.primary,
  },
  tagline: {
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  meta: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(15,15,26,0.85)',
  },
  metaLabel: {
    fontFamily: typography.bodyBold,
    color: colors.primary,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metaNext: {
    fontFamily: typography.body,
    color: colors.text,
    fontSize: 15,
  },
  metaCta: {
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 13,
  },
});
