import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase }   from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'

// ── Tipos locales ──────────────────────────────────────────────

export interface Liga {
  id:               string
  nombre:           string
  temporada:        string
  innings:          number
  innings_minimos:  number
  outs_por_entrada: number
  comisionado_id:   string
  activa:           boolean
  created_at:       string
  updated_at:       string
}

export interface KnockoutRule {
  id:                  string
  liga_id:             string | null
  torneo_id:           string | null
  partido_id:          string | null
  diferencia_carreras: number
  desde_entrada:       number
  activa:              boolean
}

export interface LigaConReglas extends Liga {
  knockout_rules: KnockoutRule[]
  equipos_count:  number
}

export interface CreateLigaInput {
  nombre:           string
  temporada:        string
  innings:          number
  innings_minimos:  number
  outs_por_entrada: number
  knockout_activo:  boolean
  knockout_rules:   { diferencia_carreras: number; desde_entrada: number }[]
}

// ── Keys de React Query ────────────────────────────────────────

export const ligaKeys = {
  all:    ['ligas'] as const,
  list:   () => [...ligaKeys.all, 'list'] as const,
  detail: (id: string) => [...ligaKeys.all, 'detail', id] as const,
}

// ── Hook: lista de ligas del usuario ──────────────────────────

export function useLigas() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ligaKeys.list(),
    queryFn:  async (): Promise<LigaConReglas[]> => {
      if (!userId) return []

      // Ligas donde el usuario tiene algún rol
      const { data, error } = await supabase
        .from('roles_usuario')
        .select(`
          liga:ligas (
            id, nombre, temporada, innings, innings_minimos,
            outs_por_entrada, comisionado_id, activa,
            created_at, updated_at
          )
        `)
        .eq('usuario_id', userId)
        .not('liga_id', 'is', null)

      if (error) throw new Error(error.message)

      // Deduplicar ligas (un usuario puede tener varios roles en la misma liga)
      const seen = new Set<string>()
      const ligas: LigaConReglas[] = []

      for (const row of (data ?? [])) {
        const liga = row.liga as unknown as Liga | null
        if (!liga || seen.has(liga.id)) continue
        seen.add(liga.id)

        // Contar equipos
        const { count } = await supabase
          .from('equipos')
          .select('*', { count: 'exact', head: true })
          .eq('liga_id', liga.id)
          .eq('activo', true)

        // KO rules de la liga
        const { data: rules } = await supabase
          .from('knockout_rules')
          .select('*')
          .eq('liga_id', liga.id)
          .eq('activa', true)

        ligas.push({
          ...liga,
          knockout_rules: (rules ?? []) as KnockoutRule[],
          equipos_count:  count ?? 0,
        })
      }

      return ligas
    },
    enabled: !!userId,
  })
}

// ── Hook: liga específica con relaciones ─────────────────────

export function useLiga(id: string) {
  return useQuery({
    queryKey: ligaKeys.detail(id),
    queryFn:  async (): Promise<LigaConReglas | null> => {
      const { data: liga, error } = await supabase
        .from('ligas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)

      const { data: rules } = await supabase
        .from('knockout_rules')
        .select('*')
        .eq('liga_id', id)
        .eq('activa', true)

      const { count } = await supabase
        .from('equipos')
        .select('*', { count: 'exact', head: true })
        .eq('liga_id', id)
        .eq('activo', true)

      return {
        ...(liga as unknown as Liga),
        knockout_rules: (rules ?? []) as KnockoutRule[],
        equipos_count:  count ?? 0,
      }
    },
    enabled: !!id,
  })
}

// ── Mutation: crear liga ───────────────────────────────────────

export function useCreateLiga() {
  const queryClient = useQueryClient()
  const userId      = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (input: CreateLigaInput): Promise<Liga> => {
      if (!userId) throw new Error('No autenticado')

      // 1. Crear la liga
      const { data: liga, error: ligaError } = await supabase
        .from('ligas')
        .insert({
          nombre:           input.nombre,
          temporada:        input.temporada,
          innings:          input.innings,
          innings_minimos:  input.innings_minimos,
          outs_por_entrada: input.outs_por_entrada,
          comisionado_id:   userId,
          activa:           true,
        })
        .select()
        .single()

      if (ligaError) throw new Error(ligaError.message)
      const newLiga = liga as unknown as Liga

      // 2. Asignar rol de comisionado
      await supabase.from('roles_usuario').insert({
        usuario_id: userId,
        rol:        'comisionado',
        liga_id:    newLiga.id,
      })

      // 3. Insertar KO rules si las hay
      if (input.knockout_activo && input.knockout_rules.length > 0) {
        await supabase.from('knockout_rules').insert(
          input.knockout_rules.map((rule) => ({
            liga_id:             newLiga.id,
            diferencia_carreras: rule.diferencia_carreras,
            desde_entrada:       rule.desde_entrada,
            activa:              true,
          }))
        )
      }

      return newLiga
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ligaKeys.list() })
    },
  })
}
