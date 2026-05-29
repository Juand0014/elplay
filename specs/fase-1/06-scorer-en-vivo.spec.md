# Spec 06 — Scorer en Vivo
> Fase 1 · Depende de: Spec 05 (crear partido funcionando)

## Objetivo
Pantalla principal del scorer para anotar jugadas en tiempo real.
Es el corazón de ElPlay — debe ser rápida, clara y sin errores.

## Pantalla

### `app/scorer/[id].tsx`

**Header fijo (siempre visible)**
- Pill "EN VIVO" parpadeante
- Score: [Equipo Local] X — Y [Equipo Visitante]
- Entrada actual + media entrada (Top/Bottom)
- Botón "Finalizar partido" (requiere confirmación)

**Sección de estado del juego**
- Outs: 3 círculos (rellenos = out cometido)
- Bases: diamante visual con 1ra, 2da, 3ra (naranja = ocupada)
- Cuenta: Bolas - Strikes (ej: "2 - 1")

**Sección "Al Bate"**
- Avatar + nombre + número del bateador actual
- AVG en el partido (ej: ".412")
- Turnos al bate en este juego (ej: "3-3")
- Flecha para cambiar bateador manualmente si es necesario

**Pad de jugadas (botones grandes, fácil de tocar)**
```
[ 🟢 Sencillo ]  [ 📍 Doble   ]  [ 🔵 Triple  ]
[ 🚀 Jonrón  ]  [ 🚶 BB      ]  [ 🎯 HBP     ]
[ ❌ Out     ]  [ ⚡ Error    ]  [ 🔄 Doble P ]
```

**Botones de cuenta (secundarios)**
- [Strike] [Bola] [Foul] — actualizar cuenta sin registrar jugada

**Botón "Siguiente Entrada"** — aparece cuando se completan 3 outs

## Lógica

### `hooks/use-scorer.ts`
```typescript
interface ScorerState {
  partido:        PartidoConRelaciones
  estadoEnVivo:   EstadoEnVivo
  lineupLocal:    Jugador[]
  lineupVisitante: Jugador[]
  bateadorActual: Jugador | null
  jugadasLog:     RegistrarJugadaDto[]
}

const useScorer = (partidoId: string) => {
  // Suscripción Realtime a cambios del partido
  // Estado local del scoreboard
  // Funciones de acción
}
```

### `hooks/use-registrar-jugada.ts`
```typescript
const useRegistrarJugada = () => {
  // Mutation:
  // 1. INSERT en jugadas
  // 2. UPDATE carreras/hits/errores en partidos
  // 3. Evaluar KO (llamar al KO Engine)
  // 4. Avanzar bateador al siguiente en el lineup
  // Todo en una sola transacción o Edge Function
}
```

### `hooks/use-actualizar-cuenta.ts`
```typescript
const useActualizarCuenta = () => {
  // UPDATE estado_en_vivo: strikes, bolas
  // Si strikes llega a 3 → registrar ponche automáticamente
  // Si bolas llega a 4 → registrar BB automáticamente
}
```

### `hooks/use-siguiente-entrada.ts`
```typescript
const useSiguienteEntrada = () => {
  // Solo ejecutable cuando outs === 3
  // Si media_entrada === Top → cambiar a Bottom (misma entrada)
  // Si media_entrada === Bottom → incrementar entrada_actual
  // Resetear: outs = 0, strikes = 0, bolas = 0
  // Resetear bases
  // Después de cambio: evaluar si el juego terminó (innings completados)
}
```

### Realtime
```typescript
// Suscripción al canal del partido
const channel = supabase
  .channel(`scorer:${partidoId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'jugadas',
    filter: `partido_id=eq.${partidoId}`
  }, handleJugadaNueva)
  .subscribe()

// Limpiar en cleanup
```

### Avance automático del lineup
- Al registrar cualquier jugada que termina el turno (hit, out, BB, HR, HBP, error)
  → avanzar al siguiente bateador en el lineup
- Al llegar al bateador 9 → volver al 1

### Corrección de jugadas
- Botón "Deshacer última jugada" (solo la más reciente)
- Requiere confirmación
- Reversa la jugada: elimina el INSERT, revierte el UPDATE de carreras

## KO Engine (llamar después de cada half-inning)

```typescript
// En use-siguiente-entrada, después de cambiar la entrada:
const triggered = await evaluateKnockout(partidoId)
if (triggered) {
  // Mostrar modal: "¡Juego terminado por misericordia!"
  // partido.estado = EstadoPartido.Knockout
}
```

Ver pseudocódigo completo en CLAUDE.md sección "KO Engine".

## Criterios de aceptación

- [ ] Solo el scorer asignado puede registrar jugadas
- [ ] Cada jugada se refleja en el score inmediatamente (optimistic update)
- [ ] Los clientes suscritos (dashboard público) reciben el update en < 1 segundo
- [ ] El bateador avanza automáticamente al siguiente en el lineup
- [ ] Al completar 3 outs aparece botón "Siguiente Entrada"
- [ ] El KO engine se evalúa después de cada half-inning
- [ ] "Deshacer" solo está disponible para la jugada más reciente
- [ ] Al finalizar el partido (innings completos) → `estado = Finalizado`
- [ ] Al KO → `estado = Knockout`
- [ ] No se pueden registrar jugadas en partido `Finalizado` o `Knockout`
- [ ] No hay `any` en TypeScript
- [ ] Los botones del pad son suficientemente grandes para usar con el dedo

## Notas para Claude Code

- Esta es la pantalla más crítica del MVP — priorizar estabilidad
- Usar optimistic updates para que el UI no espere al servidor
- Si hay error en el INSERT, revertir el optimistic update y mostrar error
- El estado en vivo (`outs`, `bases`, `cuenta`) guardar en tabla
  `estado_en_vivo` o en el mismo `partidos` — lo que sea más eficiente
  para el Realtime
- Los botones del pad NO deben tener doble-tap accidental —
  debounce de 500ms entre jugadas
- Pantalla bloqueada en portrait mode
