import { EstadoPartido, MediaEntrada } from '../types/enums/partido.enum'
import type { KnockoutRule }           from '../types/interfaces/liga.interface'
import type { Partido }                from '../types/interfaces/partido.interface'

// ── Funciones puras del KO Engine ─────────────────────────────
// Usadas para preview en el cliente y para tests.
// La fuente de verdad es la Edge Function evaluate-knockout.

/** Calcular la diferencia de carreras entre dos equipos */
export const calculateDiferencia = (
  carrerasLocal:     number,
  carrerasVisitante: number
): number => Math.abs(carrerasLocal - carrerasVisitante)

/**
 * Verificar si alguna regla se cumple dados los parámetros actuales.
 * Devuelve la primera regla que aplica, o null si ninguna cumple.
 */
export const checkRuleTriggers = (
  rules:     KnockoutRule[],
  entrada:   number,
  diferencia: number,
): KnockoutRule | null => {
  for (const rule of rules) {
    if (
      rule.activa &&
      entrada   >= rule.desde_entrada &&
      diferencia >= rule.diferencia_carreras
    ) {
      return rule
    }
  }
  return null
}

/**
 * Evaluar el KO engine en el cliente (preview/tests).
 * Solo evalúa al finalizar el Bottom de una entrada.
 * Devuelve la regla que dispara el KO, o null si no hay KO.
 */
export const evaluateKnockoutClient = (
  partido: Partido,
  rules:   KnockoutRule[],
): KnockoutRule | null => {
  // Solo evaluar si el partido está en vivo
  if (partido.estado !== EstadoPartido.EnVivo) return null

  // Solo evaluar al finalizar el Bottom de la entrada
  if (partido.media_entrada !== MediaEntrada.Bottom) return null

  const diferencia = calculateDiferencia(
    partido.carreras_local,
    partido.carreras_visitante
  )

  return checkRuleTriggers(rules, partido.entrada_actual, diferencia)
}

/** Verificar si el partido terminó por innings completados */
export const isPartidoCompletado = (
  partido:         Partido,
  inningsConfig:   number
): boolean => {
  if (partido.estado !== EstadoPartido.EnVivo) return false
  // El partido termina al completar el Bottom del último inning
  return (
    partido.entrada_actual >= inningsConfig &&
    partido.media_entrada  === MediaEntrada.Bottom
  )
}
