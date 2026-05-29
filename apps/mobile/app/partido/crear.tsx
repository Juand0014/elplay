import { useState }                    from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS, TipoPartido } from '@elplay/shared/types'
import { useEquipos }                   from '../../hooks/use-equipos'
import { useLiga }                      from '../../hooks/use-ligas'
import { useCreatePartido }             from '../../hooks/use-partidos'
import { useRequireAuth }               from '../../hooks/use-require-auth'
import { useAuthStore }                 from '../../store/auth.store'

export default function CrearPartidoScreen() {
  useRequireAuth()

  const { ligaId } = useLocalSearchParams<{ ligaId: string }>()
  const userId = useAuthStore((s) => s.user?.id)

  const [step, setStep]                 = useState(1)
  const [equipoLocalId, setEquipoLocal]     = useState('')
  const [equipoVisitanteId, setEquipoVisitante] = useState('')
  const [fecha, setFecha]               = useState(new Date().toISOString())
  const [usarConfigLiga, setUsarConfig] = useState(true)
  const [inningsOverride, setInnings]   = useState<number | null>(null)

  const { data: liga }        = useLiga(ligaId ?? '')
  const { data: equipos = [] } = useEquipos(ligaId ?? '')
  const { mutateAsync, isPending } = useCreatePartido()

  const canNext1 = equipoLocalId && equipoVisitanteId && equipoLocalId !== equipoVisitanteId
  const TOTAL    = 4

  const handleCreate = async () => {
    if (!ligaId || !userId) return
    try {
      const partido = await mutateAsync({
        liga_id:             ligaId,
        torneo_id:           null,
        equipo_local_id:     equipoLocalId,
        equipo_visitante_id: equipoVisitanteId,
        scorer_id:           userId, // por defecto el creador es scorer
        tipo:                TipoPartido.Liga,
        fecha,
        innings_override:    usarConfigLiga ? null : inningsOverride,
      })
      // Ir al lineup
      router.replace(`/partido/${partido.id}/lineup`)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear el partido')
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <Text style={styles.backText}>← {step > 1 ? 'Atrás' : 'Cancelar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Partido</Text>
        <Text style={styles.stepInd}>{step} / {TOTAL}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">

        {/* PASO 1 — Equipos */}
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipos</Text>
            {liga && (
              <Text style={styles.sectionHint}>Liga: {liga.nombre} · Temporada {liga.temporada}</Text>
            )}

            <Text style={styles.label}>Equipo Local</Text>
            <View style={styles.teamList}>
              {equipos.map((eq) => (
                <TouchableOpacity
                  key={eq.id}
                  style={[
                    styles.teamOption,
                    equipoLocalId === eq.id && styles.teamOptionSelected,
                    equipoVisitanteId === eq.id && styles.teamOptionDisabled,
                  ]}
                  onPress={() => equipoVisitanteId !== eq.id && setEquipoLocal(eq.id)}
                  disabled={equipoVisitanteId === eq.id}
                >
                  <View style={[styles.teamBadge, { backgroundColor: eq.color_primario }]}>
                    <Text style={styles.teamBadgeText}>{eq.abreviatura}</Text>
                  </View>
                  <Text style={styles.teamName}>{eq.nombre}</Text>
                  {equipoLocalId === eq.id && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: SPACING.MD }]}>Equipo Visitante</Text>
            <View style={styles.teamList}>
              {equipos.map((eq) => (
                <TouchableOpacity
                  key={eq.id}
                  style={[
                    styles.teamOption,
                    equipoVisitanteId === eq.id && styles.teamOptionSelected,
                    equipoLocalId === eq.id && styles.teamOptionDisabled,
                  ]}
                  onPress={() => equipoLocalId !== eq.id && setEquipoVisitante(eq.id)}
                  disabled={equipoLocalId === eq.id}
                >
                  <View style={[styles.teamBadge, { backgroundColor: eq.color_primario }]}>
                    <Text style={styles.teamBadgeText}>{eq.abreviatura}</Text>
                  </View>
                  <Text style={styles.teamName}>{eq.nombre}</Text>
                  {equipoVisitanteId === eq.id && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {!canNext1 && equipoLocalId && equipoVisitanteId && equipoLocalId === equipoVisitanteId && (
              <Text style={styles.errorText}>Los equipos deben ser distintos</Text>
            )}
          </View>
        )}

        {/* PASO 2 — Fecha */}
        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha y hora</Text>
            <Text style={styles.sectionHint}>Puedes cambiar la fecha antes de iniciar el partido.</Text>
            {/* Fecha por defecto = hoy. Sin date picker nativo para no añadir deps extra */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Fecha programada</Text>
              <Text style={styles.infoValue}>{new Date(fecha).toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            <View style={styles.dateButtons}>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setFecha(new Date().toISOString())}>
                <Text style={styles.dateBtnText}>Hoy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateBtn} onPress={() => {
                const mañana = new Date()
                mañana.setDate(mañana.getDate() + 1)
                setFecha(mañana.toISOString())
              }}>
                <Text style={styles.dateBtnText}>Mañana</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateBtn} onPress={() => {
                const semana = new Date()
                semana.setDate(semana.getDate() + 7)
                setFecha(semana.toISOString())
              }}>
                <Text style={styles.dateBtnText}>+7 días</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PASO 3 — Config */}
        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            {liga && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Config de la liga</Text>
                <Text style={styles.infoValue}>{liga.innings} innings · {liga.outs_por_entrada} outs</Text>
                {liga.knockout_rules.length > 0 && (
                  <Text style={styles.infoSub}>KO activo — {liga.knockout_rules.length} regla{liga.knockout_rules.length > 1 ? 's' : ''}</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.toggleRow]}
              onPress={() => setUsarConfig(!usarConfigLiga)}
            >
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Usar configuración de la liga</Text>
                <Text style={styles.toggleHint}>Solo cambia este partido, no afecta la liga</Text>
              </View>
              <View style={[styles.toggle, usarConfigLiga && styles.toggleOn]}>
                <View style={[styles.toggleThumb, usarConfigLiga && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* PASO 4 — Scorer y resumen */}
        {step === 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            {(() => {
              const local     = equipos.find((e) => e.id === equipoLocalId)
              const visitante = equipos.find((e) => e.id === equipoVisitanteId)
              return (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryTeams}>
                    <View style={styles.summaryTeam}>
                      <View style={[styles.summaryBadge, { backgroundColor: local?.color_primario ?? COLORS.PRIMARY }]}>
                        <Text style={styles.summaryBadgeText}>{local?.abreviatura}</Text>
                      </View>
                      <Text style={styles.summaryTeamName}>{local?.nombre}</Text>
                      <Text style={styles.summaryRole}>Local</Text>
                    </View>
                    <Text style={styles.vs}>VS</Text>
                    <View style={styles.summaryTeam}>
                      <View style={[styles.summaryBadge, { backgroundColor: visitante?.color_primario ?? COLORS.INFO }]}>
                        <Text style={styles.summaryBadgeText}>{visitante?.abreviatura}</Text>
                      </View>
                      <Text style={styles.summaryTeamName}>{visitante?.nombre}</Text>
                      <Text style={styles.summaryRole}>Visitante</Text>
                    </View>
                  </View>
                  <Text style={styles.summaryFecha}>
                    {new Date(fecha).toLocaleDateString('es-DO', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.summaryConfig}>
                    {usarConfigLiga ? `Config de la liga (${liga?.innings ?? 9} innings)` : `${inningsOverride ?? liga?.innings} innings (override)`}
                  </Text>
                </View>
              )
            })()}
            <Text style={styles.scorerNote}>Tu usuario quedará como scorer asignado por defecto.</Text>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        {step < TOTAL ? (
          <TouchableOpacity
            style={[styles.primaryBtn, !canNext1 && step === 1 && styles.primaryBtnDisabled]}
            onPress={() => setStep(step + 1)}
            disabled={step === 1 && !canNext1}
          >
            <Text style={styles.primaryBtnText}>Continuar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, isPending && styles.primaryBtnDisabled]}
            onPress={handleCreate}
            disabled={isPending}
          >
            {isPending ? <ActivityIndicator color={COLORS.TEXT} /> : <Text style={styles.primaryBtnText}>Crear Partido</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ── Estilos ────────────────────────────────────────────────────
const { INFO } = { INFO: '#3b82f6' }

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.BG },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD },
  backText:      { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  title:         { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT, letterSpacing: 1 },
  stepInd:       { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT3 },
  progressBar:   { height: 2, backgroundColor: COLORS.BORDER, marginHorizontal: SPACING.LG },
  progressFill:  { height: 2, backgroundColor: COLORS.PRIMARY },
  content:       { flex: 1 },
  pad:           { padding: SPACING.LG, paddingBottom: SPACING.XXL, gap: SPACING.MD },
  section:       { gap: SPACING.MD },
  sectionTitle:  { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT, letterSpacing: 1 },
  sectionHint:   { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2 },
  label:         { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 1 },
  teamList:      { gap: SPACING.SM },
  teamOption:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER },
  teamOptionSelected: { borderColor: COLORS.PRIMARY, backgroundColor: `${COLORS.PRIMARY}15` },
  teamOptionDisabled: { opacity: 0.4 },
  teamBadge:     { width: 40, height: 40, borderRadius: RADIUS.SM, alignItems: 'center', justifyContent: 'center' },
  teamBadgeText: { fontFamily: FONTS.DISPLAY, fontSize: 14, color: COLORS.TEXT },
  teamName:      { flex: 1, fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
  check:         { fontFamily: FONTS.BOLD, fontSize: 18, color: COLORS.PRIMARY },
  errorText:     { fontFamily: FONTS.BODY, color: COLORS.DANGER, fontSize: 13 },
  infoCard:      { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: 4 },
  infoLabel:     { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT3, textTransform: 'uppercase', letterSpacing: 1 },
  infoValue:     { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT },
  infoSub:       { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  dateButtons:   { flexDirection: 'row', gap: SPACING.SM },
  dateBtn:       { flex: 1, backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.SM, alignItems: 'center' },
  dateBtnText:   { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2 },
  toggleRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.MD },
  toggleInfo:    { flex: 1, gap: 2 },
  toggleLabel:   { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  toggleHint:    { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  toggle:        { width: 48, height: 28, borderRadius: 14, backgroundColor: COLORS.BORDER, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn:      { backgroundColor: COLORS.PRIMARY },
  toggleThumb:   { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.TEXT },
  toggleThumbOn: { alignSelf: 'flex-end' },
  summaryCard:   { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.LG, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.SM },
  summaryTeams:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTeam:   { alignItems: 'center', gap: SPACING.XS, flex: 1 },
  summaryBadge:  { width: 52, height: 52, borderRadius: RADIUS.MD, alignItems: 'center', justifyContent: 'center' },
  summaryBadgeText: { fontFamily: FONTS.DISPLAY, fontSize: 18, color: COLORS.TEXT },
  summaryTeamName: { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.TEXT, textAlign: 'center' },
  summaryRole:   { fontFamily: FONTS.BODY, fontSize: 11, color: COLORS.TEXT3 },
  vs:            { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT3, letterSpacing: 2 },
  summaryFecha:  { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2, textAlign: 'center' },
  summaryConfig: { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3, textAlign: 'center' },
  scorerNote:    { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT3, textAlign: 'center' },
  footer:        { padding: SPACING.LG, paddingBottom: SPACING.XL, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  primaryBtn:    { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT, letterSpacing: 1 },
})
