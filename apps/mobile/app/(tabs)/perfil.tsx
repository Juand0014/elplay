import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router }                                    from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS }            from '@elplay/shared/types'
import { useAuth }                                   from '../../hooks/use-auth'
import { useRequireAuth }                            from '../../hooks/use-require-auth'

// Pantalla 20 — Perfil & Ajustes
export default function PerfilScreen() {
  useRequireAuth()

  const { user, role, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>
          {(user?.user_metadata?.['nombre'] as string | undefined) ?? '—'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{role ?? '—'}</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.BG,
    padding:         SPACING.LG,
  },
  header: {
    paddingTop:   SPACING.XL,
    marginBottom: SPACING.XL,
  },
  title: {
    fontFamily:    FONTS.DISPLAY,
    fontSize:      36,
    color:         COLORS.TEXT,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderWidth:     1,
    borderColor:     COLORS.BORDER,
    borderRadius:    RADIUS.MD,
    padding:         SPACING.MD,
    marginBottom:    SPACING.MD,
  },
  label: {
    fontFamily:    FONTS.BOLD,
    fontSize:      11,
    color:         COLORS.TEXT3,
    marginBottom:  SPACING.XS,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontFamily: FONTS.BODY,
    fontSize:   16,
    color:      COLORS.TEXT,
  },
  signOutButton: {
    borderWidth:   1,
    borderColor:   COLORS.DANGER,
    borderRadius:  RADIUS.MD,
    padding:       SPACING.MD,
    alignItems:    'center',
    marginTop:     'auto',
  },
  signOutText: {
    fontFamily: FONTS.BOLD,
    fontSize:   16,
    color:      COLORS.DANGER,
  },
})
