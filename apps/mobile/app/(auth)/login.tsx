import { Controller, useForm }                                   from 'react-hook-form'
import { zodResolver }                                            from '@hookform/resolvers/zod'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { router }                                                 from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS }                         from '@elplay/shared/types'
import { LoginSchema, type LoginInput }                           from '@elplay/shared/validators'
import { useAuth }                                                from '../../hooks/use-auth'

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth()

  const { control, handleSubmit, formState: { errors }, setError } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginInput) => {
    const error = await signIn(data.email, data.password)
    if (error) {
      setError('root', { message: error })
    } else {
      router.replace('/(tabs)')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>ElPlay</Text>
          <Text style={styles.subtitle}>Liga de Softball</Text>
        </View>

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor={COLORS.TEXT3}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          {/* Contraseña */}
          <View style={styles.fieldGroup}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Contraseña"
                  placeholderTextColor={COLORS.TEXT3}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {/* Error global (del servidor) */}
          {errors.root && (
            <View style={styles.serverError}>
              <Text style={styles.serverErrorText}>{errors.root.message}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.linkButton}
          >
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.secondaryButtonText}>Crear cuenta nueva</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow:        1,
    backgroundColor: COLORS.BG,
    padding:         SPACING.LG,
    justifyContent:  'center',
  },
  header: {
    alignItems:   'center',
    marginBottom: SPACING.XXL,
  },
  logo: {
    fontFamily:    FONTS.DISPLAY,
    fontSize:      72,
    color:         COLORS.PRIMARY,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily:    FONTS.BODY,
    fontSize:      13,
    color:         COLORS.TEXT2,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop:     SPACING.XS,
  },
  form: {
    gap: SPACING.MD,
  },
  fieldGroup: {
    gap: SPACING.XS,
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
    fontFamily: FONTS.BODY,
    fontSize:   12,
    color:      COLORS.DANGER,
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
    marginTop:       SPACING.SM,
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
  linkButton: {
    alignItems: 'center',
    padding:    SPACING.XS,
  },
  link: {
    fontFamily: FONTS.BODY,
    color:      COLORS.TEXT2,
    textAlign:  'center',
    fontSize:   14,
  },
  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.MD,
    marginVertical: SPACING.XS,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: COLORS.BORDER,
  },
  dividerText: {
    fontFamily: FONTS.BODY,
    color:      COLORS.TEXT3,
    fontSize:   13,
  },
  secondaryButton: {
    borderWidth:  1,
    borderColor:  COLORS.BORDER,
    borderRadius: RADIUS.MD,
    padding:      SPACING.MD,
    alignItems:   'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.BOLD,
    fontSize:   15,
    color:      COLORS.TEXT2,
  },
})
