import { Controller, useForm }                                   from 'react-hook-form'
import { zodResolver }                                            from '@hookform/resolvers/zod'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { router }                                                 from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS }                         from '@elplay/shared/types'
import { RegisterSchema, type RegisterInput }                     from '@elplay/shared/validators'
import { useAuth }                                                from '../../hooks/use-auth'

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth()

  const { control, handleSubmit, formState: { errors }, setError } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      nombre:          '',
      email:           '',
      password:        '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    const error = await signUp(data.email, data.password, data.nombre)
    if (error) {
      setError('root', { message: error })
    } else {
      Alert.alert(
        '¡Cuenta creada!',
        'Revisa tu email para confirmar tu cuenta.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a tu liga de softball</Text>
        </View>

        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.nombre && styles.inputError]}
                  placeholder="Tu nombre"
                  placeholderTextColor={COLORS.TEXT3}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoComplete="name"
                  returnKeyType="next"
                />
              )}
            />
            {errors.nombre && (
              <Text style={styles.errorText}>{errors.nombre.message}</Text>
            )}
          </View>

          {/* Email */}
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
            <Text style={styles.label}>Contraseña</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={COLORS.TEXT3}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="next"
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={COLORS.TEXT3}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            )}
          </View>

          {/* Error global del servidor */}
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
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.linkButton}>
            <Text style={styles.link}>¿Ya tienes cuenta? Entra</Text>
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
  },
  header: {
    paddingTop:   SPACING.XL,
    marginBottom: SPACING.XL,
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
  },
  subtitle: {
    fontFamily: FONTS.BODY,
    fontSize:   14,
    color:      COLORS.TEXT2,
    marginTop:  SPACING.XS,
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
})
