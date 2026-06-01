import { useState }                    from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS, DEFAULT_GAME_CONFIG } from '@elplay/shared/types'
import { useRoster }                    from '../../hooks/use-roster'
import { useCreateJuegoInterno }        from '../../hooks/use-juegos-internos'
import { useRequireAuth }               from '../../hooks/use-require-auth'
import { useAuthStore }                 from '../../store/auth.store'
import type { Jugador }                 from '../../hooks/use-roster'

const GRUPO_A_COLOR = COLORS.PRIMARY
const GRUPO_B_COLOR = '#3b82f6'

export default function CrearJuegoInternoScreen() {
  useRequireAuth()

  const { equipoId } = useLocalSearchParams<{ equipoId: string }>()
  const userId       = useAuthStore((s) => s.user?.id)

  const { data: roster = [] }           = useRoster(equipoId ?? '')
  const { mutateAsync, isPending }      = useCreateJuegoInterno()

  const [step, setStep]         = useState(1)
  const [fecha]                 = useState(new Date().toISOString())
  const [innings, setInnings]   = useState<number>(DEFAULT_GAME_CONFIG.INNINGS)
  // Asignaciones: null = sin asignar, 'A' = Grupo A, 'B' = Grupo B
  const [asignaciones, setAsignaciones] = useState<Record<string, 'A' | 'B' | null>>({})

  const TOTAL = 3

  const grupoA = roster.filter((j) => asignaciones[j.id] === 'A')
  const grupoB = roster.filter((j) => asignaciones[j.id] === 'B')

  const toggleAsignacion = (jugadorId: string, grupo: 'A' | 'B') => {
    setAsignaciones((prev) => ({
      ...prev,
      [jugadorId]: prev[jugadorId] === grupo ? null : grupo,
    }))
  }

  const canNext2 = grupoA.length >= 1 && grupoB.length >= 1

  const handleCrear = async () => {
    if (!equipoId || !userId) return
    try {
      const juego = await mutateAsync({
        equipo_id:        equipoId,
        fecha,
        scorer_id:        userId,
        innings_override: innings !== DEFAULT_GAME_CONFIG.INNINGS ? innings : null,
        grupos: [
          { nombre: 'Grupo A', color: GRUPO_A_COLOR, jugador_ids: grupoA.map((j) => j.id) },
          { nombre: 'Grupo B', color: GRUPO_B_COLOR, jugador_ids: grupoB.map((j) => j.id) },
        ],
      })
      router.replace(`/interno/${juego.id}`)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear el juego')
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <Text style={styles.backText}>← {step > 1 ? 'Atrás' : 'Cancelar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Juego Interno</Text>
        <Text style={styles.stepInd}>{step}/{TOTAL}</Text>
      </View>

      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">

        {/* PASO 1 — Dividir roster */}
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dividir el Roster</Text>
            <Text style={styles.sectionHint}>Asigna cada jugador a un grupo. Puedes dejar jugadores sin asignar.</Text>

            {/* Contadores */}
            <View style={styles.contadores}>
              <View style={[styles.contador, { borderColor: GRUPO_A_COLOR }]}>
                <Text style={[styles.contadorNum, { color: GRUPO_A_COLOR }]}>{grupoA.length}</Text>
                <Text style={styles.contadorLabel}>Grupo A</Text>
              </View>
              <View style={[styles.contador, { borderColor: GRUPO_B_COLOR }]}>
                <Text style={[styles.contadorNum, { color: GRUPO_B_COLOR }]}>{grupoB.length}</Text>
                <Text style={styles.contadorLabel}>Grupo B</Text>
              </View>
            </View>

            {roster.map((j) => (
              <JugadorRow
                key={j.id}
                jugador={j}
                asignado={asignaciones[j.id] ?? null}
                onToggle={toggleAsignacion}
              />
            ))}

            {roster.length === 0 && (
              <Text style={styles.emptyText}>El equipo no tiene jugadores activos</Text>
            )}
          </View>
        )}

        {/* PASO 2 — Config del juego */}
        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>

            <View style={styles.card}>
              <View style={styles.stepperRow}>
                <Text style={styles.stepperLabel}>Innings</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={[styles.stepBtn, innings <= 3 && styles.stepBtnDis]}
                    onPress={() => setInnings(Math.max(3, innings - 1))}
                    disabled={innings <= 3}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{innings}</Text>
                  <TouchableOpacity
                    style={[styles.stepBtn, innings >= 15 && styles.stepBtnDis]}
                    onPress={() => setInnings(Math.min(15, innings + 1))}
                    disabled={innings >= 15}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* PASO 3 — Resumen */}
        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen</Text>

            <View style={styles.card}>
              <View style={styles.grupoRow}>
                <View style={[styles.grupoIndicator, { backgroundColor: GRUPO_A_COLOR }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.grupoNombre}>Grupo A</Text>
                  <Text style={styles.grupoJugadores}>{grupoA.map((j) => j.nombre).join(', ')}</Text>
                </View>
                <Text style={styles.grupoCount}>{grupoA.length}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.grupoRow}>
                <View style={[styles.grupoIndicator, { backgroundColor: GRUPO_B_COLOR }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.grupoNombre}>Grupo B</Text>
                  <Text style={styles.grupoJugadores}>{grupoB.map((j) => j.nombre).join(', ')}</Text>
                </View>
                <Text style={styles.grupoCount}>{grupoB.length}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Innings</Text>
              <Text style={styles.infoValue}>{innings}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{new Date(fecha).toLocaleDateString('es-DO', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        {step < TOTAL ? (
          <TouchableOpacity
            style={[styles.primaryBtn, step === 1 && !canNext2 && styles.primaryBtnDis]}
            onPress={() => setStep(step + 1)}
            disabled={step === 1 && !canNext2}
          >
            <Text style={styles.primaryBtnText}>Continuar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, isPending && styles.primaryBtnDis]}
            onPress={handleCrear}
            disabled={isPending}
          >
            {isPending ? <ActivityIndicator color={COLORS.TEXT} /> : <Text style={styles.primaryBtnText}>Crear Juego Interno</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ── Sub-componente: fila de jugador ───────────────────────────

interface JugadorRowProps {
  jugador:   Jugador
  asignado:  'A' | 'B' | null
  onToggle:  (id: string, grupo: 'A' | 'B') => void
}

function JugadorRow({ jugador, asignado, onToggle }: JugadorRowProps) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.num}>#{jugador.numero}</Text>
      <Text style={rowStyles.name}>{jugador.nombre}</Text>
      <TouchableOpacity
        style={[rowStyles.btn, asignado === 'A' && { backgroundColor: GRUPO_A_COLOR, borderColor: GRUPO_A_COLOR }]}
        onPress={() => onToggle(jugador.id, 'A')}
      >
        <Text style={[rowStyles.btnText, asignado === 'A' && rowStyles.btnTextSel]}>A</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[rowStyles.btn, asignado === 'B' && { backgroundColor: GRUPO_B_COLOR, borderColor: GRUPO_B_COLOR }]}
        onPress={() => onToggle(jugador.id, 'B')}
      >
        <Text style={[rowStyles.btnText, asignado === 'B' && rowStyles.btnTextSel]}>B</Text>
      </TouchableOpacity>
    </View>
  )
}

const rowStyles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, paddingVertical: SPACING.SM },
  num:         { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT3, width: 36 },
  name:        { flex: 1, fontFamily: FONTS.BODY, fontSize: 15, color: COLORS.TEXT },
  btn:         { width: 36, height: 36, borderRadius: RADIUS.SM, borderWidth: 2, borderColor: COLORS.BORDER, alignItems: 'center', justifyContent: 'center' },
  btnText:     { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT3 },
  btnTextSel:  { color: COLORS.TEXT },
})

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.BG },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.SM },
  backText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  title:       { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT, letterSpacing: 1 },
  stepInd:     { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT3 },
  progress:    { height: 2, backgroundColor: COLORS.BORDER, marginHorizontal: SPACING.LG },
  progressFill:{ height: 2, backgroundColor: COLORS.PRIMARY },
  content:     { flex: 1 },
  pad:         { padding: SPACING.LG, paddingBottom: SPACING.XXL, gap: SPACING.MD },
  section:     { gap: SPACING.MD },
  sectionTitle:{ fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT, letterSpacing: 1 },
  sectionHint: { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2 },
  contadores:  { flexDirection: 'row', gap: SPACING.SM },
  contador:    { flex: 1, alignItems: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 2 },
  contadorNum: { fontFamily: FONTS.DISPLAY, fontSize: 36 },
  contadorLabel: { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT3, textTransform: 'uppercase', letterSpacing: 1 },
  emptyText:   { fontFamily: FONTS.BODY, color: COLORS.TEXT3, textAlign: 'center', padding: SPACING.XL },
  card:        { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER },
  stepperRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepperLabel:{ fontFamily: FONTS.BODY, fontSize: 15, color: COLORS.TEXT },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  stepBtn:     { width: 36, height: 36, borderRadius: RADIUS.SM, backgroundColor: COLORS.SURFACE2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  stepBtnDis:  { opacity: 0.4 },
  stepBtnText: { fontFamily: FONTS.BOLD, fontSize: 20, color: COLORS.TEXT },
  stepValue:   { fontFamily: FONTS.BOLD, fontSize: 18, color: COLORS.PRIMARY, minWidth: 32, textAlign: 'center' },
  grupoRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.SM, paddingVertical: SPACING.SM },
  grupoIndicator: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  grupoNombre: { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  grupoJugadores: { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3, marginTop: 2 },
  grupoCount:  { fontFamily: FONTS.BOLD, fontSize: 20, color: COLORS.TEXT2 },
  divider:     { height: 1, backgroundColor: COLORS.BORDER },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.SM, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  infoLabel:   { fontFamily: FONTS.BODY, fontSize: 14, color: COLORS.TEXT3 },
  infoValue:   { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  footer:      { padding: SPACING.LG, paddingBottom: SPACING.XL, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  primaryBtn:  { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  primaryBtnDis: { opacity: 0.5 },
  primaryBtnText: { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT, letterSpacing: 1 },
})
