import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, spacing, typography } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: t('common.error') }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t('common.error')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t('brand.name')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.bodyBold,
    fontSize: 18,
    color: colors.text,
  },
  link: {
    marginTop: spacing.md,
  },
  linkText: {
    fontFamily: typography.body,
    color: colors.primary,
  },
});
