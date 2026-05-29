import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams }  from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS, EstadoPartido } from '@elplay/shared/types'
import { useJuegosInternos }             from '../../hooks/use-juegos-internos'
import { useRequireAuth }                from '../../hooks/use-require-auth'

export default function HistorialInternoScreen() {
  useRequireAuth()
  const { equipoId } = useLocalSearchParams<{ equipoId: string }>()
  const { data: juegos = [], isLoading } = useJuegosInternos(equipoId ?? '')

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.PRIMARY} /></View>
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial{'\n'}Practicas</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.pad}>
        {juegos.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay practicas registradas</Text>
          </View>
        ) : (
          juegos.map((j) => (
            <TouchableOpacity key={j.id} style={styles.card} onPress={() => router.push(`/interno/${j.id}`)}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardNombre}>{j.nombre}</Text>
                <Text style={styles.cardFecha}>{new Date(j.fecha).toLocaleDateString('es-DO')}</Text>
              </View>
              <Text style={styles.cardScore}>{j.carreras_a} - {j.carreras_b}</Text>
              <View style={[styles.pill, { backgroundColor: j.estado === EstadoPartido.EnVivo ? COLORS.DANGER : COLORS.SURFACE2 }]}>
                <Text style={styles.pillText}>{j.estado === EstadoPartido.EnVivo ? 'LIVE' : 'FINAL'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push(`/interno/crear?equipoId=${equipoId}`)}>
          <Text style={styles.btnText}>+ Nueva Practica</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: COLORS.BG },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.BG },
  header:    { paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD, gap: SPACING.SM },
  backText:  { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  title:     { fontFamily: FONTS.DISPLAY, fontSize: 36, color: COLORS.TEXT, letterSpacing: 2 },
  content:   { flex: 1 },
  pad:       { padding: SPACING.LG, gap: SPACING.SM },
  empty:     { padding: SPACING.XL, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 14 },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.SM },
  cardLeft:  { flex: 1 },
  cardNombre:{ fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  cardFecha: { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  cardScore: { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT },
  pill:      { paddingHorizontal: SPACING.SM, paddingVertical: 3, borderRadius: RADIUS.FULL },
  pillText:  { fontFamily: FONTS.BOLD, fontSize: 10, color: COLORS.TEXT, letterSpacing: 1 },
  footer:    { padding: SPACING.LG, paddingBottom: SPACING.XL, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  btn:       { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  btnText:   { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT },
})
