import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, spacing, typography } from '@/theme';

type PadButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'default' | 'primary' | 'danger' | 'muted';
  disabled?: boolean;
};

function PadButton({
  label,
  onPress,
  tone = 'default',
  disabled,
}: PadButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        tone === 'primary' && styles.primary,
        tone === 'danger' && styles.danger,
        tone === 'muted' && styles.muted,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

type ScorerPadProps = {
  disabled?: boolean;
  onBall: () => void;
  onStrike: () => void;
  onOut: () => void;
  onWalk: () => void;
  onSingle: () => void;
  onDouble: () => void;
  onTriple: () => void;
  onHomer: () => void;
  onRun: () => void;
  onHalf: () => void;
  onUndo: () => void;
  onFinish: () => void;
};

export function ScorerPad(props: ScorerPadProps) {
  const d = props.disabled;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <PadButton label={t('scorer.ball')} onPress={props.onBall} disabled={d} />
        <PadButton
          label={t('scorer.strike')}
          onPress={props.onStrike}
          disabled={d}
        />
        <PadButton
          label={t('scorer.out')}
          onPress={props.onOut}
          tone="danger"
          disabled={d}
        />
      </View>
      <View style={styles.row}>
        <PadButton label={t('scorer.walk')} onPress={props.onWalk} disabled={d} />
        <PadButton
          label={t('scorer.single')}
          onPress={props.onSingle}
          tone="primary"
          disabled={d}
        />
        <PadButton
          label={t('scorer.double')}
          onPress={props.onDouble}
          tone="primary"
          disabled={d}
        />
      </View>
      <View style={styles.row}>
        <PadButton
          label={t('scorer.triple')}
          onPress={props.onTriple}
          tone="primary"
          disabled={d}
        />
        <PadButton
          label={t('scorer.homer')}
          onPress={props.onHomer}
          tone="primary"
          disabled={d}
        />
        <PadButton label={t('scorer.run')} onPress={props.onRun} disabled={d} />
      </View>
      <View style={styles.row}>
        <PadButton label={t('scorer.half')} onPress={props.onHalf} disabled={d} />
        <PadButton
          label={t('scorer.undo')}
          onPress={props.onUndo}
          tone="muted"
        />
        <PadButton
          label={t('scorer.finish')}
          onPress={props.onFinish}
          tone="muted"
          disabled={d}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: 'rgba(255,77,0,0.2)',
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: colors.danger,
  },
  muted: {
    backgroundColor: 'transparent',
  },
  btnText: {
    fontFamily: typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
});
