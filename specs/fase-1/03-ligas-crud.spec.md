# Spec 03 — Ligas CRUD
> Fase 1 · Depende de: Spec 02 (auth funcionando)

## Objetivo
Crear, ver, editar y configurar ligas. Incluye configuración de innings,
outs y reglas de knockout por defecto para todos los juegos de la liga.

## Pantallas

### `app/(tabs)/ligas.tsx` — Lista de ligas
- Lista de ligas donde el usuario es comisionado o miembro
- Card por liga: nombre, temporada, cantidad de equipos, estado
- Botón "+" para crear nueva liga (solo `RolUsuario.Comisionado` o cualquier usuario)
- Tap en una liga → navega a gestión de liga

### `app/liga/crear.tsx` — Crear liga
Formulario en pasos (stepper):

**Paso 1 — Info básica**
- Nombre de la liga (required)
- Temporada (default: año actual)

**Paso 2 — Configuración de juegos**
- Stepper: Innings por juego (default: 9, min: 3, max: 15)
- Stepper: Innings mínimos (default: 5, min: 3)
- Stepper: Juegos por temporada (default: 72)
- Stepper: Outs por entrada (default: 3, opciones: 2 o 3)

**Paso 3 — Knockout / Misericordia**
- Toggle: Activar knockout (default: on)
- Si activado: lista de reglas knockout
  - Cada regla: stepper "X carreras" + stepper "desde la Yma entrada"
  - Botón "+ Añadir regla" (puede haber múltiples)
  - Botón eliminar por regla

**Paso 4 — Opciones extra**
- Toggle: Innings extra en empate (default: on)
- Toggle: Regla del corredor en 2da (default: off)
- Toggle: Estadísticas públicas (default: on)

**Botón final: "Crear Liga"**

### `app/liga/[id].tsx` — Gestión de liga
- Header con nombre, temporada y record de la liga
- Tabs: Equipos | Partidos | Tabla | Torneos
- Tab Equipos: lista de equipos con botón "Agregar equipo"
- Tab Partidos: próximos y recientes
- Tab Tabla: tabla de posiciones simplificada
- Tab Torneos: lista de torneos (vacía hasta Fase 2)
- Botón editar config (solo comisionado)

### `app/liga/[id]/editar.tsx` — Editar configuración
- Mismo formulario que crear pero pre-llenado
- Solo accesible por comisionado

## Lógica

### `hooks/use-ligas.ts`
```typescript
// Ligas donde el usuario tiene algún rol
const useLigas = () => {
  // Query: ligas donde user_id está en roles_usuario
}

// Liga específica con relaciones
const useLiga = (id: string) => {
  // Query: liga + equipos + knockout_rules
}
```

### `hooks/use-create-liga.ts`
```typescript
// Mutation: crear liga + knockout_rules en una transacción
const useCreateLiga = () => {
  // 1. INSERT en ligas
  // 2. INSERT en knockout_rules (si hay reglas)
  // 3. INSERT en roles_usuario con rol comisionado
}
```

### Validaciones (Zod)
```typescript
const CreateLigaSchema = z.object({
  nombre:           z.string().min(3).max(100),
  temporada:        z.string().min(4).max(10),
  innings:          z.number().min(GAME_CONFIG_LIMITS.INNINGS_MIN)
                              .max(GAME_CONFIG_LIMITS.INNINGS_MAX),
  innings_minimos:  z.number().min(3),
  outs_por_entrada: z.union([z.literal(2), z.literal(3)]),
  juegos_temporada: z.number().min(1).max(200),
  knockout_activo:  z.boolean(),
  knockout_rules:   z.array(z.object({
    diferencia_carreras: z.number().min(1).max(50),
    desde_entrada:       z.number().min(1),
  })).optional(),
  innings_extra:    z.boolean(),
  corredor_2da:     z.boolean(),
  stats_publicas:   z.boolean(),
})
```

## Criterios de aceptación

- [ ] Cualquier usuario autenticado puede crear una liga
- [ ] Al crear, el creador queda con rol `comisionado` automáticamente
- [ ] Se pueden agregar múltiples reglas de knockout
- [ ] Las reglas de knockout se guardan en tabla `knockout_rules` con `liga_id`
- [ ] Solo el comisionado puede editar la configuración
- [ ] Los steppers no permiten valores fuera de los límites definidos en `GAME_CONFIG_LIMITS`
- [ ] La liga aparece en la lista del creador inmediatamente (optimistic update)
- [ ] Errores de Supabase se muestran en UI
- [ ] No hay `any` en TypeScript

## Notas para Claude Code

- Los knockout_rules son polimórficos: `liga_id | torneo_id | partido_id`
  Para la liga, solo se llena `liga_id`, los otros van `null`
- El comisionado que crea la liga se registra en `roles_usuario` con
  `rol = RolUsuario.Comisionado` y `liga_id`
- Usar React Query para caché y optimistic updates
- Stepper = componente propio en `packages/ui` — reutilizable
