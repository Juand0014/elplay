import { useState }                    from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS } from '@elplay/shared/types'
import { useCreateEquipo }              from '../../hooks/use-equipos'
import { useRequireAuth }               from '../../hooks/use-require-auth'

const PRESET_COLORS = [
  '#ff4d00', '#ff8c00', '#f59e0b', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
  '#06b6d4', '#10b981', '#a16207', '#64748b',
]

export default function CrearEquipoScreen() {
  useRequireAuth()
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>()
  const { mutateAsync, isPending } = useCreateEquipo()

  const [nombre, setNombre]           = useState('')
  const [abreviatura, setAbreviatura] = useState('')
  const [color, setColor]             = useState<string>(COLORS.PRIMARY)

  // Auto-generar abreviatura de las primeras 3 letras del nombre
  const handleNombreChange = (v: string) => {
    setNombre(v)
    if (!abreviatura || abreviatura === nombre.slice(0, 3).toUpperCase()) {
      setAbreviatura(v.slice(0, 3).toUpperCase())
    }
  }

  const canCreate = nombre.trim().length >= 2 && abreviatura.trim().length >= 2

  const handleCreate = async () => {
    if (!ligaId) {
      Alert.alert('Error', 'No se especificó la liga')
      return
    }

    try {
      const equipo = await mutateAsync({
        liga_id:      ligaId,
        nombre:       nombre.trim(),
        abreviatura:  abreviatura.trim().toUpperCase().slice(0, 4),
        color_primario: color,
      })
      router.replace(`/equipo/${equipo.id}`)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear el equipo')
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Equipo</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPad} keyboardShouldPersistTaps="handled">

        {/* Preview del badge */}
        <View style={styles.previewSection}>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{abreviatura || '???'}</Text>
          </View>
          <Text style={styles.previewNombre}>{nombre || 'Nombre del equipo'}</Text>
        </View>

        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre del equipo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Tigres del Norte"
            placeholderTextColor={COLORS.TEXT3}
            value={nombre}
            onChangeText={handleNombreChange}
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* Abreviatura */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Abreviatura (2-4 letras)</Text>
          <TextInput
            style={styles.input}
            placeholder="TIG"
            placeholderTextColor={COLORS.TEXT3}
            value={abreviatura}
            onChangeText={(v) => setAbreviatura(v.toUpperCase().slice(0, 4))}
            autoCapitalize="characters"
            maxLength={4}
            returnKeyType="done"
          />
        </View>

        {/* Color picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Color del equipo</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorSwatch, { backgroundColor: c }, color === c && styles.colorSwatchSelected]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, (!canCreate || isPending) && styles.primaryBtnDisabled]}
          onPress={handleCreate}
          disabled={!canCreate || isPending}
        >
          <Text style={styles.primaryBtnText}>{isPending ? 'Creando...' : 'Crear Equipo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: COLORS.BG },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD },
  backText:       { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 14 },
  title:          { fontFamily: FONTS.DISPLAY, fontSize: 24, color: COLORS.TEXT, letterSpacing: 1 },
  content:        { flex: 1 },
  contentPad:     { padding: SPACING.LG, gap: SPACING.LG, paddingBottom: SPACING.XXL },
  previewSection: { alignItems: 'center', paddingVertical: SPACING.LG, gap: SPACING.MD },
  badge:          { width: 80, height: 80, borderRadius: RADIUS.LG, alignItems: 'center', justifyContent: 'center' },
  badgeText:      { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT, letterSpacing: 2 },
  previewNombre:  { fontFamily: FONTS.BOLD, fontSize: 18, color: COLORS.TEXT },
  fieldGroup:     { gap: SPACING.XS },
  label:          { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 1 },
  input:          { backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.MD, color: COLORS.TEXT, fontFamily: FONTS.BODY, fontSize: 16 },
  colorGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.SM },
  colorSwatch:    { width: 44, height: 44, borderRadius: RADIUS.MD },
  colorSwatchSelected: { borderWidth: 3, borderColor: COLORS.TEXT },
  footer:         { padding: SPACING.LG, paddingBottom: SPACING.XL, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  primaryBtn:     { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT, letterSpacing: 1 },
})
