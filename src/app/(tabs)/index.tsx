import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiamondMark } from '@/components/ui';
import { signInWithGoogle } from '@/features/auth';
import { t } from '@/i18n';
import { getSupabase, hasSupabaseConfig } from '@/lib';
import { useSessionStore } from '@/stores/session.store';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const mode = useSessionStore((s) => s.mode);
  const displayName = useSessionStore((s) => s.displayName);
  const enterAsGuest = useSessionStore((s) => s.enterAsGuest);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const pulse = useSharedValue(0.55);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.95, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const diamondStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.92 + pulse.value * 0.08 }],
  }));

  const onGuest = () => {
    setMessage(null);
    enterAsGuest();
  };

  const onGoogle = async () => {
    setMessage(null);
    setBusy(true);
    try {
      if (!hasSupabaseConfig()) {
        setMessage(t('home.googleNotConfigured'));
        return;
      }
      const result = await signInWithGoogle();
      if (!result.ok) {
        setMessage(
          result.reason === 'not_configured'
            ? t('home.googleNotConfigured')
            : `${t('home.googleError')}: ${result.message}`,
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearSession();
    setMessage(null);
  };

  const isIn = mode === 'guest' || mode === 'authenticated';
  const diamondSize = Math.min(280, height * 0.34);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#07070c', '#140900', '#1a1208', colors.bg]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.fieldGlow} pointerEvents="none" />
      <View style={styles.baseline} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.stage}>
          <Animated.View
            entering={FadeIn.duration(700)}
            style={[styles.diamondSlot, diamondStyle]}
          >
            <DiamondMark
              size={diamondSize}
              runnerJerseyNumber={7}
              runnerLabel={t('home.runnerA11y')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(650)}>
            <Text style={styles.brand} accessibilityRole="header">
              <Text style={styles.brandEl}>EL</Text>
              <Text style={styles.brandPlay}>PLAY</Text>
            </Text>
            <Text style={styles.tagline}>{t('brand.tagline')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInUp.delay(320).duration(650)}
          style={styles.footer}
        >
          {isIn ? (
            <>
              <Text style={styles.sessionEyebrow}>
                {mode === 'guest'
                  ? t('home.welcomeGuest')
                  : t('home.welcomeUser')}
              </Text>
              {displayName ? (
                <Text style={styles.sessionName}>{displayName}</Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={onGuest}
                style={({ pressed }) => [
                  styles.primaryHit,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryHitText}>
                  {t('home.continuePlay')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void onSignOut();
                }}
                style={styles.textAction}
              >
                <Text style={styles.textActionLabel}>{t('home.signOut')}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={onGuest}
                style={({ pressed }) => [
                  styles.primaryHit,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryHitText}>{t('home.guestCta')}</Text>
              </Pressable>
              <Text style={styles.support}>{t('home.guestHint')}</Text>

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  void onGoogle();
                }}
                style={({ pressed }) => [
                  styles.googleHit,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.googleHitText}>{t('home.googleCta')}</Text>
                )}
              </Pressable>
              <Text style={styles.supportMuted}>{t('home.googleHint')}</Text>
            </>
          )}

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fieldGlow: {
    position: 'absolute',
    width: '140%',
    height: '55%',
    bottom: '-8%',
    left: '-20%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,77,0,0.08)',
  },
  baseline: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: '38%',
    height: 1,
    backgroundColor: 'rgba(255,140,0,0.18)',
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  diamondSlot: {
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  brand: {
    fontSize: 78,
    lineHeight: 74,
    letterSpacing: 1,
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
    marginTop: spacing.sm,
    fontFamily: typography.bodyBold,
    color: colors.secondary,
    fontSize: 13,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: spacing.md,
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 300,
  },
  footer: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  primaryHit: {
    backgroundColor: colors.primary,
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  primaryHitText: {
    fontFamily: typography.bodyBlack,
    color: colors.text,
    fontSize: 17,
    letterSpacing: 0.4,
  },
  googleHit: {
    marginTop: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  googleHitText: {
    fontFamily: typography.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  support: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 13,
  },
  supportMuted: {
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 12,
  },
  sessionEyebrow: {
    fontFamily: typography.bodyBold,
    color: colors.secondary,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  sessionName: {
    fontFamily: typography.body,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  textAction: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  textActionLabel: {
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 14,
  },
  message: {
    fontFamily: typography.body,
    color: colors.secondary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
