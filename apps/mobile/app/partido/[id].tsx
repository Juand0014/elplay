import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, router }              from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS }            from '@elplay/shared/types'

// Pantalla 19 — Detalle del Partido
export default function PartidoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Partido</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>Cargando partido {id}...</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.BG,
  },
  header: {
    padding:    SPACING.LG,
    paddingTop: SPACING.XL,
    gap:        SPACING.MD,
  },
  back: {
    fontFamily: FONTS.BODY,
    color:      COLORS.TEXT2,
    fontSize:   14,
  },
  title: {
    fontFamily:    FONTS.DISPLAY,
    fontSize:      36,
    color:         COLORS.TEXT,
    letterSpacing: 2,
  },
  body: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontFamily: FONTS.BODY,
    color:      COLORS.TEXT3,
  },
})
