# Spec 09 — Juego Interno (Práctica)
> Fase 1 · Depende de: Spec 04 (equipos), Spec 06 (scorer)

## Objetivo
Permitir al dueño del equipo crear un juego de práctica interno,
dividiendo el roster en dos grupos. Solo visible para miembros del equipo.

## Diferencias clave vs Juego de Liga

| | Juego de Liga | Juego Interno |
|---|---|---|
| Tipo | `TipoPartido.Liga` | `TipoPartido.Interno` |
| Equipos | Dos equipos distintos | Un equipo, dos grupos |
| Cuenta para liga | ✓ Sí | ✗ No |
| Stats oficiales | ✓ Sí | ✗ No (tabla separada) |
| Dashboard público | ✓ Sí | ✗ No |
| Visible para | Todos | Solo miembros del equipo |
| Quién crea | Comisionado / Dueño | Solo dueño del equipo |

## Pantallas

### `app/interno/crear.tsx` — Crear juego interno

**Paso 1 — Info básica**
- Nombre opcional (default: "Práctica [fecha]")
- Date picker: fecha
- Time picker: hora

**Paso 2 — Dividir el roster**
- Header: "Divide el roster en dos grupos"
- Lista de jugadores activos del equipo
- Cada jugador tiene un botón toggle: [A] [B] (sin asignar por defecto)
- Totales en tiempo real: "Grupo A: X jugadores · Grupo B: Y jugadores"
- Validación: ambos grupos deben tener al menos 1 jugador para continuar
- Los nombres de los grupos son fijos: "Grupo A" y "Grupo B"

**Paso 3 — Config del juego**
- Stepper: Innings (default: hereda de la liga, o `DEFAULT_GAME_CONFIG.INNINGS`)
- Toggle: Activar knockout (default: off — en práctica no suele haber KO)
- Si KO on: mismos campos que en crear liga

**Paso 4 — Scorer**
- Selector: Asignar scorer (miembros del equipo)
- Solo el scorer asignado puede anotar

**Botón: "Crear Juego Interno"**

### `app/interno/[id].tsx` — Vista del juego interno
Solo accesible para miembros del equipo.

- Header: "PRÁCTICA · [nombre del juego]"
- Score: Grupo A X — Y Grupo B
- Si en vivo: botón "Ir al Scorer" (solo para el scorer asignado)
- Si terminado: score final + stats del partido

### `app/interno/historial.tsx` — Historial de juegos internos
- Lista de todos los juegos internos del equipo
- Card: nombre, fecha, score final, estado
- Solo visible para miembros del equipo

## Lógica

### `hooks/use-create-juego-interno.ts`
```typescript
const useCreateJuegoInterno = () => {
  // Mutation:
  // 1. INSERT en partidos con tipo = TipoPartido.Interno
  //    equipo_local_id = equipo_id (el mismo equipo)
  //    equipo_visitante_id = equipo_id (el mismo equipo)
  //    liga_id = null (no pertenece a liga)
  // 2. INSERT en juego_grupos (Grupo A, Grupo B)
  // 3. INSERT en grupo_jugadores (jugadores asignados a cada grupo)
  // 4. INSERT en knockout_rules si aplica (con partido_id)
}
```

### `hooks/use-juegos-internos.ts`
```typescript
const useJuegosInternos = (equipoId: string) => {
  // Query: partidos donde tipo = Interno
  //        AND (equipo_local_id = equipoId OR equipo_visitante_id = equipoId)
  // Solo accesible si el usuario es miembro del equipo (RLS)
}
```

### `hooks/use-grupos.ts`
```typescript
const useGrupos = (partidoId: string) => {
  // juego_grupos + grupo_jugadores + jugadores (nombre, numero)
}
```

### Scorer para juego interno
- Reutiliza exactamente la misma pantalla `app/scorer/[id].tsx`
- La diferencia es que el estado es `TipoPartido.Interno`
- El score no se publica en ningún dashboard público
- Los grupos "Grupo A" y "Grupo B" actúan como los dos equipos

### Stats del juego interno
Las stats se guardan en `jugadas` igual que en un juego oficial,
pero con el partido marcado como `tipo = Interno`.

Cuando se calculen stats del jugador (Fase 2), se filtrarán por tipo:
- Stats oficiales: `tipo IN (Liga, Torneo)`
- Stats internas: `tipo = Interno`

## Validaciones (Zod)
```typescript
const CreateJuegoInternoSchema = z.object({
  equipo_id:        z.string().uuid(),
  nombre:           z.string().max(100).optional(),
  fecha:            z.string().datetime(),
  innings_override: z.number().min(3).max(15).nullable(),
  scorer_id:        z.string().uuid(),
  grupos: z.array(z.object({
    nombre:       z.enum(['Grupo A', 'Grupo B']),
    color:        z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    jugador_ids:  z.array(z.string().uuid()).min(1),
  })).length(2),   // exactamente 2 grupos
})
```

## Criterios de aceptación

- [ ] Solo el dueño del equipo puede crear juegos internos
- [ ] Ambos grupos deben tener al menos 1 jugador
- [ ] No aparece en dashboard público (verificar con RLS)
- [ ] No suma al W/L de la liga
- [ ] Las jugadas se guardan igual que en un juego oficial
- [ ] El historial solo es visible para miembros del equipo
- [ ] El scorer reutiliza la misma pantalla que el juego de liga
- [ ] Si se intenta acceder sin ser miembro → 403
- [ ] No hay `any` en TypeScript

## Notas para Claude Code

- En `partidos`, para juego interno:
  `equipo_local_id` y `equipo_visitante_id` apuntan al mismo equipo
  Lo que diferencia los dos lados son los `juego_grupos`
- El scorer usa `grupo_id` en lugar de `equipo_id` para identificar
  qué lado está al bate
- Los colores de los grupos: Grupo A = color del equipo, Grupo B = azul
- RLS en `partidos`: para `tipo = Interno`, solo pueden leer
  los usuarios que son miembros del equipo (`es_miembro_equipo`)
