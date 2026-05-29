import { useState }                    from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Switch, Alert,
} from 'react-native'
import { router }                       from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS, GAME_CONFIG_LIMITS, DEFAULT_GAME_CONFIG } from '@elplay/shared/types'
import { useCreateLiga }                from '../../hooks/use-ligas'
import { useRequireAuth }               from '../../hooks/use-require-auth'

// ── Tipos locales ─────────────────────────────────────────────

interface KoRule {
  diferencia_carreras: number
  desde_entrada:       number
}

interface FormData {
  nombre:           string
  temporada:        string
  innings:          number
  innings_minimos:  number
  outs_por_entrada: number
  knockout_activo:  boolean
  knockout_rules:   KoRule[]
}

// ── Componente Stepper ────────────────────────────────────────

interface StepperProps {
  label:   string
  value:   number
  min:     number
  max:     number
  onChange: (v: number) => void
}

function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <View style={stepStyles.row}>
      <Text style={stepStyles.label}>{label}</Text>
      <View style={stepStyles.controls}>
        <TouchableOpacity
          style={[stepStyles.btn, value <= min && stepStyles.btnDisabled]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Text style={stepStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={stepStyles.value}>{value}</Text>
        <TouchableOpacity
          style={[stepStyles.btn, value >= max && stepStyles.btnDisabled]}
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Text style={stepStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const stepStyles = StyleSheet.create({
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.SM },
  label:       { fontFamily: FONTS.BODY, fontSize: 15, color: COLORS.TEXT, flex: 1 },
  controls:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  btn:         { width: 36, height: 36, borderRadius: RADIUS.MD, backgroundColor: COLORS.SURFACE, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  btnDisabled: { opacity: 0.4 },
  btnText:     { fontFamily: FONTS.BOLD, fontSize: 20, color: COLORS.TEXT },
  value:       { fontFamily: FONTS.BOLD, fontSize: 18, color: COLORS.PRIMARY, minWidth: 32, textAlign: 'center' },
})

// ── Pantalla principal ────────────────────────────────────────

export default function CrearLigaScreen() {
  useRequireAuth()
  const { mutateAsync, isPending } = useCreateLiga()

  const [step, setStep]   = useState(1)
  const TOTAL_STEPS       = 4

  const [form, setForm] = useState<FormData>({
    nombre:           '',
    temporada:        String(new Date().getFullYear()),
    innings:          DEFAULT_GAME_CONFIG.INNINGS,
    innings_minimos:  DEFAULT_GAME_CONFIG.INNINGS_MINIMOS,
    outs_por_entrada: DEFAULT_GAME_CONFIG.OUTS_POR_ENTRADA,
    knockout_activo:  true,
    knockout_rules:   [{ diferencia_carreras: 15, desde_entrada: 5 }],
  })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const addKoRule = () =>
    set('knockout_rules', [...form.knockout_rules, { diferencia_carreras: 10, desde_entrada: 7 }])

  const removeKoRule = (i: number) =>
    set('knockout_rules', form.knockout_rules.filter((_, idx) => idx !== i))

  const updateKoRule = (i: number, field: keyof KoRule, value: number) => {
    const rules = [...form.knockout_rules]
    rules[i] = { ...rules[i]!, [field]: value }
    set('knockout_rules', rules)
  }

  const canAdvance = () => {
    if (step === 1) return form.nombre.trim().length >= 3
    return true
  }

  const handleCreate = async () => {
    try {
      const liga = await mutateAsync(form)
      router.replace(`/liga/${liga.id}`)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear la liga')
    }
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <Text style={styles.backText}>← {step > 1 ? 'Atrás' : 'Cancelar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Liga</Text>
        <Text style={styles.stepIndicator}>{step} / {TOTAL_STEPS}</Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding} keyboardShouldPersistTaps="handled">

        {/* PASO 1 — Info básica */}
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Información básica</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre de la liga *</Text>
              <TextInput
                style={[styles.input, !form.nombre.trim() && styles.inputHint]}
                placeholder="Ej: Liga de Softball Invierno"
                placeholderTextColor={COLORS.TEXT3}
                value={form.nombre}
                onChangeText={(v) => set('nombre', v)}
                returnKeyType="next"
                autoFocus
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Temporada</Text>
              <TextInput
                style={styles.input}
                placeholder={String(new Date().getFullYear())}
                placeholderTextColor={COLORS.TEXT3}
                value={form.temporada}
                onChangeText={(v) => set('temporada', v)}
                returnKeyType="done"
              />
            </View>
          </View>
        )}

        {/* PASO 2 — Configuración de juegos */}
        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Configuración de juegos</Text>
            <Text style={styles.sectionHint}>Estas son las reglas por defecto para todos los juegos de la liga. Se pueden cambiar por partido.</Text>

            <View style={styles.card}>
              <Stepper
                label="Innings por juego"
                value={form.innings}
                min={GAME_CONFIG_LIMITS.INNINGS_MIN}
                max={GAME_CONFIG_LIMITS.INNINGS_MAX}
                onChange={(v) => set('innings', v)}
              />
              <View style={styles.divider} />
              <Stepper
                label="Innings mínimos (oficial)"
                value={form.innings_minimos}
                min={3}
                max={form.innings}
                onChange={(v) => set('innings_minimos', v)}
              />
              <View style={styles.divider} />
              <Stepper
                label="Outs por entrada"
                value={form.outs_por_entrada}
                min={GAME_CONFIG_LIMITS.OUTS_MIN}
                max={GAME_CONFIG_LIMITS.OUTS_MAX}
                onChange={(v) => set('outs_por_entrada', v)}
              />
            </View>
          </View>
        )}

        {/* PASO 3 — Knockout / Misericordia */}
        {step === 3 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Knockout / Misericordia</Text>
            <Text style={styles.sectionHint}>El juego termina automáticamente si la diferencia de carreras supera el límite.</Text>

            <View style={styles.card}>
              <View style={stepStyles.row}>
                <Text style={stepStyles.label}>Activar knockout</Text>
                <Switch
                  value={form.knockout_activo}
                  onValueChange={(v) => set('knockout_activo', v)}
                  trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
                  thumbColor={COLORS.TEXT}
                />
              </View>
            </View>

            {form.knockout_activo && (
              <>
                {form.knockout_rules.map((rule, i) => (
                  <View key={i} style={[styles.card, styles.koCard]}>
                    <View style={styles.koCardHeader}>
                      <Text style={styles.koCardTitle}>Regla {i + 1}</Text>
                      {form.knockout_rules.length > 1 && (
                        <TouchableOpacity onPress={() => removeKoRule(i)}>
                          <Text style={styles.removeText}>Eliminar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Stepper
                      label="Diferencia de carreras"
                      value={rule.diferencia_carreras}
                      min={1}
                      max={50}
                      onChange={(v) => updateKoRule(i, 'diferencia_carreras', v)}
                    />
                    <View style={styles.divider} />
                    <Stepper
                      label="Desde la entrada #"
                      value={rule.desde_entrada}
                      min={1}
                      max={15}
                      onChange={(v) => updateKoRule(i, 'desde_entrada', v)}
                    />
                  </View>
                ))}

                <TouchableOpacity style={styles.addRuleBtn} onPress={addKoRule}>
                  <Text style={styles.addRuleText}>+ Añadir regla</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* PASO 4 — Opciones extra */}
        {step === 4 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Opciones extra</Text>

            <View style={styles.card}>
              <View style={[stepStyles.row, { paddingVertical: SPACING.MD }]}>
                <View style={{ flex: 1 }}>
                  <Text style={stepStyles.label}>Innings extra en empate</Text>
                  <Text style={styles.optionHint}>Si al terminar los innings el marcador está igualado</Text>
                </View>
                <Switch
                  trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
                  thumbColor={COLORS.TEXT}
                  value={true}
                />
              </View>
              <View style={styles.divider} />
              <View style={[stepStyles.row, { paddingVertical: SPACING.MD }]}>
                <View style={{ flex: 1 }}>
                  <Text style={stepStyles.label}>Estadísticas públicas</Text>
                  <Text style={styles.optionHint}>Cualquiera puede ver la tabla y stats sin login</Text>
                </View>
                <Switch
                  trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
                  thumbColor={COLORS.TEXT}
                  value={true}
                />
              </View>
            </View>

            {/* Resumen */}
            <View style={[styles.card, styles.summaryCard]}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <Text style={styles.summaryLine}>{form.nombre}</Text>
              <Text style={styles.summaryDetail}>Temporada {form.temporada}  ·  {form.innings} innings  ·  {form.outs_por_entrada} outs</Text>
              {form.knockout_activo && (
                <Text style={styles.summaryDetail}>KO activado · {form.knockout_rules.length} regla{form.knockout_rules.length !== 1 ? 's' : ''}</Text>
              )}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Footer con botón avanzar / crear */}
      <View style={styles.footer}>
        {step < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[styles.primaryBtn, !canAdvance() && styles.primaryBtnDisabled]}
            onPress={() => setStep(step + 1)}
            disabled={!canAdvance()}
          >
            <Text style={styles.primaryBtnText}>Continuar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, isPending && styles.primaryBtnDisabled]}
            onPress={handleCreate}
            disabled={isPending}
          >
            <Text style={styles.primaryBtnText}>{isPending ? 'Creando...' : 'Crear Liga'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.BG },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD },
  backText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  title:       { fontFamily: FONTS.DISPLAY, fontSize: 24, color: COLORS.TEXT, letterSpacing: 1 },
  stepIndicator: { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT3 },
  progressBar: { height: 2, backgroundColor: COLORS.BORDER, marginHorizontal: SPACING.LG },
  progressFill: { height: 2, backgroundColor: COLORS.PRIMARY },
  content:     { flex: 1 },
  contentPadding: { padding: SPACING.LG, paddingBottom: SPACING.XXL },
  formSection: { gap: SPACING.LG },
  sectionTitle: { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT, letterSpacing: 1 },
  sectionHint:  { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2, lineHeight: 18 },
  fieldGroup:   { gap: SPACING.XS },
  label:        { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 1 },
  input:        { backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.MD, color: COLORS.TEXT, fontFamily: FONTS.BODY, fontSize: 16 },
  inputHint:    { borderColor: COLORS.BORDER },
  card:         { backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.LG, paddingHorizontal: SPACING.MD },
  koCard:       { paddingTop: SPACING.SM },
  koCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: SPACING.XS },
  koCardTitle:  { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 0.5 },
  removeText:   { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.DANGER },
  divider:      { height: 1, backgroundColor: COLORS.BORDER, marginVertical: 0 },
  addRuleBtn:   { borderWidth: 1, borderColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center', borderStyle: 'dashed' },
  addRuleText:  { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.PRIMARY },
  optionHint:   { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3, marginTop: 2 },
  summaryCard:  { marginTop: SPACING.MD },
  summaryTitle: { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT3, textTransform: 'uppercase', letterSpacing: 1, paddingTop: SPACING.MD, paddingHorizontal: 0 },
  summaryLine:  { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT, letterSpacing: 1, paddingBottom: SPACING.XS },
  summaryDetail: { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2, paddingBottom: SPACING.XS },
  footer:       { padding: SPACING.LG, paddingBottom: SPACING.XL, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  primaryBtn:   { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT, letterSpacing: 1 },
})
