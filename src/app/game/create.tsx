import { type Href, router } from 'expo-router';
import { useState } from 'react';
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
import { colors, spacing, typography } from '@/theme';

export default function CreateGameScreen() {
  const createQuickGame = useScorerStore((s) => s.createQuickGame);
  const enterAsGuest = useSessionStore((s) => s.enterAsGuest);
  const mode = useSessionStore((s) => s.mode);
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onStart = () => {
    if (!home.trim() || !away.trim()) {
      setError(t('createGame.needNames'));
      return;
    }
    if (mode === 'unknown') {
      enterAsGuest();
    }
    const game = createQuickGame(home, away);
    router.replace(`/scorer/${game.id}` as Href);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>{t('createGame.title')}</Text>

      <Text style={styles.label}>{t('createGame.awayTeam')}</Text>
      <TextInput
        value={away}
        onChangeText={setAway}
        placeholder={t('createGame.awayPlaceholder')}
        placeholderTextColor={colors.textDim}
        style={styles.input}
        autoCapitalize="words"
      />

      <Text style={styles.label}>{t('createGame.homeTeam')}</Text>
      <TextInput
        value={home}
        onChangeText={setHome}
        placeholder={t('createGame.homePlaceholder')}
        placeholderTextColor={colors.textDim}
        style={styles.input}
        autoCapitalize="words"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        onPress={onStart}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText}>{t('createGame.start')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.display,
    color: colors.text,
    fontSize: 40,
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.bodyBold,
    color: colors.secondary,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 4,
  },
  error: {
    marginTop: spacing.md,
    color: colors.danger,
    fontFamily: typography.body,
  },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  ctaText: {
    fontFamily: typography.bodyBlack,
    color: colors.text,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.9,
  },
});
