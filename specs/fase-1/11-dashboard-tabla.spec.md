# Spec 11 — Dashboard Home & Tabla de Posiciones
> Fase 1 · Depende de: Spec 06 (scorer), Spec 10 (apuntes)

## Objetivo
Pantalla principal de la app y la tabla de posiciones de la liga.
Es lo primero que ve el usuario al abrir ElPlay.

## Pantallas

### `app/(tabs)/index.tsx` — Dashboard Home

**Header**
- Saludo: "¡Buenas, [nombre]! 👋"
- Logo ElPlay
- Campana de notificaciones
- Avatar del usuario

**Liga selector** (scroll horizontal)
- Chip por cada liga donde el usuario tiene rol
- Chip activo = naranja
- Chip "+" para crear nueva liga

**Tarjeta de partido en vivo** (si hay alguno activo)
- Pill "EN VIVO" parpadeante
- Score: Local X — Y Visitante con nombres
- Entrada actual + estado de outs y bases
- Al bate y pitcher
- Tap → navega al dashboard público del partido

**Si no hay partido en vivo:**
- Card del próximo partido programado

**Stats de la semana** (3 tarjetas)
- Partidos jugados + delta vs semana anterior
- Carreras totales + delta
- Jonrones totales

**Acciones rápidas** (4 botones)
- ➕ Nuevo Partido
- 📝 Apunte Rápido
- 👥 Ver Equipos
- 📊 Estadísticas (placeholder hasta Fase 2)

**Próximos partidos** (lista)
- Título: "Próximos Partidos" + "Ver todos →"
- 3 partidos máximo en el home
- Card: fecha, equipos, estado (Próximo / En Vivo / Jugado)

**Apuntes recientes** (scroll horizontal)
- Título: "Apuntes Recientes" + "Ver todos →"
- 3 apuntes máximo
- Card: categoría, título, preview, tiempo

**Tabla de posiciones** (mini)
- Título: "Tabla de Posiciones" + "Ver completa →"
- Top 4 equipos: rank, badge, nombre, W-L, PCT

### `app/liga/[id]/posiciones.tsx` — Tabla de posiciones completa

- Header: nombre de la liga + temporada
- Tabla completa con todos los equipos:
  - Rank (#)
  - Badge + Nombre del equipo
  - J (juegos)
  - G (ganados)
  - P (perdidos)
  - C+ (carreras a favor)
  - C- (carreras en contra)
  - Dif (diferencial)
  - PCT (porcentaje)
- Ordenable por columna (tap en el header)
- Top 2 equipos destacados en naranja
- Tap en equipo → navega a gestión del equipo

## Lógica

### `hooks/use-dashboard.ts`
```typescript
const useDashboard = (ligaId: string) => {
  // partido en vivo activo
  // próximo partido
  // stats de la semana (calculadas)
  // apuntes recientes del usuario
  // top 4 posiciones
}
```

### `hooks/use-tabla-posiciones.ts`
```typescript
const useTablaPosticiones = (ligaId: string) => {
  // Calcular W/L/PCT/C+/C-/Dif para cada equipo
  // basado en partidos con estado Finalizado o Knockout
  // Solo contar partidos de tipo Liga (no torneos, no internos)
  // Ordenar por PCT DESC, luego por Dif DESC
}
```

### Cálculo de posiciones
```typescript
// Para cada equipo en la liga:
// G = partidos donde el equipo ganó (más carreras al finalizar)
// P = partidos donde el equipo perdió
// J = G + P
// PCT = G / J (si J === 0, PCT = 0)
// C+ = sum(carreras anotadas por el equipo)
// C- = sum(carreras recibidas por el equipo)
// Dif = C+ - C-
```

## Criterios de aceptación

- [ ] El partido en vivo se actualiza en tiempo real (Realtime)
- [ ] Si no hay liga seleccionada → mostrar pantalla de onboarding
- [ ] La tabla de posiciones solo incluye partidos oficiales de liga
  (tipo Liga, estado Finalizado o Knockout)
- [ ] Los juegos internos NO afectan la tabla de posiciones
- [ ] Las stats de la semana se calculan desde el lunes hasta hoy
- [ ] El chip de liga activo persiste entre sesiones (guardar en store)
- [ ] La tabla completa es ordenable por cualquier columna
- [ ] No hay `any` en TypeScript

## Notas para Claude Code

- Las stats de la semana pueden ser calculadas con una Supabase RPC
  o directamente con queries — lo que sea más eficiente
- El partido en vivo usa Realtime subscription igual que el dashboard público
- Si el usuario no tiene ligas → mostrar CTA para crear la primera liga
- La tabla de posiciones puede ser una view calculada en Postgres
  para evitar cálculos repetidos en el cliente:
  ```sql
  CREATE VIEW tabla_posiciones AS
  SELECT equipo_id, liga_id,
    COUNT(*) FILTER (WHERE ganó) AS g,
    COUNT(*) FILTER (WHERE perdió) AS p,
    ...
  FROM partidos ...
  ```
