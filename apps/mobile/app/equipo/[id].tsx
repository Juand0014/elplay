import { useState }                    from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
  Modal,
} from 'react-native'
import { useLocalSearchParams, router }   from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS, Posicion } from '@elplay/shared/types'
import { useEquipo }                      from '../../hooks/use-equipos'
import { useRoster, useDesactivarJugador } from '../../hooks/use-roster'
import { useRequireAuth }                 from '../../hooks/use-require-auth'
import { useAuthStore }                   from '../../store/auth.store'
import { AgregarJugadorModal }            from '../../components/AgregarJugadorModal'

type TabId = 'roster' | 'juegos'

const POSICION_LABELS: Record<Posicion, string> = {
  [Posicion.Pitcher]:         'P',
  [Posicion.Catcher]:         'C',
  [Posicion.PrimeraBase]:     '1B',
  [Posicion.SegundaBase]:     '2B',
  [Posicion.TerceraBase]:     '3B',
  [Posicion.CortoCampo]:      'SS',
  [Posicion.JardineroIzq]:    'LF',
  [Posicion.JardineroCenter]: 'CF',
  [Posicion.JardineroRight]:  'RF',
  [Posicion.BateadorDesig]:   'DH',
}

export default function EquipoDetailScreen() {
  useRequireAuth()

  const { id } = useLocalSearchParams<{ id: string }>()
  const [tab, setTab]                   = useState<TabId>('roster')
  const [showAddModal, setShowAddModal] = useState(false)

  const userId = useAuthStore((s) => s.user?.id)
  const { data: equipo, isLoading, refetch, isRefetching } = useEquipo(id ?? '')
  const { data: roster = [] }                              = useRoster(id ?? '')
  const { mutateAsync: desactivar }                        = useDesactivarJugador()

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.PRIMARY} />
      </View>
    )
  }

  if (!equipo) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Equipo no encontrado</Text>
      </View>
    )
  }

  const isDueno = equipo.dueno_id === userId

  const handleDesactivar = (jugadorId: string, nombre: string) => {
    Alert.alert(
      'Desactivar jugador',
      `¿Desactivar a ${nombre}? Se mantiene en historial pero no aparece en el roster activo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar', style: 'destructive',
          onPress: async () => {
            try {
              await desactivar({ id: jugadorId, equipoId: id ?? '' })
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Error desactivando')
            }
          },
        },
      ]
    )
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={[styles.badge, { backgroundColor: equipo.color_primario }]}>
          <Text style={styles.badgeText}>{equipo.abreviatura}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.equipoNombre}>{equipo.nombre}</Text>
          <Text style={styles.equipoSub}>{equipo.jugadores_count} jugadores activos</Text>
        </View>
        {isDueno && (
          <TouchableOpacity onPress={() => router.push(`/equipo/${id}/editar`)}>
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsBar}>
        {(['roster', 'juegos'] as TabId[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'roster' ? 'Roster' : 'Juegos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.PRIMARY} />}
      >
        {/* Tab Roster */}
        {tab === 'roster' && (
          <View style={styles.section}>
            {roster.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>El roster está vacío</Text>
                {isDueno && <Text style={styles.emptyHint}>Toca "+" para agregar el primer jugador</Text>}
              </View>
            ) : (
              roster.map((jugador) => (
                <TouchableOpacity
                  key={jugador.id}
                  style={styles.playerCard}
                  onLongPress={() => isDueno && handleDesactivar(jugador.id, jugador.nombre)}
                >
                  <View style={[styles.numero, { backgroundColor: equipo.color_primario }]}>
                    <Text style={styles.numeroText}>#{jugador.numero}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{jugador.nombre}</Text>
                    <Text style={styles.playerPos}>{POSICION_LABELS[jugador.posicion] ?? jugador.posicion}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {isDueno && (
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addBtnText}>+ Agregar Jugador</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab Juegos — muestra juegos del equipo */}
        {tab === 'juegos' && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Historial disponible en Fase 2</Text>
          </View>
        )}

        <View style={{ height: SPACING.XXL }} />
      </ScrollView>

      {/* Modal agregar jugador */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <AgregarJugadorModal
          equipoId={id ?? ''}
          onClose={() => setShowAddModal(false)}
        />
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.BG },
  center:       { flex: 1, backgroundColor: COLORS.BG, alignItems: 'center', justifyContent: 'center' },
  errorText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 16 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD },
  backText:     { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT2 },
  badge:        { width: 48, height: 48, borderRadius: RADIUS.MD, alignItems: 'center', justifyContent: 'center' },
  badgeText:    { fontFamily: FONTS.DISPLAY, fontSize: 16, color: COLORS.TEXT, letterSpacing: 1 },
  headerInfo:   { flex: 1 },
  equipoNombre: { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT, letterSpacing: 1 },
  equipoSub:    { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  editText:     { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.PRIMARY },
  tabsBar:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, marginHorizontal: SPACING.LG },
  tabBtn:       { flex: 1, paddingVertical: SPACING.SM, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.PRIMARY },
  tabText:      { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.TEXT3, textTransform: 'uppercase', letterSpacing: 0.5 },
  tabTextActive:{ color: COLORS.PRIMARY },
  content:      { flex: 1 },
  section:      { padding: SPACING.LG, gap: SPACING.SM },
  empty:        { padding: SPACING.XL, alignItems: 'center', gap: SPACING.SM },
  emptyText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 14 },
  emptyHint:    { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 12 },
  playerCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.MD },
  numero:       { width: 48, height: 48, borderRadius: RADIUS.SM, alignItems: 'center', justifyContent: 'center' },
  numeroText:   { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  playerInfo:   { flex: 1 },
  playerName:   { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
  playerPos:    { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  addBtn:       { borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center', borderStyle: 'dashed', marginTop: SPACING.SM },
  addBtnText:   { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT2 },
})
