import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { router }                        from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS } from '@elplay/shared/types'
import { useAuth }                       from '../../hooks/use-auth'
import { useRequireAuth }                from '../../hooks/use-require-auth'
import { usePartidosEnVivo }             from '../../hooks/use-partidos'
import { useLigas }                      from '../../hooks/use-ligas'
import type { PartidoResumen }           from '../../hooks/use-partidos'

export default function HomeScreen() {
  useRequireAuth()

  const { user }                                          = useAuth()
  const nombre                                            = (user?.user_metadata?.['nombre'] as string | undefined) ?? 'jugador'
  const { data: liveGames = [], isLoading: loadingLive, refetch: refetchLive } = usePartidosEnVivo()
  const { data: ligas = [],    isLoading: loadingLigas, refetch: refetchLigas } = useLigas()

  const isLoading = loadingLive || loadingLigas

  const handleRefresh = () => {
    void refetchLive()
    void refetchLigas()
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={COLORS.PRIMARY} />}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.logo}>ElPlay</Text>
        <Text style={styles.greeting}>Buenas, {nombre}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.PRIMARY} />
        </View>
      ) : (
        <>
          {/* Sección: En Vivo */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.sectionTitle}>En Vivo</Text>
              </View>
              {liveGames.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/live')}>
                  <Text style={styles.verTodo}>Ver todo →</Text>
                </TouchableOpacity>
              )}
            </View>

            {liveGames.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Sin partidos activos</Text>
              </View>
            ) : (
              liveGames.slice(0, 3).map((p) => (
                <LiveCard key={p.id} partido={p} />
              ))
            )}
          </View>

          {/* Sección: Mis Ligas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Ligas</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/ligas')}>
                <Text style={styles.verTodo}>Ver todo →</Text>
              </TouchableOpacity>
            </View>

            {ligas.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No perteneces a ninguna liga</Text>
                <TouchableOpacity onPress={() => router.push('/liga/crear')}>
                  <Text style={styles.cta}>Crear liga →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              ligas.slice(0, 3).map((liga) => (
                <TouchableOpacity
                  key={liga.id}
                  style={styles.ligaRow}
                  onPress={() => router.push(`/liga/${liga.id}`)}
                >
                  <View style={styles.ligaBadge}>
                    <Text style={styles.ligaBadgeText}>{liga.nombre.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.ligaInfo}>
                    <Text style={styles.ligaNombre} numberOfLines={1}>{liga.nombre}</Text>
                    <Text style={styles.ligaMeta}>Temporada {liga.temporada}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Acceso rápido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceso rápido</Text>
            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/liga/crear')}>
                <Text style={styles.quickIcon}>🏆</Text>
                <Text style={styles.quickLabel}>Nueva Liga</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(tabs)/apuntes')}>
                <Text style={styles.quickIcon}>📝</Text>
                <Text style={styles.quickLabel}>Apuntes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(tabs)/live')}>
                <Text style={styles.quickIcon}>📡</Text>
                <Text style={styles.quickLabel}>En Vivo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <View style={{ height: SPACING.XXL }} />
    </ScrollView>
  )
}

// ── Componente: tarjeta de partido en vivo ─────────────────────

function LiveCard({ partido: p }: { partido: PartidoResumen }) {
  return (
    <TouchableOpacity style={styles.liveCard} onPress={() => router.push(`/publico/${p.id}`)}>
      <View style={styles.liveCardHeader}>
        <View style={styles.livePill}>
          <Text style={styles.livePillText}>VIVO</Text>
        </View>
        <Text style={styles.liveEntrada}>
          {p.media_entrada_actual === 'top' ? '▲' : '▼'} {p.entrada_actual}a
        </Text>
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.teamName} numberOfLines={1}>{p.equipo_local_nombre}</Text>
        <Text style={styles.scoreNum}>{p.carreras_local}</Text>
        <Text style={styles.scoreDash}>-</Text>
        <Text style={styles.scoreNum}>{p.carreras_visitante}</Text>
        <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>{p.equipo_visitante_nombre}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.BG },
  content:      { padding: SPACING.LG, paddingTop: SPACING.XL },
  header:       { marginBottom: SPACING.XL },
  logo:         { fontFamily: FONTS.DISPLAY, fontSize: 48, color: COLORS.PRIMARY, letterSpacing: 3 },
  greeting:     { fontFamily: FONTS.BODY, fontSize: 16, color: COLORS.TEXT2, marginTop: SPACING.XS },
  loadingBox:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: SPACING.XXL },
  section:      { marginBottom: SPACING.XL },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.MD },
  liveIndicator:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.XS },
  liveDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.DANGER },
  sectionTitle: { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 1 },
  verTodo:      { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.PRIMARY },
  emptyBox:     { borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, borderStyle: 'dashed', padding: SPACING.LG, alignItems: 'center', gap: SPACING.SM },
  emptyText:    { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 14 },
  cta:          { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.PRIMARY },
  // Live card
  liveCard:     { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.SM, marginBottom: SPACING.SM },
  liveCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  livePill:     { backgroundColor: COLORS.DANGER, borderRadius: RADIUS.FULL, paddingHorizontal: SPACING.SM, paddingVertical: 2 },
  livePillText: { fontFamily: FONTS.BOLD, fontSize: 9, color: COLORS.TEXT, letterSpacing: 1 },
  liveEntrada:  { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.PRIMARY },
  scoreRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  teamName:     { flex: 1, fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2 },
  scoreNum:     { fontFamily: FONTS.DISPLAY, fontSize: 34, color: COLORS.TEXT },
  scoreDash:    { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT3 },
  // Ligas
  ligaRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.MD, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.MD, marginBottom: SPACING.SM },
  ligaBadge:    { width: 40, height: 40, borderRadius: RADIUS.MD, backgroundColor: COLORS.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  ligaBadgeText:{ fontFamily: FONTS.DISPLAY, fontSize: 14, color: COLORS.TEXT },
  ligaInfo:     { flex: 1 },
  ligaNombre:   { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  ligaMeta:     { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3, marginTop: 2 },
  chevron:      { fontFamily: FONTS.BODY, fontSize: 20, color: COLORS.TEXT3 },
  // Acceso rápido
  quickRow:     { flexDirection: 'row', gap: SPACING.SM },
  quickBtn:     { flex: 1, backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.MD, alignItems: 'center', gap: SPACING.SM, borderWidth: 1, borderColor: COLORS.BORDER },
  quickIcon:    { fontSize: 24 },
  quickLabel:   { fontFamily: FONTS.BOLD, fontSize: 11, color: COLORS.TEXT2, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
})
