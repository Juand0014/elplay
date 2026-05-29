// Generado con: pnpm db:generate (supabase gen types typescript --local)
// Este es un stub temporal hasta tener Supabase configurado.
// ⚠️ No editar a mano — ejecutar pnpm db:generate para regenerar.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tipo genérico de fila para el stub — reemplazar con tipos generados por Supabase
type AnyRow = Record<string, Json | undefined>

// Stub flexible — acepta cualquier nombre de tabla, devuelve Record<string, Json>
// Cuando se generen los tipos reales, esto se reemplaza con las tablas específicas.
export interface Database {
  public: {
    Tables: Record<string, {
      Row:           AnyRow
      Insert:        AnyRow
      Update:        Partial<AnyRow>
      Relationships: never[]
    }>
    Views: Record<string, {
      Row: AnyRow
    }>
    Functions: Record<string, {
      Args:    AnyRow
      Returns: AnyRow
    }>
    Enums:       Record<string, string>
    CompositeTypes: Record<string, AnyRow>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
