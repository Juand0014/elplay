import { useEffect, useState }           from 'react'
import {
  View, Text, StyleSheet, ActivityIndicator,
  ScrollView, RefreshControl,
} from 'react-native'
import { useLocalSearchParams }           from 'expo-router'
import { COLORS, FONTS, SPACING, RADIUS, EstadoPartido, MediaEntrada } from '@elplay/shared/types'
import { supabase }                       from '../../lib/supabase'
import type { PartidoResumen }            from '../../hooks/use-partidos'

// Dashboard público de un partido — accesible sin login
// Muestra score en tiempo real via Supabase Realtime

export default function PublicoDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [partido, setPartido]   = useState<PartidoResumen | null>(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPartido = async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('partidos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      setLoading(false)
      return
    }

    const p = data as Record<string, unknown>

    const [local, visitante] = await Promise.all([
      supabase.from('equipos').select('nombre, color_primario').eq('id', p['equipo_local_id']).single(),
      supabase.from('equipos').select('nombre, color_primario').eq('id', p['equipo_visitante_id']).single(),
    ])

    setPartido({
      ...(p as unknown as PartidoResumen),
      equipo_local_nombre:     (local.data as { nombre: string } | null)?.nombre ?? '—',
      equipo_visitante_nombre: (visitante.data as { nombre: string } | null)?.nombre ?? '—',
      equipo_local_color:      (local.data as { color_primario: string } | null)?.color_primario ?? '#ff4d00',
      equipo_visitante_color:  (visitante.data as { color_primario: string } | null)?.color_primario ?? '#3b82f6',
    })
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    void loadPartido()

    // Realtime: escuchar cambios del partido
    if (!id) return
    const channel = supabase
      .channel(`publico:${id}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'partidos',
        filter: `id=eq.${id}`,
      }, (payload) => {
        // Actualizar score y entrada sin re-fetchear todo
        setPartido((prev) => prev ? {
          ...prev,
          ...(payload.new as Partial<PartidoResumen>),
        } : null)
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.PRIMARY} size="large" />
      </View>
    )
  }

  if (!partido) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Partido no encontrado</Text>
      </View>
    )
  }

  const isLive = partido.estado === EstadoPartido.EnVivo
  const isDone = partido.estado === EstadoPartido.Finalizado || partido.estado === EstadoPartido.Knockout

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadPartido() }} tintColor={COLORS.PRIMARY} />}
    >
      {/* Status pill */}
      <View style={styles.statusPillRow}>
        <View style={[styles.statusPill, { backgroundColor: isLive ? COLORS.DANGER : isDone ? COLORS.SURFACE2 : COLORS.SURFACE2 }]}>
          <Text style={styles.statusPillText}>
            {isLive ? 'EN VIVO' : isDone ? (partido.estado === EstadoPartido.Knockout ? 'KO' : 'FINAL') : 'PRÓXIMO'}
          </Text>
        </View>
      </View>

      {/* Score principal */}
      <View style={styles.scoreSection}>
        {/* Local */}
        <View style={styles.teamSide}>
          <View style={[styles.teamBadge, { backgroundColor: partido.equipo_local_color }]}>
            <Text style={styles.teamBadgeText}>
              {partido.equipo_local_nombre.slice(0, 3).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.teamName} numberOfLines={2}>{partido.equipo_local_nombre}</Text>
          <Text style={styles.teamRole}>Local</Text>
        </View>

        {/* Score */}
        <View style={styles.scoreCenter}>
          <Text style={styles.scoreNumbers}>
            {partido.carreras_local} — {partido.carreras_visitante}
          </Text>
          {isLive && (
            <Text style={styles.inningText}>
              {partido.media_entrada_actual === MediaEntrada.Top ? 'TOP' : 'BOT'} {partido.entrada_actual}ª
            </Text>
          )}
          {isDone && (
            <Text style={styles.hitsText}>
              H: {partido.hits_local} — {partido.hits_visitante}
            </Text>
          )}
        </View>

        {/* Visitante */}
        <View style={styles.teamSide}>
          <View style={[styles.teamBadge, { backgroundColor: partido.equipo_visitante_color }]}>
            <Text style={styles.teamBadgeText}>
              {partido.equipo_visitante_nombre.slice(0, 3).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.teamName} numberOfLines={2}>{partido.equipo_visitante_nombre}</Text>
          <Text style={styles.teamRole}>Visitante</Text>
        </View>
      </View>

      {/* Info adicional */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha</Text>
          <Text style={styles.infoValue}>
            {new Date(partido.fecha).toLocaleDateString('es-DO', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hits</Text>
          <Text style={styles.infoValue}>{partido.hits_local} — {partido.hits_visitante}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Errores</Text>
          <Text style={styles.infoValue}>{partido.errores_local ?? 0} — {partido.errores_visitante ?? 0}</Text>
        </View>
      </View>

      {isLive && (
        <View style={styles.realtimeNote}>
          <Text style={styles.realtimeText}>Actualizando en tiempo real</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: COLORS.BG },
  center:         { flex: 1, backgroundColor: COLORS.BG, alignItems: 'center', justifyContent: 'center' },
  errorText:      { fontFamily: FONTS.BODY, color: COLORS.TEXT3, fontSize: 16 },
  content:        { padding: SPACING.LG, paddingTop: SPACING.XL, gap: SPACING.LG },
  statusPillRow:  { alignItems: 'center' },
  statusPill:     { paddingHorizontal: SPACING.LG, paddingVertical: SPACING.XS, borderRadius: RADIUS.FULL },
  statusPillText: { fontFamily: FONTS.BOLD, fontSize: 12, color: COLORS.TEXT, letterSpacing: 2 },
  scoreSection:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamSide:       { flex: 1, alignItems: 'center', gap: SPACING.SM },
  teamBadge:      { width: 64, height: 64, borderRadius: RADIUS.LG, alignItems: 'center', justifyContent: 'center' },
  teamBadgeText:  { fontFamily: FONTS.DISPLAY, fontSize: 22, color: COLORS.TEXT },
  teamName:       { fontFamily: FONTS.BOLD, fontSize: 13, color: COLORS.TEXT, textAlign: 'center', lineHeight: 18 },
  teamRole:       { fontFamily: FONTS.BODY, fontSize: 11, color: COLORS.TEXT3 },
  scoreCenter:    { alignItems: 'center', gap: SPACING.XS },
  scoreNumbers:   { fontFamily: FONTS.DISPLAY, fontSize: 56, color: COLORS.TEXT, lineHeight: 60 },
  inningText:     { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.PRIMARY, letterSpacing: 2 },
  hitsText:       { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
  infoCard:       { backgroundColor: COLORS.SURFACE, borderRadius: RADIUS.LG, padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.SM },
  infoLabel:      { fontFamily: FONTS.BODY, fontSize: 14, color: COLORS.TEXT3 },
  infoValue:      { fontFamily: FONTS.BOLD, fontSize: 14, color: COLORS.TEXT },
  infoDivider:    { height: 1, backgroundColor: COLORS.BORDER },
  realtimeNote:   { alignItems: 'center', paddingVertical: SPACING.SM },
  realtimeText:   { fontFamily: FONTS.BODY, fontSize: 12, color: COLORS.TEXT3 },
})
