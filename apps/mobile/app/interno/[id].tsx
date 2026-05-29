import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router }                                  from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS, EstadoPartido }                from '@elplay/shared/types'
import { usePartido }                                                    from '../../hooks/use-partidos'
import { useRequireAuth }                                                from '../../hooks/use-require-auth'
import { useAuthStore }                                                  from '../../store/auth.store'

// Vista de un juego interno — solo miembros del equipo
export default function JuegoInternoScreen() {
  useRequireAuth()

  const { id }   = useLocalSearchParams<{ id: string }>()
  const userId   = useAuthStore((s) => s.user?.id)
  const { data: partido, isLoading } = usePartido(id ?? '')

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.PRIMARY} />
      </View>
    )
  }

  if (!partido) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Juego no encontrado</Text>
      </View>
    )
  }

  const isScorer = partido.scorer_id === userId
  const isLive   = partido.estado === EstadoPartido.EnVivo

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>PRACTICA</Text>
          </View>
          {isLive && (
            <View style={[styles.pill, styles.pillLive]}>
              <Text style={styles.pillText}>EN VIVO</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.scoreBox}>
        <View style={styles.side}>
          <View style={[styles.badge, { backgroundColor: COLORS.PRIMARY }]}>
            <Text style={styles.badgeText}>A</Text>
          </View>
          <Text style={styles.teamLabel}>Grupo A</Text>
        </View>
        <View style={styles.scoreCenter}>
          <Text style={styles.score}>
            {partido.carreras_local} — {partido.carreras_visitante}
          </Text>
          {isLive && (
            <Text style={styles.entrada}>{partido.media_entrada_actual === 'top' ? 'TOP' : 'BOT'} {partido.entrada_actual}ª</Text>
          )}
        </View>
        <View style={styles.side}>
          <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
            <Text style={styles.badgeText}>B</Text>
          </View>
          <Text style={styles.teamLabel}>Grupo B</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.fechaText}>
          {new Date(partido.fecha).toLocaleDateString('es-DO', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <View style={[styles.estadoBadge, { backgroundColor: estadoColor(partido.estado) }]}>
          <Text style={styles.estadoText}>{estadoLabel(partido.estado)}</Text>
        </View>
      </View>

      {isScorer && isLive && (
        <TouchableOpacity
          style={styles.scorerBtn}
          onPress={() => router.push(`/scorer/${id}`)}
        >
          <Text style={styles.scorerBtnText}>Ir al Scorer →</Text>
        </TouchableOpacity>
      )}

      {partido.estado === EstadoPartido.Pendiente && isScorer && (
        <TouchableOpacity
          style={styles.iniciarBtn}
          onPress={() => router.push(`/partido/${id}/lineup`)}
        >
          <Text style={styles.iniciarBtnText}>Definir Grupos e Iniciar →</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function estadoLabel(estado: string): string {
  const m: Record<string, string> = { pending: 'Pendiente', live: 'En Vivo', done: 'Finalizado', ko: 'KO' }
  return m[estado] ?? estado
}
function estadoColor(estado: string): string {
  const m: Record<string, string> = { live: COLORS.DANGER, done: COLORS.SURFACE2, ko: COLORS.WARNING, pending: COLORS.SURFACE2 }
  return m[estado] ?? COLORS.SURFACE2
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.BG },
  center:      { flex: 1, backgroundColor: COLORS.BG, alignItems: 'center', justifyContent: 'center' },
  errorText:   { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 16 },
  header:      { paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD, gap: SPACING.SM },
  backText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  pillRow:     { flexDirection: 'row', gap: SPACING.SM },
  pill:        { backgroundColor: COLORS.SURFACE2, paddingHorizontal: SPACING.SM, paddingVertical: 4, borderRadius: RADIUS.FULL },
  pillLive:    { backgroundColor: COLORS.DANGER },
  pillText:    { fontFamily: FONTS.BOLD, fontSize: 10, color: COLORS.TEXT, letterSpacing: 2 },
  scoreBox:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.XL, paddingVertical: SPACING.LG },
  side:        { alignItems: 'center', gap: SPACING.SM },
  badge:       { width: 60, height: 60, borderRadius: RADIUS.MD, alignItems: 'center', justifyContent: 'center' },
  badgeText:   { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT },
  teamLabel:   { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.TEXT2 },
  scoreCenter: { alignItems: 'center' },
  score:       { fontFamily: FONTS.DISPLAY, fontSize: 52, color: COLORS.TEXT },
  entrada:     { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.PRIMARY, letterSpacing: 2 },
  infoSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingBottom: SPACING.MD },
  fechaText:   { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2 },
  estadoBadge: { paddingHorizontal: SPACING.SM, paddingVertical: 4, borderRadius: RADIUS.SM },
  estadoText:  { fontFamily: FONTS.BOLD, fontSize: 10, color: COLORS.TEXT, textTransform: 'uppercase' },
  scorerBtn:   { marginHorizontal: SPACING.LG, backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  scorerBtnText: { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
  iniciarBtn:  { marginHorizontal: SPACING.LG, marginTop: SPACING.SM, backgroundColor: COLORS.SUCCESS, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  iniciarBtnText: { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
})
