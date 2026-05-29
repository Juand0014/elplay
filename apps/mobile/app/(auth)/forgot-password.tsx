import { useState }                                            from 'react'
import { Controller, useForm }                                  from 'react-hook-form'
import { zodResolver }                                          from '@hookform/resolvers/zod'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router }                                               from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS }                       from '@elplay/shared/types'
import { ForgotPasswordSchema, type ForgotPasswordInput }       from '@elplay/shared/validators'
import { supabase }                                             from '../../lib/supabase'

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false)

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<ForgotPasswordInput>({
      resolver: zodResolver(ForgotPasswordSchema),
      defaultValues: { email: '' },
    })

  const onSubmit = async (data: ForgotPasswordInput) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: 'elplay://auth/reset-password',
    })
    if (error) {
      setError('root', { message: error.message })
    } else {
      setSent(true)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Recuperar{'\n'}Contraseña</Text>
        <Text style={styles.subtitle}>
          Te enviaremos un enlace para restablecer tu contraseña.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>¡Enlace enviado!</Text>
            <Text style={styles.successText}>
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.buttonText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="tu@email.com"
                    placeholderTextColor={COLORS.TEXT3}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {errors.root && (
              <View style={styles.serverError}>
                <Text style={styles.serverErrorText}>{errors.root.message}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex:            1,
    backgroundColor: COLORS.BG,
    padding:         SPACING.LG,
    paddingTop:      SPACING.XL,
  },
  backButton: {
    marginBottom: SPACING.LG,
  },
  backText: {
    fontFamily: FONTS.BODY,
    color:      COLORS.TEXT2,
    fontSize:   14,
  },
  title: {
    fontFamily:    FONTS.DISPLAY,
    fontSize:      48,
    color:         COLORS.TEXT,
    letterSpacing: 2,
    lineHeight:    52,
    marginBottom:  SPACING.SM,
  },
  subtitle: {
    fontFamily:   FONTS.BODY,
    fontSize:     14,
    color:        COLORS.TEXT2,
    marginBottom: SPACING.XL,
    lineHeight:   20,
  },
  form: {
    gap: SPACING.LG,
  },
  fieldGroup: {
    gap: SPACING.XS,
  },
  label: {
    fontFamily:    FONTS.BOLD,
    fontSize:      12,
    color:         COLORS.TEXT2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderWidth:     1,
    borderColor:     COLORS.BORDER,
    borderRadius:    RADIUS.MD,
    padding:         SPACING.MD,
    color:           COLORS.TEXT,
    fontFamily:      FONTS.BODY,
    fontSize:        16,
  },
  inputError: {
    borderColor: COLORS.DANGER,
  },
  errorText: {
    fontFamily:  FONTS.BODY,
    fontSize:    12,
    color:       COLORS.DANGER,
    paddingLeft: SPACING.XS,
  },
  serverError: {
    backgroundColor: `${COLORS.DANGER}22`,
    borderWidth:     1,
    borderColor:     COLORS.DANGER,
    borderRadius:    RADIUS.MD,
    padding:         SPACING.MD,
  },
  serverErrorText: {
    fontFamily: FONTS.BODY,
    color:      COLORS.DANGER,
    fontSize:   14,
    textAlign:  'center',
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius:    RADIUS.MD,
    padding:         SPACING.MD,
    alignItems:      'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily:    FONTS.BOLD,
    fontSize:      16,
    color:         COLORS.TEXT,
    letterSpacing: 1,
  },
  successBox: {
    backgroundColor: `${COLORS.SUCCESS}11`,
    borderWidth:     1,
    borderColor:     COLORS.SUCCESS,
    borderRadius:    RADIUS.LG,
    padding:         SPACING.LG,
    gap:             SPACING.MD,
  },
  successTitle: {
    fontFamily: FONTS.BOLD,
    fontSize:   20,
    color:      COLORS.SUCCESS,
    textAlign:  'center',
  },
  successText: {
    fontFamily: FONTS.BODY,
    fontSize:   14,
    color:      COLORS.TEXT2,
    textAlign:  'center',
    lineHeight: 20,
  },
})
