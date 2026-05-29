import { useState }                    from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, Alert,
} from 'react-native'
import { COLORS, FONTS, SPACING, RADIUS, VisibilidadApunte, CategoriaApunte } from '@elplay/shared/types'
import { useApuntes, useCreateApunte, useDeleteApunte } from '../../hooks/use-apuntes'
import { useRequireAuth }               from '../../hooks/use-require-auth'
import type { Apunte }                  from '../../hooks/use-apuntes'

const CATEGORIA_LABELS: Record<CategoriaApunte, string> = {
  [CategoriaApunte.Partido]:  'Partido',
  [CategoriaApunte.Tactica]:  'Tactica',
  [CategoriaApunte.Jugador]:  'Jugador',
  [CategoriaApunte.Resumen]:  'Resumen',
  [CategoriaApunte.General]:  'General',
}

const CATEGORIA_COLORS: Record<CategoriaApunte, string> = {
  [CategoriaApunte.Partido]:  COLORS.PRIMARY,
  [CategoriaApunte.Tactica]:  COLORS.INFO,
  [CategoriaApunte.Jugador]:  COLORS.SUCCESS,
  [CategoriaApunte.Resumen]:  COLORS.PURPLE,
  [CategoriaApunte.General]:  COLORS.TEXT3,
}

