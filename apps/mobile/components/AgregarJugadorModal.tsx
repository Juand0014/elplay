import { useState }                    from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native'
import { COLORS, FONTS, SPACING, RADIUS, Posicion } from '@elplay/shared/types'
import { useAddJugador }                            from '../hooks/use-roster'

const POSICIONES: { value: Posicion; label: string }[] = [
  { value: Posicion.Pitcher,         label: 'Pitcher (P)' },
  { value: Posicion.Catcher,         label: 'Catcher (C)' },
  { value: Posicion.PrimeraBse,      label: 'Primera Base (1B)' },
  { value: Posicion.SegundaBase,     label: 'Segunda Base (2B)' },
  { value: Posicion.TerceraBase,     label: 'Tercera Base (3B)' },
  { value: Posicion.CortoCampo,      label: 'Shortstop (SS)' },
  { value: Posicion.JardineroIzq,    label: 'Jardín Izquierdo (LF)' },
  { value: Posicion.JardineroCenter, label: 'Jardín Central (CF)' },
  { value: Posicion.JardineroRight,  label: 'Jardín Derecho (RF)' },
  { value: Posicion.BateadorDesig,   label: 'Bateador Designado (DH)' },
]

interface Props {
  equipoId: string
  onClose:  () => void
}

export function AgregarJugadorModal({ equipoId, onClose }: Props) {
  const [nombre, setNombre]     = useState('')
  const [numero, setNumero]     = useState('')
  const [posicion, setPosicion] = useState<Posicion>(Posicion.BateadorDesig)

  const { mutateAsync, isPending } = useAddJugador()

  const canSave = nombre.trim().length >= 2 && numero.trim().length >= 1

  const handleSave = async () => {
    const num = parseInt(numero, 10)
    if (isNaN(num) || num < 0 || num > 99) {
      Alert.alert('Error', 'El número debe estar entre 0 y 99')
      return
    }

    try {
      await mutateAsync({
        equipo_id: equipoId,
        nombre:    nombre.trim(),
        numero:    num,
        posicion,
      })
      onClose()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo agregar el jugador')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Jugador</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave || isPending}
        >
          <Text style={[styles.saveText, (!canSave || isPending) && styles.saveTextDisabled]}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPad} keyboardShouldPersistTaps="handled">

        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del jugador"
            placeholderTextColor={COLORS.TEXT3}
            value={nombre}
            onChangeText={setNombre}
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* Número */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Número de camiseta (0–99) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 24"
            placeholderTextColor={COLORS.TEXT3}
            value={numero}
            onChangeText={setNumero}
            keyboardType="number-pad"
            maxLength={2}
            returnKeyType="done"
          />
        </View>

        {/* Posición */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Posición</Text>
          <View style={styles.posGrid}>
            {POSICIONES.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.posChip, posicion === p.value && styles.posChipSelected]}
                onPress={() => setPosicion(p.value)}
              >
                <Text style={[styles.posChipText, posicion === p.value && styles.posChipTextSelected]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.BG },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.LG, paddingBottom: SPACING.MD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  cancelText:   { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 15 },
  title:        { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT },
  saveText:     { fontFamily: FONTS.BOLD, color: COLORS.PRIMARY, fontSize: 15 },
  saveTextDisabled: { color: COLORS.TEXT3 },
  content:      { flex: 1 },
  contentPad:   { padding: SPACING.LG, gap: SPACING.LG, paddingBottom: SPACING.XXL },
  fieldGroup:   { gap: SPACING.XS },
  label:        { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 1 },
  input:        { backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.MD, color: COLORS.TEXT, fontFamily: FONTS.BODY, fontSize: 16 },
  posGrid:      { gap: SPACING.SM },
  posChip:      { paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM, borderRadius: RADIUS.SM, backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER },
  posChipSelected: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
  posChipText:  { fontFamily: FONTS.BODY, fontSize: 14, color: COLORS.TEXT2 },
  posChipTextSelected: { color: COLORS.TEXT, fontFamily: FONTS.BOLD },
})
