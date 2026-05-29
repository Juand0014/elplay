import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { router }                        from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS } from '@elplay/shared/types'
import { useLigas }                      from '../../hooks/use-ligas'
import { useRequireAuth }                from '../../hooks/use-require-auth'

export default function LigasScreen() {
  useRequireAuth()

  const { data: ligas = [], isLoading, refetch, isRefetching } = useLigas()

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Ligas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/liga/crear')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.PRIMARY} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.pad}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.PRIMARY} />}
        >
          {ligas.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sin ligas aún</Text>
              <Text style={styles.emptyText}>Crea tu primera liga o pide al comisionado que te agregue.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/liga/crear')}>
                <Text style={styles.emptyBtnText}>Crear liga</Text>
              </TouchableOpacity>
            </View>
          ) : (
            ligas.map((liga) => (
              <TouchableOpacity
                key={liga.id}
                style={styles.card}
                onPress={() => router.push(`/liga/${liga.id}`)}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.ligaBadge}>
                    <Text style={styles.ligaBadgeText}>{liga.nombre.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.ligaInfo}>
                    <Text style={styles.ligaNombre} numberOfLines={1}>{liga.nombre}</Text>
                    <Text style={styles.ligaMeta}>Temporada {liga.temporada}  ·  {liga.innings} innings</Text>
                  </View>
                </View>
                <View style={[styles.activaBadge, !liga.activa && styles.inactivaBadge]}>
                  <Text style={styles.activaText}>{liga.activa ? 'ACTIVA' : 'INACTIVA'}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: SPACING.XXL }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.BG },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.LG, paddingTop: SPACING.XL, paddingBottom: SPACING.MD },
  title:        { fontFamily: FONTS.DISPLAY, fontSize: 36, color: COLORS.TEXT, letterSpacing: 2 },
  addBtn:       { width: 40, height: 40, borderRadius: RADIUS.FULL, backgroundColor: COLORS.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  addBtnText:   { fontFamily: FONTS.BOLD, fontSize: 24, color: COLORS.TEXT, lineHeight: 28 },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content:      { flex: 1 },
  pad:          { padding: SPACING.LG, gap: SPACING.SM },
  empty:        { padding: SPACING.XL, alignItems: 'center', gap: SPACING.MD, marginTop: SPACING.XL },
  emptyTitle:   { fontFamily: FONTS.BOLD, fontSize: 18, color: COLORS.TEXT2 },
  emptyText:    { fontFamily: FONTS.BODY, fontSize: 14, color: COLORS.TEXT3, textAlign: 'center', lineHeight: 20 },
  emptyBtn:     { backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.MD, paddingHorizontal: SPACING.LG, paddingVertical: SPACING.SM },
  emptyBtnText: { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  card:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER },
  cardLeft:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, flex: 1 },
  ligaBadge:    { width: 44, height: 44, borderRadius: RADIUS.MD, backgroundColor: COLORS.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  ligaBadgeText: { fontFamily: FONTS.DISPLAY, fontSize: 16, color: COLORS.TEXT },
  ligaInfo:     { flex: 1 },
  ligaNombre:   { fontFamily: FONTS.BOLD, fontSize: 15, color: COLORS.TEXT },
  ligaMeta:     { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3, marginTop: 2 },
  activaBadge:  { paddingHorizontal: SPACING.SM, paddingVertical: 3, borderRadius: RADIUS.FULL, backgroundColor: `${COLORS.SUCCESS}22`, borderWidth: 1, borderColor: COLORS.SUCCESS },
  inactivaBadge: { backgroundColor: COLORS.SURFACE2, borderColor: COLORS.BORDER },
  activaText:   { fontFamily: FONTS.BOLD, fontSize: 9, color: COLORS.SUCCESS, letterSpacing: 0.5 },
})
