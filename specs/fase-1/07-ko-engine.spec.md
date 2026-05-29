# Spec 07 — KO Engine (Knockout / Misericordia)
> Fase 1 · Depende de: Spec 06 (scorer funcionando)

## Objetivo
Implementar el engine que evalúa las reglas de knockout automáticamente
al finalizar cada half-inning. Funciona para los 3 tipos de juego.

## Arquitectura

El KO engine vive en dos lugares:
1. **Supabase Edge Function** `evaluate-knockout` — fuente de verdad
2. **`packages/shared/src/utils/ko-engine.ts`** — misma lógica en cliente
   para preview y tests

## Edge Function: `supabase/functions/evaluate-knockout/index.ts`

### Input
```typescript
interface EvaluateKnockoutInput {
  partido_id: string
}
```

### Output
```typescript
interface EvaluateKnockoutOutput {
  triggered:  boolean
  rule:        KnockoutRule | null   // la regla que disparó el KO
  diferencia:  number                // diferencia de carreras actual
}
```

### Lógica completa
```typescript
async function evaluateKnockout(partidoId: string): Promise<EvaluateKnockoutOutput> {
  // 1. Obtener el partido con sus datos actuales
  const partido = await getPartido(partidoId)

  // 2. Verificar que el juego está en vivo
  if (partido.estado !== EstadoPartido.EnVivo) {
    return { triggered: false, rule: null, diferencia: 0 }
  }

  // 3. Verificar que completó al menos la entrada mínima
  //    (no evaluar en el top de la primera entrada)
  if (partido.media_entrada !== MediaEntrada.Bottom) {
    return { triggered: false, rule: null, diferencia: 0 }
  }

  // 4. Obtener reglas activas según la jerarquía:
  //    partido_id (override) > torneo_id > liga_id
  const rules = await getActiveRules(partido)
  if (!rules.length) return { triggered: false, rule: null, diferencia: 0 }

  // 5. Calcular diferencia de carreras
  const diferencia = Math.abs(
    partido.carreras_local - partido.carreras_visitante
  )

  // 6. Evaluar cada regla (ordenar por desde_entrada ASC)
  for (const rule of rules) {
    if (
      partido.entrada_actual >= rule.desde_entrada &&
      diferencia >= rule.diferencia_carreras
    ) {
      // KO activado
      await supabase
        .from('partidos')
        .update({
          estado:     EstadoPartido.Knockout,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partidoId)

      return { triggered: true, rule, diferencia }
    }
  }

  return { triggered: false, rule: null, diferencia }
}

// Jerarquía de herencia de reglas
async function getActiveRules(partido: Partido): Promise<KnockoutRule[]> {
  // Si el partido tiene override propio → usar solo esas
  const gameRules = await getRulesByPartidoId(partido.id)
  if (gameRules.length) return gameRules

  // Si pertenece a torneo → usar reglas del torneo
  if (partido.torneo_id) {
    const torneoRules = await getRulesByTorneoId(partido.torneo_id)
    if (torneoRules.length) return torneoRules
  }

  // Fallback → reglas de la liga
  if (partido.liga_id) {
    return getRulesByLigaId(partido.liga_id)
  }

  return []
}
```

## Cliente: `packages/shared/src/utils/ko-engine.ts`

Misma lógica pero para correr en el cliente (preview, tests):

```typescript
// Exportar funciones puras para tests
export const calculateDiferencia = (
  carrerasLocal: number,
  carrerasVisitante: number
): number => Math.abs(carrerasLocal - carrerasVisitante)

export const checkRuleTriggers = (
  rules:         KnockoutRule[],
  entrada:       number,
  diferencia:    number,
): KnockoutRule | null => {
  for (const rule of rules) {
    if (entrada >= rule.desde_entrada && diferencia >= rule.diferencia_carreras) {
      return rule
    }
  }
  return null
}

export const evaluateKnockoutClient = (
  partido:  Partido,
  rules:    KnockoutRule[],
): KnockoutRule | null => {
  if (partido.estado !== EstadoPartido.EnVivo) return null
  if (partido.media_entrada !== MediaEntrada.Bottom) return null

  const diferencia = calculateDiferencia(
    partido.carreras_local,
    partido.carreras_visitante
  )

  return checkRuleTriggers(rules, partido.entrada_actual, diferencia)
}
```

## Tests

```typescript
// packages/shared/src/__tests__/ko-engine.test.ts
describe('KO Engine', () => {
  it('no dispara si la diferencia no llega al mínimo', ...)
  it('no dispara si no se llegó a la entrada mínima', ...)
  it('dispara con la primera regla que se cumpla', ...)
  it('no evalúa en Top de la entrada (solo Bottom)', ...)
  it('no evalúa si el partido no está en vivo', ...)
  it('evalúa múltiples reglas y usa la primera que aplica', ...)
  it('juego interno también evalúa KO', ...)
})
```

## Integración con Scorer

En `use-siguiente-entrada.ts`, después de cambiar la entrada:

```typescript
// Llamar a la Edge Function
const { data } = await supabase.functions.invoke('evaluate-knockout', {
  body: { partido_id: partidoId }
})

if (data.triggered) {
  // Mostrar modal de KO al scorer
  showKnockoutModal({
    regla:      data.rule,
    diferencia: data.diferencia,
  })
}
```

## Modal de KO en el Scorer

Cuando se activa el KO mostrar modal:
- Título: "¡Juego terminado por misericordia!"
- Score final destacado
- Descripción: "Diferencia de X carreras en la Yma entrada"
- Botón: "Confirmar y cerrar partido"

## Criterios de aceptación

- [ ] El engine solo se evalúa al completar el Bottom de cada entrada
- [ ] Si hay reglas override del partido, usa esas y no las de liga/torneo
- [ ] Si hay reglas del torneo, usa esas y no las de la liga
- [ ] Si no hay reglas en ningún nivel → juego continúa normalmente
- [ ] Al disparar KO → `partido.estado = EstadoPartido.Knockout`
- [ ] El scorer ve el modal de KO inmediatamente
- [ ] Funciona para los 3 tipos de juego (liga, torneo, interno)
- [ ] Los tests de la lógica pura pasan al 100%
- [ ] No hay `any` en TypeScript

## Notas para Claude Code

- La Edge Function es la fuente de verdad — el cliente no debe
  cambiar el estado del partido directamente
- Usar `vitest` para los tests de la lógica pura
- La función del cliente (`evaluateKnockoutClient`) es solo
  para preview y tests — la Edge Function es la que actualiza la DB
- El KO también aplica a juegos internos (`tipo = TipoPartido.Interno`)
