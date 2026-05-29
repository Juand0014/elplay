# Spec 05 — Crear Partido de Liga
> Fase 1 · Depende de: Spec 04 (equipos y jugadores listos)

## Objetivo
Permitir al comisionado o dueño de equipo crear un partido oficial de liga,
configurarlo y asignar un scorer.

## Pantallas

### `app/partido/crear.tsx` — Crear partido
Formulario en pasos:

**Paso 1 — Equipos**
- Selector: Equipo Local (dropdown de equipos de la liga)
- Selector: Equipo Visitante (dropdown, no puede ser el mismo que local)
- La liga se toma del contexto (desde dónde se navega)

**Paso 2 — Fecha y lugar**
- Date picker: Fecha del partido
- Time picker: Hora de inicio
- Input: Lugar / estadio (optional)

**Paso 3 — Configuración (Override)**
- Mostrar config actual de la liga (innings, outs, KO rules)
- Toggle: "Usar configuración de la liga" (default: on)
- Si off → mostrar steppers igual que en crear liga para override
- Nota: "Solo cambia este partido, no afecta la liga"

**Paso 4 — Scorer**
- Selector: Asignar scorer (lista de usuarios con rol scorer o dueño del equipo)
- Info: "El scorer podrá anotar jugadas en vivo"

**Botón: "Crear Partido"**

### `app/partido/[id]/lineup.tsx` — Definir lineup
Antes de iniciar el partido el scorer define el lineup:

- Dos columnas: Equipo Local | Equipo Visitante
- Drag & drop de jugadores para definir el orden al bate (1-9)
- Posición defensiva por jugador (dropdown)
- Mostrar solo jugadores activos del roster
- Botón "Confirmar Lineup e Iniciar Partido"
- Al confirmar → `partido.estado = EstadoPartido.EnVivo`

## Lógica

### `hooks/use-create-partido.ts`
```typescript
const useCreatePartido = () => {
  // Mutation:
  // 1. INSERT en partidos con tipo = TipoPartido.Liga
  // 2. Si hay override de config: INSERT en knockout_rules con partido_id
  // 3. Notificar al scorer asignado
}
```

### `hooks/use-partido.ts`
```typescript
const usePartido = (id: string) => {
  // partido + equipo_local + equipo_visitante + knockout_rules
}

const useIniciarPartido = () => {
  // Mutation: UPDATE estado = EnVivo
  // Solo ejecutable por el scorer asignado
}
```

### Validaciones (Zod)
```typescript
const CreatePartidoSchema = z.object({
  liga_id:              z.string().uuid(),
  torneo_id:            z.string().uuid().nullable().default(null),
  equipo_local_id:      z.string().uuid(),
  equipo_visitante_id:  z.string().uuid(),
  scorer_id:            z.string().uuid(),
  tipo:                 z.literal(TipoPartido.Liga),
  fecha:                z.string().datetime(),
  innings_override:     z.number().min(3).max(15).nullable().default(null),
}).refine(
  (d) => d.equipo_local_id !== d.equipo_visitante_id,
  { message: 'El equipo local y visitante no pueden ser el mismo' }
)
```

## Criterios de aceptación

- [ ] No se puede crear un partido con el mismo equipo en ambos lados
- [ ] El partido inicia en estado `EstadoPartido.Pendiente`
- [ ] Solo cambia a `EnVivo` cuando el scorer confirma el lineup
- [ ] El override de config solo aplica a ese partido
- [ ] Las KO rules del override se guardan con `partido_id` (no `liga_id`)
- [ ] El scorer asignado recibe acceso para anotar ese partido
- [ ] El comisionado y dueño de equipo pueden crear partidos
- [ ] No hay `any` en TypeScript

## Notas para Claude Code

- El campo `tipo` siempre es `TipoPartido.Liga` en este spec
  (los juegos internos son otro spec)
- Si `innings_override` es null, el engine usa los innings de la liga
- El lineup se guarda en una tabla `lineup` o como JSON en el partido
  — definir cuál es más conveniente para las queries de stats
- El drag & drop del lineup usar `react-native-reanimated` +
  `react-native-gesture-handler`