export default function ApuntesScreen() {
  useRequireAuth()

  const { data: apuntes = [], isLoading } = useApuntes()
  const { mutateAsync: crear, isPending } = useCreateApunte()
  const { mutateAsync: eliminar }         = useDeleteApunte()

  const [showModal, setShowModal]   = useState(false)
  const [titulo, setTitulo]         = useState('')
  const [contenido, setContenido]   = useState('')
  const [categoria, setCategoria]   = useState<CategoriaApunte>(CategoriaApunte.General)
  const [visibilidad]               = useState<VisibilidadApunte>(VisibilidadApunte.Privado)

  const resetForm = () => {
    setTitulo('')
    setContenido('')
    setCategoria(CategoriaApunte.General)
  }

  const handleCrear = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El titulo es requerido')
      return
    }
    try {
      await crear({ titulo: titulo.trim(), contenido: contenido.trim(), visibilidad, categoria })
      resetForm()
      setShowModal(false)
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error creando apunte')
    }
  }

  const handleEliminar = (apunte: Apunte) => {
    Alert.alert('Eliminar apunte', `¿Eliminar "${apunte.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminar(apunte.id)
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Error eliminando')
          }
        },
      },
    ])
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Apuntes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.pad}>
        {apuntes.length === 0 && !isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin apuntes aun</Text>
            <Text style={styles.emptyText}>Registra notas tactices, observaciones de jugadores y mas.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>Crear primer apunte</Text>
            </TouchableOpacity>
          </View>
        ) : (
          apuntes.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.card}
              onLongPress={() => handleEliminar(a)}
            >
              <View style={styles.cardTop}>
                <View style={[styles.categoriaBadge, { backgroundColor: `${CATEGORIA_COLORS[a.categoria]}22`, borderColor: CATEGORIA_COLORS[a.categoria] }]}>
                  <Text style={[styles.categoriaText, { color: CATEGORIA_COLORS[a.categoria] }]}>
                    {CATEGORIA_LABELS[a.categoria]}
                  </Text>
                </View>
                <Text style={styles.tiempo}>
                  {timeAgo(a.created_at)}
                </Text>
              </View>
              <Text style={styles.cardTitulo}>{a.titulo}</Text>
              {a.contenido.length > 0 && (
                <Text style={styles.cardContenido} numberOfLines={2}>{a.contenido}</Text>
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: SPACING.XXL }} />
      </ScrollView>

      {/* Modal Crear Apunte */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { resetForm(); setShowModal(false) }}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo Apunte</Text>
            <TouchableOpacity
              onPress={handleCrear}
              disabled={!titulo.trim() || isPending}
            >
              <Text style={[styles.saveText, (!titulo.trim() || isPending) && styles.saveTextDis]}>
                {isPending ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalPad} keyboardShouldPersistTaps="handled">
            {/* Categoria */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriaRow}>
                {Object.values(CategoriaApunte).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoriaChip, categoria === cat && { backgroundColor: CATEGORIA_COLORS[cat], borderColor: CATEGORIA_COLORS[cat] }]}
                    onPress={() => setCategoria(cat)}
                  >
                    <Text style={[styles.categoriaChipText, categoria === cat && styles.categoriaChipTextSel]}>
                      {CATEGORIA_LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Titulo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Titulo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Bateador zurdo en 3ra posicion"
                placeholderTextColor={COLORS.TEXT3}
                value={titulo}
                onChangeText={setTitulo}
                autoFocus
                returnKeyType="next"
              />
            </View>

            {/* Contenido */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Notas (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Detalles, observaciones, estrategias..."
                placeholderTextColor={COLORS.TEXT3}
                value={contenido}
                onChangeText={setContenido}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m`
  const hrs   = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days  = Math.floor(hrs / 24)
  return `${days}d`
}

const styles = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: COLORS.BG },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD },
  title:      { fontFamily: FONTS.DISPLAY, fontSize: 36, color: COLORS.TEXT, letterSpacing: 2 },
  addBtn:     { width: 40, height: 40, borderRadius: RADIUS.FULL, backgroundColor: COLORS.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontFamily: FONTS.BOLD, fontSize: 24, color: COLORS.TEXT, lineHeight: 28 },
  content:    { flex: 1 },
  pad:        { padding: SPACING.LG, gap: SPACING.SM },
  empty:      { padding: SPACING.XL, alignItems: 'center', gap: SPACING.MD, marginTop: SPACING.XL },
  emptyTitle: { fontFamily: FONTS.BOLD, fontSize: 18, color: COLORS.TEXT2 },
  emptyText:  { fontFamily: FONTS.BODY, fontSize: 14, color: COLORS.TEXT3, textAlign: 'center', lineHeight: 20 },
  emptyBtn:   { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, paddingHorizontal: SPACING.LG, paddingVertical: SPACING.SM },
  emptyBtnText: { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  card:       { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.XS },
  cardTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoriaBadge: { paddingHorizontal: SPACING.SM, paddingVertical: 3, borderRadius: RADIUS.FULL, borderWidth: 1 },
  categoriaText:  { fontFamily: FONTS.BOLD, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  tiempo:     { fontFamily: FONTS.BODY, fontSize: 11, color: COLORS.TEXT3 },
  cardTitulo: { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
  cardContenido: { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2, lineHeight: 18 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.BG },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.LG, paddingBottom: SPACING.MD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  cancelText:     { fontFamily: FONTS.BODY, color: COLORS.TEXT2, fontSize: 15 },
  modalTitle:     { fontFamily: FONTS.BOLD, fontSize: 16, color: COLORS.TEXT },
  saveText:       { fontFamily: FONTS.BOLD, color: COLORS.PRIMARY, fontSize: 15 },
  saveTextDis:    { color: COLORS.TEXT3 },
  modalContent:   { flex: 1 },
  modalPad:       { padding: SPACING.LG, gap: SPACING.LG, paddingBottom: SPACING.XXL },
  fieldGroup:     { gap: SPACING.XS },
  fieldLabel:     { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 1 },
  input:          { backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.MD, color: COLORS.TEXT, fontFamily: FONTS.BODY, fontSize: 16 },
  inputMultiline: { height: 120, paddingTop: SPACING.MD },
  categoriaRow:   { gap: SPACING.SM, paddingVertical: 4 },
  categoriaChip:  { paddingHorizontal: SPACING.MD, paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL, borderWidth: 1, borderColor: COLORS.BORDER, backgroundColor: COLORS.SURFACE },
  categoriaChipText: { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2 },
  categoriaChipTextSel: { color: COLORS.TEXT },
})
