import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router }                                   from 'expo-router'
import { COLORS, FONTS, SPACING }                   from '@elplay/shared/types'

export default function EditarEquipoScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Editar Equipo</Text>
      <Text style={styles.soon}>Disponible en Fase 2</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, padding: SPACING.LG, paddingTop: SPACING.XXL },
  back:      { marginBottom: SPACING.LG },
  backText:  { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  title:     { fontFamily: FONTS.DISPLAY, fontSize: 48, color: COLORS.TEXT, letterSpacing: 2 },
  soon:      { fontFamily: FONTS.BODY, color: COLORS.TEXT3, marginTop: SPACING.MD },
})
