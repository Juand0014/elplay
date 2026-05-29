import { useState }                    from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS } from '@elplay/shared/types'
import { usePartido, useIniciarPartido }  from '../../../hooks/use-partidos'
import { useRoster }                      from '../../../hooks/use-roster'
import type { Jugador }                   from '../../../hooks/use-roster'
import { useRequireAuth }                 from '../../../hooks/use-require-auth'
import { useLineupStore }                 from '../../../store/lineup.store'

export default function LineupScreen() {
  useRequireAuth()

  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: partido, isLoading } = usePartido(id ?? '')
  const { data: rosterLocal = [] }    = useRoster(partido?.equipo_local_id ?? '')
  const { data: rosterVisitante = [] } = useRoster(partido?.equipo_visitante_id ?? '')
  const { mutateAsync: iniciar, isPending } = useIniciarPartido()
  const { setLineup } = useLineupStore()

  // Lineup: array de jugador_id en orden al bate (posición 0 = 1ero en batear)
  const [lineupLocal, setLineupLocal]         = useState<string[]>([])
  const [lineupVisitante, setLineupVisitante] = useState<string[]>([])

  const toggleJugador = (jugadorId: string, side: 'local' | 'visitante') => {
    const setter = side === 'local' ? setLineupLocal : setLineupVisitante
    const current = side === 'local' ? lineupLocal : lineupVisitante

    if (current.includes(jugadorId)) {
      setter(current.filter((id) => id !== jugadorId))
    } else if (current.length < 9) {
      setter([...current, jugadorId])
    } else {
      Alert.alert('Lineup completo', 'Ya seleccionaste 9 bateadores. Deselecciona uno para cambiar.')
    }
  }

  const canStart = lineupLocal.length >= 1 && lineupVisitante.length >= 1

  const handleIniciar = async () => {
    if (!id) return
    try {
      setLineup(id, { local: lineupLocal, visitante: lineupVisitante })
      await iniciar(id)
      router.replace(`/scorer/${id}`)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo iniciar el partido')
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.PRIMARY} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Definir Lineup</Text>
        <View style={{ width: 80 }} />
      </View>

      <Text style={styles.hint}>Selecciona hasta 9 bateadores por equipo en el orden al bate.</Text>

      <ScrollView style={styles.content} contentContainerStyle={styles.pad}>

        {/* Equipo Local */}
        <Text style={styles.sideLabel}>
          Local — {lineupLocal.length}/9 seleccionados
        </Text>
        {rosterLocal.map((j, idx) => renderJugador(j, idx, lineupLocal, () => toggleJugador(j.id, 'local')))}

        <View style={styles.spacer} />

        {/* Equipo Visitante */}
        <Text style={styles.sideLabel}>
          Visitante — {lineupVisitante.length}/9 seleccionados
        </Text>
        {rosterVisitante.map((j, idx) => renderJugador(j, idx, lineupVisitante, () => toggleJugador(j.id, 'visitante')))}

        <View style={{ height: SPACING.XXL }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startBtn, (!canStart || isPending) && styles.startBtnDisabled]}
          onPress={handleIniciar}
          disabled={!canStart || isPending}
        >
          {isPending
            ? <ActivityIndicator color={COLORS.TEXT} />
            : <Text style={styles.startBtnText}>Confirmar Lineup e Iniciar Partido</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

function renderJugador(
  j: Jugador,
  idx: number,
  lineup: string[],
  onToggle: () => void
) {
  const pos = lineup.indexOf(j.id)
  const selected = pos !== -1

  return (
    <TouchableOpacity
      key={j.id}
      style={[styles.playerRow, selected && styles.playerRowSelected]}
      onPress={onToggle}
    >
      <View style={[styles.orderCircle, selected && styles.orderCircleSelected]}>
        <Text style={[styles.orderText, selected && styles.orderTextSelected]}>
          {selected ? String(pos + 1) : '#'}
        </Text>
      </View>
      <Text style={[styles.playerNum, selected && styles.playerNumSelected]}>#{j.numero}</Text>
      <Text style={[styles.playerName, selected && styles.playerNameSelected]}>{j.nombre}</Text>
      <Text style={styles.playerPos}>{j.posicion}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.BG },
  center:      { flex: 1, backgroundColor: COLORS.BG, alignItems: 'center', justifyContent: 'center' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.SM },
  backText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  title:       { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT, letterSpacing: 1 },
  hint:        { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT3, paddingHorizontal: SPACING.LG, paddingBottom: SPACING.MD },
  content:     { flex: 1 },
  pad:         { paddingHorizontal: SPACING.LG },
  sideLabel:   { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 1, paddingVertical: SPACING.SM, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, marginBottom: SPACING.SM },
  spacer:      { height: SPACING.XL },
  playerRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, paddingVertical: SPACING.SM, paddingHorizontal: SPACING.SM, borderRadius: RADIUS.SM, borderWidth: 1, borderColor: 'transparent', marginBottom: 4 },
  playerRowSelected: { backgroundColor: `${COLORS.PRIMARY}18`, borderColor: COLORS.PRIMARY },
  orderCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER, alignItems: 'center', justifyContent: 'center' },
  orderCircleSelected: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
  orderText:   { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT3 },
  orderTextSelected: { color: COLORS.TEXT },
  playerNum:   { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT3, width: 32 },
  playerNumSelected: { color: COLORS.PRIMARY },
  playerName:  { flex: 1, fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT2 },
  playerNameSelected: { color: COLORS.TEXT },
  playerPos:   { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3, width: 32, textAlign: 'center' },
  footer:      { padding: SPACING.LG, paddingBottom: SPACING.XL, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  startBtn:    { backgroundColor: COLORS.SUCCESS, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  startBtnDisabled: { opacity: 0.5, backgroundColor: COLORS.SURFACE },
  startBtnText: { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT, letterSpacing: 0.5 },
})
