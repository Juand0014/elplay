import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Modal, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router }    from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS,
  TipoJugada, EstadoPartido, MediaEntrada,
  DEFAULT_GAME_CONFIG,
  evaluateKnockoutClient,
} from '@elplay/shared/types'
import { usePartido }                      from '../../hooks/use-partidos'
import { useLiga }                         from '../../hooks/use-ligas'
import { useRoster }                       from '../../hooks/use-roster'
import { useLineupStore }                  from '../../store/lineup.store'
import { useAuthStore }                    from '../../store/auth.store'
import { supabase }                        from '../../lib/supabase'
import type { Jugador }                    from '../../hooks/use-roster'
import type { KnockoutRule }               from '../../hooks/use-ligas'

// ── Tipos internos ─────────────────────────────────────────────

interface ScoreState {
  outs:       number   // 0-2
  bolas:      number   // 0-3
  strikes:    number   // 0-2
  base1:      string | null
  base2:      string | null
  base3:      string | null
}

// ── Jugadas que terminan el turno al bate ─────────────────────
const TURNO_COMPLETO: TipoJugada[] = [
  TipoJugada.Sencillo, TipoJugada.Doble, TipoJugada.Triple, TipoJugada.Jonron,
  TipoJugada.BasePorBolas, TipoJugada.HitPorPitch, TipoJugada.Ponche,
  TipoJugada.Out, TipoJugada.Error, TipoJugada.Dobleplay,
]

// Jugadas que generan carreras posibles
const JUGADAS_AVANCE = new Set<TipoJugada>([
  TipoJugada.Sencillo, TipoJugada.Doble, TipoJugada.Triple, TipoJugada.Jonron,
])

// ── Pad de jugadas ─────────────────────────────────────────────
const PAD: { tipo: TipoJugada; label: string; color: string }[] = [
  { tipo: TipoJugada.Sencillo,     label: '1B  Sencillo',     color: COLORS.SUCCESS  },
  { tipo: TipoJugada.Doble,        label: '2B  Doble',        color: COLORS.INFO     },
  { tipo: TipoJugada.Triple,       label: '3B  Triple',       color: COLORS.PURPLE   },
  { tipo: TipoJugada.Jonron,       label: 'HR  Jonrón',       color: COLORS.PRIMARY  },
  { tipo: TipoJugada.BasePorBolas, label: 'BB  Bola',         color: COLORS.CYAN     },
  { tipo: TipoJugada.HitPorPitch,  label: 'HBP Hit×Pitch',   color: COLORS.WARNING  },
  { tipo: TipoJugada.Out,          label: 'OUT Fuera',        color: COLORS.TEXT3    },
  { tipo: TipoJugada.Error,        label: 'E   Error',        color: COLORS.WARNING  },
  { tipo: TipoJugada.Dobleplay,    label: 'DP  Doble Play',   color: COLORS.DANGER   },
]

// ── Colores para Info ────────────────────────────────────────--
const INFO_COLOR = '#3b82f6'

