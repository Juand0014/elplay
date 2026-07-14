import { type Href, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithEmailMagicLink, signInWithGoogle } from '@/features/auth';
import { t } from '@/i18n';
import { hasSupabaseConfig } from '@/lib';
import { useSessionStore } from '@/stores/session.store';
import { colors, spacing, typography } from '@/theme';

/** Auth screen: Google primary, optional email magic link (Parts 03–04). */
export default function AuthScreen() {
  const mode = useSessionStore((s) => s.mode);
  const enterAsGuest = useSessionStore((s) => s.enterAsGuest);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onGoogle = async () => {
    setBusy(true);
    setMessage(null);
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

  const onEmail = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await signInWithEmailMagicLink(email);
      if (!result.ok) {
        setMessage(
          result.reason === 'invalid_email'
            ? t('auth.emailNeed')
            : result.reason === 'not_configured'
              ? t('home.googleNotConfigured')
              : `${t('auth.emailError')}: ${result.message}`,
        );
        return;
      }
      setMessage(t('auth.emailSent'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>{t('brand.name')}</Text>
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

      {mode === 'authenticated' ? (
        <Pressable
          onPress={() => router.replace('/' as Href)}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{t('home.continuePlay')}</Text>
        </Pressable>
      ) : (
        <>
          <Pressable
            disabled={busy}
            onPress={() => {
              void onGoogle();
            }}
            style={styles.primary}
          >
            {busy ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryText}>{t('home.googleCta')}</Text>
            )}
          </Pressable>

          <Text style={styles.section}>{t('auth.emailCta')}</Text>
          <Text style={styles.hint}>{t('auth.emailHint')}</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={colors.textDim}
            style={styles.input}
          />
          <Pressable
            disabled={busy}
            onPress={() => {
              void onEmail();
            }}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>{t('auth.emailSend')}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              enterAsGuest();
              router.replace('/' as Href);
            }}
            style={styles.textBtn}
          >
            <Text style={styles.textBtnLabel}>{t('home.guestCta')}</Text>
          </Pressable>
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.spacer} />
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>{t('live.back')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.display,
    color: colors.primary,
    fontSize: 56,
    lineHeight: 56,
  },
  subtitle: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  primaryText: {
    fontFamily: typography.bodyBlack,
    color: colors.text,
    fontSize: 16,
  },
  section: {
    marginTop: spacing.lg,
    fontFamily: typography.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  hint: {
    fontFamily: typography.body,
    color: colors.textDim,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 4,
    fontFamily: typography.body,
  },
  secondary: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    fontFamily: typography.bodyBold,
    color: colors.text,
  },
  textBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  textBtnLabel: {
    fontFamily: typography.body,
    color: colors.textMuted,
  },
  message: {
    marginTop: spacing.sm,
    fontFamily: typography.body,
    color: colors.secondary,
  },
  spacer: {
    height: spacing.lg,
  },
  back: {
    fontFamily: typography.body,
    color: colors.textDim,
  },
});
