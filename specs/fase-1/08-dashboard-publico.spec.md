# Spec 08 — Dashboard Público
> Fase 1 · Depende de: Spec 06 (scorer en vivo)

## Objetivo
Vista pública del partido en tiempo real que cualquiera puede ver
sin necesidad de tener cuenta. Es lo que comparte el fanático.

## Pantallas

### `app/publico/[id].tsx` — Dashboard Público Mobile

**No requiere autenticación** — accesible sin login.

**Header**
- Logo ElPlay
- Pill "EN VIVO" parpadeante (si el juego está activo)
- Botón compartir (share sheet nativo)

**Score Banner**
- Emoji/badge del equipo local
- Nombre del equipo local
- Score local (grande, naranja si va ganando)
- "—" separador
- Score visitante
- Nombre del equipo visitante
- Entrada actual + indicador Top/Bottom
- Si terminado: "Final" en lugar de la entrada

**Estado del juego (si está en vivo)**
- Outs (3 círculos)
- Bases ocupadas (diamante)
- Al bate: nombre del bateador
- Pitcher: nombre del pitcher

**Tabs: En Vivo | Box Score | Jugadas**

**Tab En Vivo**
- Feed de jugadas recientes (más reciente arriba)
- Card por jugada:
  - Entrada + half
  - Descripción de la jugada (ej: "R. Mejía — Jonrón de 2 carreras")
  - Score resultante (ej: "Tigres 7 — Leones 4")
  - Timestamp relativo (ej: "Hace 3 min")
  - Color por tipo: verde (hit), naranja (HR), rojo (out), gris (neutro)

**Tab Box Score**
- Line score por entrada (scroll horizontal)
- Tabla de bateo por equipo (simplificada: VB, H, HR, RBI)

**Tab Jugadas**
- Play-by-play completo con todas las jugadas del partido

**Footer**
- "Powered by ElPlay" + link a descarga de la app

### `apps/web/app/publico/[id]/page.tsx` — Dashboard Público Web

Misma lógica pero en Next.js para compartir como link.
Server-side rendering para SEO y Open Graph tags.

**Open Graph**
```html
<meta property="og:title" content="Tigres 7 — Leones 4 · 6ta Entrada" />
<meta property="og:description" content="Liga Mayor RD · Partido en vivo" />
```

## Lógica

### `hooks/use-partido-publico.ts`
```typescript
const usePartidoPublico = (id: string) => {
  // Query pública — no requiere auth
  // partido + equipos + jugadas recientes
  // Suscripción Realtime a cambios
}
```

### Realtime en el dashboard público
```typescript
// Suscribirse a cambios sin auth
const channel = supabase
  .channel(`publico:${partidoId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'jugadas',
    filter: `partido_id=eq.${partidoId}`
  }, (payload) => {
    // Agregar jugada al feed
    // Actualizar score
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'partidos',
    filter: `id=eq.${partidoId}`
  }, (payload) => {
    // Actualizar estado, entrada, score
  })
  .subscribe()
```

### RLS para acceso público
- Los partidos de tipo `TipoPartido.Liga` y `TipoPartido.Torneo`
  son públicos si la liga tiene `stats_publicas = true`
- Los partidos de tipo `TipoPartido.Interno` NUNCA son públicos
- Si se intenta acceder a un juego interno → mostrar pantalla 404

## Criterios de aceptación

- [ ] Accesible sin login
- [ ] El score se actualiza en < 1 segundo cuando el scorer anota
- [ ] Los juegos internos NO son accesibles públicamente (404)
- [ ] El feed de jugadas crece en tiempo real sin refresh
- [ ] El link es compartible (deep link + web URL)
- [ ] Open Graph tags correctos para preview en WhatsApp/Instagram
- [ ] Si el partido no existe → pantalla de error clara
- [ ] Si el partido terminó → mostrar score final con "Final"
- [ ] No hay `any` en TypeScript

## Notas para Claude Code

- Esta pantalla es la que más usuarios van a ver — optimizar performance
- Usar `expo-sharing` para el botón de compartir en mobile
- El deep link format: `elplay://publico/[id]` en mobile,
  `https://elplay.app/publico/[id]` en web
- Lazy loading del play-by-play (solo cargar las últimas 20 jugadas,
  paginar si el usuario hace scroll up)
- Los juegos internos tienen RLS que bloquea el acceso público —
  no hace falta validar en el cliente
