# Spec 04 — Equipos & Jugadores CRUD
> Fase 1 · Depende de: Spec 03 (ligas funcionando)

## Objetivo
Crear y gestionar equipos dentro de una liga, y gestionar el roster
de jugadores de cada equipo.

## Pantallas

### `app/equipo/crear.tsx` — Crear equipo
- Input: Nombre del equipo (required)
- Input: Ciudad (optional)
- Color picker: color del equipo (hex, default: #ff4d00)
- Preview del badge del equipo en tiempo real
- Selector: Liga a la que pertenece (dropdown de ligas del usuario)
- Botón "Crear Equipo"

### `app/equipo/[id].tsx` — Gestión del equipo
- Header: logo/badge, nombre, ciudad, record W-L
- Tabs: Roster | Juegos | Stats (Stats vacío hasta Fase 2)
- Tab Roster:
  - Lista de jugadores activos ordenados por número
  - Card por jugador: número, nombre, posición, estado (activo/inactivo)
  - Botón "+" para agregar jugador
  - Tap en jugador → modal de edición
  - Swipe para desactivar jugador
- Tab Juegos: lista de partidos del equipo (próximos + recientes)
- Botón editar equipo (solo dueño)

### `app/equipo/[id]/editar.tsx` — Editar equipo
- Mismo formulario de crear, pre-llenado

### `app/jugador/crear.tsx` (modal)
- Input: Nombre completo (required)
- Input: Número de camiseta (required, 1-99, único en el equipo)
- Selector: Posición (enum `Posicion` — dropdown)
- Toggle: Activo (default: on)
- Botón "Agregar al Roster"

### `app/jugador/[id]/editar.tsx` (modal)
- Mismo formulario, pre-llenado
- Opción adicional: desactivar jugador

## Lógica

### `hooks/use-equipo.ts`
```typescript
const useEquipo = (id: string) => {
  // Liga + jugadores activos + record de la temporada
}

const useEquipos = (ligaId: string) => {
  // Todos los equipos de una liga con su record
}
```

### `hooks/use-roster.ts`
```typescript
const useRoster = (equipoId: string) => {
  // Jugadores activos del equipo, ordenados por número
}

const useAddJugador = () => {
  // Mutation: INSERT en jugadores
  // Validar que el número no esté duplicado en el equipo
}

const useUpdateJugador = () => {
  // Mutation: UPDATE jugador
}

const useDesactivarJugador = () => {
  // Mutation: UPDATE activo = false
  // NO borrar — mantener historial
}
```

### Validaciones (Zod)
```typescript
const CreateEquipoSchema = z.object({
  nombre:    z.string().min(2).max(100),
  ciudad:    z.string().max(100).optional(),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
  liga_id:   z.string().uuid(),
})

const CreateJugadorSchema = z.object({
  nombre:    z.string().min(2).max(100),
  numero:    z.number().int().min(0).max(99),
  posicion:  z.nativeEnum(Posicion),
  activo:    z.boolean().default(true),
})
```

## Criterios de aceptación

- [ ] Al crear equipo, el creador queda con rol `DuenoEquipo` en `roles_usuario`
- [ ] El número de camiseta es único por equipo (validar antes de guardar)
- [ ] Jugadores desactivados no aparecen en el roster activo
- [ ] Jugadores desactivados SÍ aparecen en el historial de stats
- [ ] El color del equipo se refleja en el badge inmediatamente (preview)
- [ ] El roster se puede reordenar por número de camiseta
- [ ] Solo el dueño del equipo puede agregar/editar/desactivar jugadores
- [ ] No hay `any` en TypeScript
- [ ] Máximo 99 jugadores por equipo (mostrar warning al acercarse)

## Notas para Claude Code

- Los jugadores NUNCA se eliminan — solo se desactivan (`activo = false`)
  para mantener el historial de stats
- El componente `ColorPicker` va en `packages/ui` — reutilizable
- El componente `PlayerCard` va en `packages/ui` — reutilizable
- Al agregar jugador, validar contra el roster existente
  con una query antes del INSERT
- El badge del equipo (iniciales + color) va en `packages/ui`
