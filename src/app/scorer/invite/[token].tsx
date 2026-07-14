import { type Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScorerStore } from '@/features/scorer';
import { t } from '@/i18n';
import { useSessionStore } from '@/stores/session.store';
import { isInviteExpired } from '@/types';
import { colors, spacing, typography } from '@/theme';

/**
 * Temporary scorer invite (Part 05):
 * token must exist, not expired, single-game scoped; opener enters a name.
 */
export default function ScorerInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const getGameByToken = useScorerStore((s) => s.getGameByToken);
  const claimInviteScorer = useScorerStore((s) => s.claimInviteScorer);
  const enterAsGuest = useSessionStore((s) => s.enterAsGuest);
  const rememberScorerClaim = useSessionStore((s) => s.rememberScorerClaim);
  const claims = useSessionStore((s) => s.scorerClaims);

  const game = useMemo(
    () => (token ? getGameByToken(token) : undefined),
    [getGameByToken, token],
  );

  const existingClaim = token ? claims[token] : undefined;
  const [name, setName] = useState(existingClaim?.name ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingClaim?.name) {
      setName(existingClaim.name);
    }
  }, [existingClaim?.name]);

  const enterScorer = (scorerName: string) => {
    if (!game) return;
    enterAsGuest();
    claimInviteScorer(game.id, scorerName);
    rememberScorerClaim(game.inviteToken, {
      gameId: game.id,
      name: scorerName,
    });
    router.replace(`/scorer/${game.id}` as Href);
  };

  if (!token || !game) {
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.text}>{t('scorer.missing')}</Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.link}>{t('scorer.backHome')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isInviteExpired(game)) {
    return (
      <SafeAreaView style={styles.wrap}>
        <Text style={styles.text}>{t('scorer.inviteExpired')}</Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.link}>{t('scorer.backHome')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.form}>
      <Text style={styles.title}>{t('scorer.inviteNameTitle')}</Text>
      <Text style={styles.hint}>{t('scorer.inviteNameHint')}</Text>
      <TextInput
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        placeholder={t('scorer.inviteNamePlaceholder')}
        placeholderTextColor={colors.textDim}
        autoFocus
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          const trimmed = name.trim();
          if (!trimmed) {
            setError(t('scorer.inviteNameNeed'));
            return;
          }
          enterScorer(trimmed);
        }}
        style={styles.primary}
      >
        <Text style={styles.primaryText}>{t('scorer.inviteNameSubmit')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  form: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.display,
    color: colors.text,
    fontSize: 40,
    lineHeight: 40,
  },
  hint: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 4,
    fontFamily: typography.body,
    fontSize: 16,
  },
  primary: {
    marginTop: spacing.md,
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
  text: {
    color: colors.text,
    fontFamily: typography.bodyBold,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    fontFamily: typography.body,
  },
  error: {
    color: colors.secondary,
    fontFamily: typography.body,
    fontSize: 13,
  },
});
