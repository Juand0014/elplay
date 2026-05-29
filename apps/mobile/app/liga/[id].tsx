import { useState }                          from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useLocalSearchParams, router }       from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS }     from '@elplay/shared/types'
import { useLiga }                            from '../../hooks/use-ligas'
import { useEquipos }                         from '../../hooks/use-equipos'
import { usePartidosLiga }                    from '../../hooks/use-partidos'
import { useTablaPosticiones }                from '../../hooks/use-tabla-posiciones'
import { useRequireAuth }                     from '../../hooks/use-require-auth'
import { useAuthStore }                       from '../../store/auth.store'

type TabId = 'equipos' | 'partidos' | 'tabla'

export default function LigaDetailScreen() {
  useRequireAuth()

  const { id } = useLocalSearchParams<{ id: string }>()
  const [tab, setTab] = useState<TabId>('equipos')

  const userId = useAuthStore((s) => s.user?.id)

  const { data: liga, isLoading, refetch, isRefetching } = useLiga(id ?? '')
  const { data: equipos = [] }  = useEquipos(id ?? '')
  const { data: partidos = [] } = usePartidosLiga(id ?? '')
  const { data: tabla = [] }    = useTablaPosticiones(id ?? '')

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.PRIMARY} />
      </View>
    )
  }

  if (!liga) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Liga no encontrada</Text>
      </View>
    )
  }

  const isComisionado = liga.comisionado_id === userId

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.ligaNombre}>{liga.nombre}</Text>
          <Text style={styles.temporada}>Temporada {liga.temporada}</Text>
        </View>
        {isComisionado && (
          <TouchableOpacity onPress={() => router.push(`/liga/${id}/editar`)}>
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats rápidas */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{liga.equipos_count}</Text>
          <Text style={styles.statLabel}>Equipos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{liga.innings}</Text>
          <Text style={styles.statLabel}>Innings</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{liga.outs_por_entrada}</Text>
          <Text style={styles.statLabel}>Outs</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsBar}>
        {(['equipos', 'partidos', 'tabla'] as TabId[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'equipos' ? 'Equipos' : t === 'partidos' ? 'Partidos' : 'Tabla'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.PRIMARY} />}
      >
        {/* Tab Equipos */}
        {tab === 'equipos' && (
          <View style={styles.section}>
            {equipos.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No hay equipos aún</Text>
              </View>
            ) : (
              equipos.map((eq) => (
                <TouchableOpacity
                  key={eq.id}
                  style={styles.card}
                  onPress={() => router.push(`/equipo/${eq.id}`)}
                >
                  <View style={[styles.teamBadge, { backgroundColor: eq.color_primario }]}>
                    <Text style={styles.teamInitials}>
                      {eq.abreviatura}
                    </Text>
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{eq.nombre}</Text>
                    <Text style={styles.teamRecord}>{eq.jugadores_count ?? 0} jugadores</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            )}

            {(isComisionado) && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push(`/equipo/crear?ligaId=${id}`)}
              >
                <Text style={styles.addBtnText}>+ Agregar Equipo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab Partidos */}
        {tab === 'partidos' && (
          <View style={styles.section}>
            {partidos.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No hay partidos programados</Text>
              </View>
            ) : (
              partidos.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.card}
                  onPress={() => router.push(`/partido/${p.id}`)}
                >
                  <View style={styles.partidoInfo}>
                    <Text style={styles.partidoEquipos}>
                      {p.equipo_local_nombre} vs {p.equipo_visitante_nombre}
                    </Text>
                    <Text style={styles.partidoFecha}>
                      {new Date(p.fecha).toLocaleDateString('es-DO', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[styles.estadoBadge, { backgroundColor: estadoColor(p.estado) }]}>
                    <Text style={styles.estadoText}>{estadoLabel(p.estado)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {isComisionado && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push(`/partido/crear?ligaId=${id}`)}
              >
                <Text style={styles.addBtnText}>+ Crear Partido</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab Tabla */}
        {tab === 'tabla' && (
          <View style={styles.section}>
            {tabla.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Sin juegos oficiales aún</Text>
              </View>
            ) : (
              <>
                {/* Header de la tabla */}
                <View style={styles.tablaHeader}>
                  <Text style={[styles.tablaCell, { flex: 3 }]}>Equipo</Text>
                  <Text style={styles.tablaCell}>J</Text>
                  <Text style={styles.tablaCell}>G</Text>
                  <Text style={styles.tablaCell}>P</Text>
                  <Text style={styles.tablaCell}>PCT</Text>
                </View>
                {tabla.map((row, i) => (
                  <TouchableOpacity
                    key={row.equipo_id}
                    style={[styles.tablaRow, i < 2 && styles.tablaRowTop]}
                    onPress={() => router.push(`/equipo/${row.equipo_id}`)}
                  >
                    <Text style={[styles.tablaRank, i < 2 && styles.tablaRankTop]}>{i + 1}</Text>
                    <Text style={[styles.tablaNombre, { flex: 2 }]}>{row.nombre}</Text>
                    <Text style={styles.tablaCell}>{row.j}</Text>
                    <Text style={styles.tablaCell}>{row.g}</Text>
                    <Text style={styles.tablaCell}>{row.p}</Text>
                    <Text style={[styles.tablaCell, styles.tablaPct]}>{row.pct.toFixed(3)}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.verMasBtn}
                  onPress={() => router.push(`/liga/${id}/posiciones`)}
                >
                  <Text style={styles.verMasText}>Ver tabla completa →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={{ height: SPACING.XXL }} />
      </ScrollView>
    </View>
  )
}

function estadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    pending: 'Próximo',
    live:    'EN VIVO',
    done:    'Final',
    ko:      'KO',
  }
  return labels[estado] ?? estado
}

function estadoColor(estado: string): string {
  const colors: Record<string, string> = {
    pending: COLORS.SURFACE2,
    live:    COLORS.DANGER,
    done:    COLORS.SURFACE2,
    ko:      COLORS.WARNING,
  }
  return colors[estado] ?? COLORS.SURFACE2
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.BG },
  center:       { flex: 1, backgroundColor: COLORS.BG, alignItems: 'center', justifyContent: 'center' },
  errorText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 16 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD },
  backText:     { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT2, paddingRight: SPACING.SM },
  headerInfo:   { flex: 1 },
  ligaNombre:   { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.TEXT, letterSpacing: 1 },
  temporada:    { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  editText:     { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.PRIMARY },
  statsRow:     { flexDirection: 'row', paddingHorizontal: SPACING.LG, gap: SPACING.SM, marginBottom: SPACING.MD },
  statBox:      { flex: 1, backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.SM, alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  statValue:    { fontFamily: FONTS.DISPLAY, fontSize: 28, color: COLORS.PRIMARY },
  statLabel:    { fontFamily: FONTS.BODY, fontSize: 11, color: COLORS.TEXT3, textTransform: 'uppercase' },
  tabsBar:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, marginHorizontal: SPACING.LG },
  tabBtn:       { flex: 1, paddingVertical: SPACING.SM, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.PRIMARY },
  tabText:      { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.TEXT3, textTransform: 'uppercase', letterSpacing: 0.5 },
  tabTextActive: { color: COLORS.PRIMARY },
  content:      { flex: 1 },
  section:      { padding: SPACING.LG, gap: SPACING.SM },
  empty:        { padding: SPACING.XL, alignItems: 'center' },
  emptyText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 14 },
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.MD },
  teamBadge:    { width: 44, height: 44, borderRadius: RADIUS.MD, alignItems: 'center', justifyContent: 'center' },
  teamInitials: { fontFamily: FONTS.DISPLAY, fontSize: 16, color: COLORS.TEXT },
  teamInfo:     { flex: 1 },
  teamName:     { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
  teamRecord:   { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  chevron:      { fontFamily: FONTS.BODY, fontSize: 20, color: COLORS.TEXT3 },
  addBtn:       { borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, padding: SPACING.MD, alignItems: 'center', borderStyle: 'dashed', marginTop: SPACING.SM },
  addBtnText:   { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT2 },
  partidoInfo:  { flex: 1 },
  partidoEquipos: { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  partidoFecha: { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3, marginTop: 2 },
  estadoBadge:  { paddingHorizontal: SPACING.SM, paddingVertical: 4, borderRadius: RADIUS.SM },
  estadoText:   { fontFamily: FONTS.BOLD, fontSize: 10, color: COLORS.TEXT, textTransform: 'uppercase' },
  tablaHeader:  { flexDirection: 'row', paddingHorizontal: SPACING.SM, paddingVertical: SPACING.XS, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  tablaRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.SM, paddingVertical: SPACING.MD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  tablaRowTop:  { },
  tablaRank:    { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT3, width: 24 },
  tablaRankTop: { color: COLORS.PRIMARY, fontFamily: FONTS.BOLD },
  tablaNombre:  { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  tablaCell:    { fontFamily: FONTS.BODY, fontSize: 13, color: COLORS.TEXT2, width: 36, textAlign: 'center' },
  tablaPct:     { color: COLORS.PRIMARY, fontFamily: FONTS.BOLD },
  verMasBtn:    { padding: SPACING.MD, alignItems: 'center' },
  verMasText:   { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.PRIMARY },
})