export default function ScorerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const userId      = useAuthStore((s) => s.user?.id)
  const getLineup   = useLineupStore((s) => s.getLineup)
  const advanceBatter = useLineupStore((s) => s.advanceBatter)

  const { data: partido, refetch: refetchPartido } = usePartido(id ?? '')
  const { data: liga }   = useLiga(partido?.liga_id ?? '')
  const { data: rosterL } = useRoster(partido?.equipo_local_id ?? '')
  const { data: rosterV } = useRoster(partido?.equipo_visitante_id ?? '')

  // Estado del score local (optimistic)
  const [score, setScore] = useState({ local: 0, visitante: 0, hits_local: 0, hits_visitante: 0 })
  const [gameState, setGameState] = useState<ScoreState>({
    outs: 0, bolas: 0, strikes: 0, base1: null, base2: null, base3: null,
  })

  const [currentMedia, setCurrentMedia] = useState<MediaEntrada>(MediaEntrada.Top)
  const [currentEntrada, setCurrentEntrada] = useState(1)
  const [bateadorIdx, setBateadorIdx]     = useState(0)  // índice en el lineup activo
  const [lastJugadaId, setLastJugadaId]   = useState<string | null>(null)
  const [isSaving, setIsSaving]           = useState(false)
  const [showKoModal, setShowKoModal]     = useState(false)
  const [koRule, setKoRule]               = useState<KnockoutRule | null>(null)
  const [ended, setEnded]                 = useState(false)

  // Debounce: evitar doble tap
  const lastTapRef = useRef(0)

  // Sync estado inicial desde el partido
  useEffect(() => {
    if (!partido) return
    setScore({
      local:      partido.carreras_local,
      visitante:  partido.carreras_visitante,
      hits_local: partido.hits_local,
      hits_visitante: partido.hits_visitante,
    })
    setCurrentEntrada(partido.entrada_actual)
    setCurrentMedia(partido.media_entrada_actual as MediaEntrada)
    if (partido.estado !== EstadoPartido.EnVivo) setEnded(true)
  }, [partido])

  // Realtime subscription
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`scorer:${id}`)
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'partidos',
        filter: `id=eq.${id}`,
      }, () => { void refetchPartido() })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [id, refetchPartido])

  // ── Lineup helpers ────────────────────────────────────────────
  const lineup  = id ? getLineup(id) : null
  const sideKey = currentMedia === MediaEntrada.Top ? 'visitante' : 'local'
  const roster  = sideKey === 'local' ? rosterL ?? [] : rosterV ?? []
  const lineupIds = lineup?.[sideKey] ?? roster.map((j) => j.id)
  const bateadorId  = lineupIds[bateadorIdx] ?? null
  const bateador    = roster.find((j) => j.id === bateadorId) ?? null

  // ── Registrar jugada ──────────────────────────────────────────
  const registrarJugada = useCallback(async (tipo: TipoJugada, carrerasAnotadas: number = 0) => {
    if (!id || !partido || !userId) return
    if (ended) { Alert.alert('Partido terminado'); return }
    if (partido.scorer_id && partido.scorer_id !== userId) {
      Alert.alert('Sin permiso', 'Solo el scorer asignado puede anotar')
      return
    }

    // Debounce 500ms
    const now = Date.now()
    if (now - lastTapRef.current < 500) return
    lastTapRef.current = now

    // Calcular hits
    const esHit = JUGADAS_AVANCE.has(tipo)

    setIsSaving(true)

    try {
      // 1. Insertar jugada
      const { data: jugada, error: jError } = await supabase
        .from('jugadas')
        .insert({
          partido_id:        id,
          jugador_id:        bateadorId ?? (roster[0]?.id ?? '00000000-0000-0000-0000-000000000000'),
          tipo,
          entrada:           currentEntrada,
          media_entrada:     currentMedia,
          carreras_anotadas: carrerasAnotadas,
          anotado_por:       userId,
        })
        .select('id')
        .single()

      if (jError) throw new Error(jError.message)
      const jugadaId = (jugada as { id: string }).id
      setLastJugadaId(jugadaId)

      // 2. Actualizar score optimisticamente
      const newScore = { ...score }
      if (sideKey === 'local') {
        newScore.local      += carrerasAnotadas
        if (esHit) newScore.hits_local += 1
      } else {
        newScore.visitante  += carrerasAnotadas
        if (esHit) newScore.hits_visitante += 1
      }
      setScore(newScore)

      // 3. UPDATE partidos
      const updateData: Record<string, unknown> = {
        carreras_local:     newScore.local,
        carreras_visitante: newScore.visitante,
        hits_local:         newScore.hits_local,
        hits_visitante:     newScore.hits_visitante,
      }
      await supabase.from('partidos').update(updateData).eq('id', id)

      // 4. Actualizar estado local del juego
      const newGameState = { ...gameState }
      let newOuts = gameState.outs

      if (tipo === TipoJugada.Out || tipo === TipoJugada.Ponche || tipo === TipoJugada.Error) {
        newOuts++
        newGameState.outs = newOuts
      } else if (tipo === TipoJugada.Dobleplay) {
        newOuts = Math.min(3, newOuts + 2)
        newGameState.outs = newOuts
      }

      // Resetear cuenta
      newGameState.bolas   = 0
      newGameState.strikes = 0
      setGameState(newGameState)

      // 5. Avanzar bateador si la jugada completa el turno
      if (TURNO_COMPLETO.includes(tipo)) {
        const nextIdx = advanceBatter(id, sideKey, bateadorIdx)
        setBateadorIdx(nextIdx)
      }

      // 6. Si 3 outs → preparar para siguiente entrada
      if (newOuts >= 3) {
        // El scorer debe presionar "Siguiente Entrada" manualmente
        setGameState({ outs: 3, bolas: 0, strikes: 0, base1: null, base2: null, base3: null })
      }

    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error registrando jugada')
      // Revertir optimistic
      void refetchPartido()
    } finally {
      setIsSaving(false)
    }
  }, [id, partido, userId, ended, bateadorId, bateadorIdx, roster, sideKey, currentEntrada, currentMedia, score, gameState, advanceBatter, refetchPartido])

  // ── Siguiente entrada ─────────────────────────────────────────
  const siguienteEntrada = async () => {
    if (!id || !partido) return

    let nextEntrada = currentEntrada
    let nextMedia   = currentMedia

    if (currentMedia === MediaEntrada.Top) {
      nextMedia = MediaEntrada.Bottom
    } else {
      nextMedia   = MediaEntrada.Top
      nextEntrada = currentEntrada + 1
    }

    setCurrentEntrada(nextEntrada)
    setCurrentMedia(nextMedia)
    setGameState({ outs: 0, bolas: 0, strikes: 0, base1: null, base2: null, base3: null })
    setBateadorIdx(0)

    // UPDATE en DB
    await supabase.from('partidos').update({
      entrada_actual:       nextEntrada,
      media_entrada_actual: nextMedia,
    }).eq('id', id)

    // Evaluar KO al terminar cada Bottom
    if (currentMedia === MediaEntrada.Bottom && liga) {
      const rules = liga.knockout_rules
      if (rules.length > 0 && partido) {
        const fakePartido = {
          ...partido,
          carreras_local:       score.local,
          carreras_visitante:   score.visitante,
          entrada_actual:       currentEntrada,
          media_entrada_actual: currentMedia,
          estado:               EstadoPartido.EnVivo,
        }
        const triggered = evaluateKnockoutClient(fakePartido, rules)
        if (triggered) {
          setKoRule(triggered)
          setShowKoModal(true)
          return
        }
      }

      // Verificar si completó los innings
      const maxInnings = partido.innings_override ?? liga.innings ?? DEFAULT_GAME_CONFIG.INNINGS
      if (currentEntrada >= maxInnings) {
        await finalizarPartido()
        return
      }
    }
  }

  // ── Finalizar partido ─────────────────────────────────────────
  const finalizarPartido = async (isKo = false) => {
    if (!id) return
    const nuevoEstado = isKo ? EstadoPartido.Knockout : EstadoPartido.Finalizado
    await supabase.from('partidos').update({ estado: nuevoEstado }).eq('id', id)
    setEnded(true)
    setShowKoModal(false)
    Alert.alert(
      isKo ? '¡Knockout!' : '¡Partido finalizado!',
      `Score final: ${score.local} — ${score.visitante}`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/') }]
    )
  }

  // ── Deshacer última jugada ────────────────────────────────────
  const undoUltima = () => {
    if (!lastJugadaId) return
    Alert.alert('Deshacer', '¿Deshacer la última jugada registrada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deshacer', style: 'destructive',
        onPress: async () => {
          await supabase.from('jugadas').delete().eq('id', lastJugadaId)
          setLastJugadaId(null)
          void refetchPartido()
        },
      },
    ])
  }

  // ── Loading / ended ───────────────────────────────────────────
  if (!partido) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.PRIMARY} />
      </View>
    )
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>

      {/* ── Header Score ── */}
      <View style={styles.scoreHeader}>
        <View style={styles.livePill}>
          <Text style={styles.livePillText}>EN VIVO</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreTeam} numberOfLines={1}>{partido.equipo_local_nombre}</Text>
          <Text style={styles.scoreNumber}>{score.local}</Text>
          <Text style={styles.scoreDash}>—</Text>
          <Text style={styles.scoreNumber}>{score.visitante}</Text>
          <Text style={[styles.scoreTeam, { textAlign: 'right' }]} numberOfLines={1}>{partido.equipo_visitante_nombre}</Text>
        </View>

        <Text style={styles.inningLabel}>
          {currentMedia === MediaEntrada.Top ? 'TOP' : 'BOT'} {currentEntrada}ª
        </Text>

        <TouchableOpacity
          style={styles.finalizarBtn}
          onPress={() => Alert.alert('Finalizar', '¿Finalizar el partido ahora?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Finalizar', style: 'destructive', onPress: () => finalizarPartido(false) },
          ])}
        >
          <Text style={styles.finalizarText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollPad}>

        {/* ── Estado del juego ── */}
        <View style={styles.gameStateRow}>
          {/* Outs */}
          <View style={styles.gameStateBlock}>
            <Text style={styles.gameStateLabel}>OUTS</Text>
            <View style={styles.outsDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.outDot, i < gameState.outs && styles.outDotFilled]} />
              ))}
            </View>
          </View>

          {/* Bases (diamante simplificado) */}
          <View style={styles.diamond}>
            <View style={styles.diamondRow}>
              <View style={[styles.base, !!gameState.base2 && styles.baseOccupied]} />
            </View>
            <View style={[styles.diamondRow, { justifyContent: 'space-between', width: 80 }]}>
              <View style={[styles.base, !!gameState.base3 && styles.baseOccupied]} />
              <View style={[styles.base, !!gameState.base1 && styles.baseOccupied]} />
            </View>
            <View style={styles.diamondRow}>
              <View style={[styles.base, styles.baseHome]} />
            </View>
          </View>

          {/* Cuenta */}
          <View style={styles.gameStateBlock}>
            <Text style={styles.gameStateLabel}>CUENTA</Text>
            <Text style={styles.cuentaText}>{gameState.bolas}–{gameState.strikes}</Text>
            <Text style={styles.cuentaSub}>B–S</Text>
          </View>
        </View>

        {/* ── Bateador actual ── */}
        {bateador ? (
          <View style={styles.bateadorCard}>
            <View style={styles.bateadorNum}>
              <Text style={styles.bateadorNumText}>#{bateador.numero}</Text>
            </View>
            <View style={styles.bateadorInfo}>
              <Text style={styles.bateadorName}>{bateador.nombre}</Text>
              <Text style={styles.bateadorPos}>{bateador.posicion} · Al bate</Text>
            </View>
          </View>
        ) : (
          <View style={styles.bateadorCard}>
            <Text style={styles.bateadorName}>Sin bateador seleccionado</Text>
          </View>
        )}

        {/* ── Pad de jugadas ── */}
        {!ended && (
          <View style={styles.pad}>
            {PAD.map(({ tipo, label, color }) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.padBtn, isSaving && styles.padBtnDisabled, { borderColor: color }]}
                onPress={() => {
                  // Jugadas de carrera piden confirmación de cuántas anotaron
                  if (tipo === TipoJugada.Jonron) {
                    registrarJugada(tipo, 1)
                  } else if (tipo === TipoJugada.Sencillo || tipo === TipoJugada.Doble || tipo === TipoJugada.Triple) {
                    registrarJugada(tipo, 0)
                  } else {
                    registrarJugada(tipo, 0)
                  }
                }}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={[styles.padBtnText, { color }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Botones de cuenta ── */}
        {!ended && (
          <View style={styles.cuentaBtns}>
            <TouchableOpacity
              style={styles.cuentaBtn}
              onPress={() => setGameState((s) => ({ ...s, strikes: Math.min(2, s.strikes + 1) }))}
            >
              <Text style={styles.cuentaBtnText}>Strike</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cuentaBtn}
              onPress={() => setGameState((s) => ({ ...s, bolas: Math.min(3, s.bolas + 1) }))}
            >
              <Text style={styles.cuentaBtnText}>Bola</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cuentaBtn}
              onPress={() => setGameState((s) => ({ ...s, strikes: Math.min(2, s.strikes + 1) }))}
            >
              <Text style={styles.cuentaBtnText}>Foul</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Siguiente entrada / deshacer ── */}
        <View style={styles.actionRow}>
          {gameState.outs >= 3 && !ended && (
            <TouchableOpacity style={styles.nextInningBtn} onPress={siguienteEntrada}>
              <Text style={styles.nextInningText}>Siguiente Entrada →</Text>
            </TouchableOpacity>
          )}
          {lastJugadaId && !ended && (
            <TouchableOpacity style={styles.undoBtn} onPress={undoUltima}>
              <Text style={styles.undoText}>↩ Deshacer última</Text>
            </TouchableOpacity>
          )}
        </View>

        {ended && (
          <View style={styles.endedBanner}>
            <Text style={styles.endedText}>Partido finalizado</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/') }>
              <Text style={styles.endedLink}>Ir al inicio →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modal KO ── */}
      <Modal visible={showKoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.koModal}>
            <Text style={styles.koModalTitle}>¡KNOCKOUT!</Text>
            <Text style={styles.koModalScore}>{score.local} — {score.visitante}</Text>
            {koRule && (
              <Text style={styles.koModalDesc}>
                Diferencia de {Math.abs(score.local - score.visitante)} carreras en la {currentEntrada}ª entrada
              </Text>
            )}
            <TouchableOpacity
              style={styles.koModalBtn}
              onPress={() => finalizarPartido(true)}
            >
              <Text style={styles.koModalBtnText}>Confirmar y cerrar partido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: COLORS.BG },
  center:         { flex: 1, backgroundColor: COLORS.BG, alignItems: 'center', justifyContent: 'center' },
  scoreHeader:    { backgroundColor: COLORS.SURFACE, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, padding: SPACING.MD, paddingTop: SPACING.XL, gap: SPACING.XS },
  livePill:       { alignSelf: 'center', backgroundColor: COLORS.DANGER, borderRadius: RADIUS.FULL, paddingHorizontal: SPACING.MD, paddingVertical: 3 },
  livePillText:   { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT, letterSpacing: 2 },
  scoreRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM },
  scoreTeam:      { flex: 1, fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2, textAlign: 'center' },
  scoreNumber:    { fontFamily: FONTS.DISPLAY, fontSize: 52, color: COLORS.TEXT, lineHeight: 56 },
  scoreDash:      { fontFamily: FONTS.DISPLAY, fontSize: 32, color: COLORS.TEXT3 },
  inningLabel:    { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.PRIMARY, textAlign: 'center', letterSpacing: 2 },
  finalizarBtn:   { position: 'absolute', top: SPACING.XL, right: SPACING.MD, padding: SPACING.XS },
  finalizarText:  { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.DANGER },
  scroll:         { flex: 1 },
  scrollPad:      { padding: SPACING.MD, gap: SPACING.MD, paddingBottom: SPACING.XXL },
  gameStateRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER },
  gameStateBlock: { alignItems: 'center', gap: SPACING.XS },
  gameStateLabel: { fontFamily: FONTS.BOLD, fontSize: 10, color: COLORS.TEXT3, textTransform: 'uppercase', letterSpacing: 1 },
  outsDots:       { flexDirection: 'row', gap: SPACING.XS },
  outDot:         { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.TEXT3 },
  outDotFilled:   { backgroundColor: COLORS.DANGER, borderColor: COLORS.DANGER },
  diamond:        { alignItems: 'center', gap: 4 },
  diamondRow:     { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  base:           { width: 18, height: 18, borderWidth: 2, borderColor: COLORS.TEXT3, transform: [{ rotate: '45deg' }] },
  baseOccupied:   { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
  baseHome:       { backgroundColor: COLORS.SURFACE2 },
  cuentaText:     { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT },
  cuentaSub:      { fontFamily: FONTS.BODY, fontSize: 11, color: COLORS.TEXT3 },
  bateadorCard:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER },
  bateadorNum:    { width: 48, height: 48, borderRadius: RADIUS.SM, backgroundColor: COLORS.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  bateadorNumText:{ fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  bateadorInfo:   { flex: 1 },
  bateadorName:   { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT },
  bateadorPos:    { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  pad:            { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.SM },
  padBtn:         { width: '31%', paddingVertical: SPACING.LG, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, borderWidth: 1 },
  padBtnDisabled: { opacity: 0.4 },
  padBtnText:     { fontFamily: FONTS.BOLD, fontSize: 13 },
  cuentaBtns:     { flexDirection: 'row', gap: SPACING.SM },
  cuentaBtn:      { flex: 1, paddingVertical: SPACING.SM, alignItems: 'center', backgroundColor: COLORS.SURFACE2, borderRadius: RADIUS.MD, borderWidth: 1, borderColor: COLORS.BORDER },
  cuentaBtnText:  { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2 },
  actionRow:      { gap: SPACING.SM },
  nextInningBtn:  { backgroundColor: COLORS.SUCCESS, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  nextInningText: { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT, letterSpacing: 1 },
  undoBtn:        { borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.SM, alignItems: 'center' },
  undoText:       { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2 },
  endedBanner:    { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.LG, alignItems: 'center', gap: SPACING.SM, borderWidth: 1, borderColor: COLORS.BORDER },
  endedText:      { fontFamily: FONTS.DISPLAY, fontSize: 24, color: COLORS.TEXT3, letterSpacing: 2 },
  endedLink:      { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.PRIMARY },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: SPACING.LG },
  koModal:        { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.XL, padding: SPACING.XL, alignItems: 'center', gap: SPACING.MD, width: '100%', borderWidth: 1, borderColor: COLORS.DANGER },
  koModalTitle:   { fontFamily: FONTS.DISPLAY, fontSize: 52, color: COLORS.DANGER, letterSpacing: 4 },
  koModalScore:   { fontFamily: FONTS.DISPLAY, fontSize: 48, color: COLORS.TEXT },
  koModalDesc:    { fontFamily: FONTS.BODY, fontSize: 14, color: COLORS.TEXT2, textAlign: 'center', lineHeight: 20 },
  koModalBtn:     { backgroundColor: COLORS.DANGER, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center', width: '100%' },
  koModalBtnText: { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
})
