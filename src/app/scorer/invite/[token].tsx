import { type Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useScorerStore } from '@/features/scorer';
import { t } from '@/i18n';
import { useSessionStore } from '@/stores/session.store';
import { colors, typography } from '@/theme';

/** Invite link entry — opens the same local game by token (Part 05 hardens session name). */
export default function ScorerInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const getGameByToken = useScorerStore((s) => s.getGameByToken);
  const enterAsGuest = useSessionStore((s) => s.enterAsGuest);

  useEffect(() => {
    enterAsGuest();
    if (!token) return;
    const game = getGameByToken(token);
    if (game) {
      router.replace(`/scorer/${game.id}` as Href);
    }
  }, [enterAsGuest, getGameByToken, token]);

  const missing = token ? !getGameByToken(token) : true;

  return (
    <View style={styles.wrap}>
      {missing ? (
        <Text style={styles.text}>{t('scorer.missing')}</Text>
      ) : (
        <ActivityIndicator color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: colors.text,
    fontFamily: typography.bodyBold,
  },
});
