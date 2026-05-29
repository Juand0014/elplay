import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { router }                                from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS }        from '@elplay/shared/types'
import { usePartidosEnVivo }                     from '../../hooks/use-partidos'
import { useRequireAuth }                        from '../../hooks/use-require-auth'

export default function LiveScreen() {
  useRequireAuth()

  const { data: liveGames = [], isLoading, refetch } = usePartidosEnVivo()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.PRIMARY} />
        </View>
      ) : liveGames.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No hay partidos en vivo</Text>
          <Text style={styles.emptySubtitle}>Los partidos activos aparecen aqui en tiempo real</Text>
        </View>
      ) : (
        <FlatList
          data={liveGames}
          keyExtractor={(p) => p.id}
          onRefresh={refetch}
          refreshing={false}
          contentContainerStyle={styles.list}
          renderItem={({ item: p }) => (
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push(`/publico/${p.id}`)}
            >
              <View style={styles.gameHeader}>
                <View style={styles.livePill}>
                  <Text style={styles.livePillText}>VIVO</Text>
                </View>
                <Text style={styles.entrada}>{p.media_entrada_actual === 'top' ? 'TOP' : 'BOT'} {p.entrada_actual}a</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.teamName} numberOfLines={1}>{p.equipo_local_nombre}</Text>
                <Text style={styles.scoreNum}>{p.carreras_local}</Text>
                <Text style={styles.scoreDash}>-</Text>
                <Text style={styles.scoreNum}>{p.carreras_visitante}</Text>
                <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>{p.equipo_visitante_nombre}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.BG },
  header:      { padding: SPACING.LG, paddingTop: SPACING.XL },
  liveBadge:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.XS },
  liveDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.DANGER },
  liveText:    { fontFamily: FONTS.DISPLAY, fontSize: 36, color: COLORS.TEXT, letterSpacing: 3 },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.XL },
  emptyTitle:  { fontFamily: FONTS.BOLD, fontSize: 18, color: COLORS.TEXT2, textAlign: 'center', marginBottom: SPACING.SM },
  emptySubtitle: { fontFamily: FONTS.BODY, fontSize: 14, color: COLORS.TEXT3, textAlign: 'center' },
  list:        { padding: SPACING.LG, gap: SPACING.SM },
  gameCard:    { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, gap: SPACING.SM },
  gameHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  livePill:    { backgroundColor: COLORS.DANGER, borderRadius: RADIUS.FULL, paddingHorizontal: SPACING.SM, paddingVertical: 2 },
  livePillText:{ fontFamily: FONTS.BOLD, fontSize: 10, color: COLORS.TEXT, letterSpacing: 1 },
  entrada:     { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.PRIMARY },
  scoreRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  teamName:    { flex: 1, fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT2 },
  scoreNum:    { fontFamily: FONTS.DISPLAY, fontSize: 36, color: COLORS.TEXT },
  scoreDash:   { fontFamily: FONTS.DISPLAY, fontSize: 24, color: COLORS.TEXT3 },
})
