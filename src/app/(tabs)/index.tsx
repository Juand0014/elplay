import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithGoogle } from '@/features/auth';
import { t } from '@/i18n';
import { getSupabase, hasSupabaseConfig } from '@/lib';
import { useSessionStore } from '@/stores/session.store';
import { colors, radii, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const mode = useSessionStore((s) => s.mode);
  const displayName = useSessionStore((s) => s.displayName);
  const enterAsGuest = useSessionStore((s) => s.enterAsGuest);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      // Authenticated session is applied by useAuthBootstrap / onAuthStateChange.
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

        <View style={styles.actions}>
          {isIn ? (
            <>
              <Text style={styles.sessionLabel}>
                {mode === 'guest'
                  ? t('home.welcomeGuest')
                  : `${t('home.welcomeUser')}${displayName ? `: ${displayName}` : ''}`}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onSignOut}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryBtnText}>{t('home.signOut')}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={onGuest}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryBtnText}>{t('home.guestCta')}</Text>
              </Pressable>
              <Text style={styles.hint}>{t('home.guestHint')}</Text>

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  void onGoogle();
                }}
                style={({ pressed }) => [
                  styles.googleBtn,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.googleBtnText}>{t('home.googleCta')}</Text>
                )}
              </Pressable>
              <Text style={styles.hint}>{t('home.googleHint')}</Text>
            </>
          )}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.meta}>
            <Text style={styles.metaLabel}>{t('home.activePart')}</Text>
            <Text style={styles.metaNext}>{t('home.nextPart')}</Text>
          </View>
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
  actions: {
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: typography.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  googleBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  googleBtnText: {
    fontFamily: typography.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 15,
  },
  hint: {
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  sessionLabel: {
    fontFamily: typography.bodyBold,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: typography.body,
    color: colors.secondary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  meta: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
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
});
