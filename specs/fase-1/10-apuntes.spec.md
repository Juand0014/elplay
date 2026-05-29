# Spec 10 — Apuntes
> Fase 1 · Depende de: Spec 05 (partidos), Spec 09 (juego interno)

## Objetivo
Sistema de apuntes para que el dueño del equipo y el scorer
lleven notas vinculadas a partidos. Visibilidad configurable.

## Pantallas

### `app/(tabs)/apuntes.tsx` — Lista de apuntes
- Header: "Mis Apuntes"
- Chips de filtro: Todos | Partido | Táctica | Jugador | Resumen
- Botón "+" (FAB) para crear apunte rápido
- Lista agrupada por fecha: Hoy | Ayer | Esta semana | Anteriores
- Card por apunte:
  - Badge de categoría con color
  - Título
  - Preview del contenido (2 líneas)
  - Partido vinculado (si aplica)
  - Timestamp relativo
  - Icono de visibilidad (🔒 privado | 👥 equipo | 🌐 público)
- Swipe derecha: editar
- Swipe izquierda: eliminar (con confirmación)

### `app/apunte/crear.tsx` — Crear apunte
- Input: Título (required)
- TextArea: Contenido (required, multilínea)
- Selector: Categoría (`CategoriaApunte` enum — dropdown)
- Selector: Partido vinculado (optional — lista de partidos recientes)
  - Incluye juegos internos si el usuario es miembro del equipo
- Selector: Visibilidad (`VisibilidadApunte` enum)
  - Privado: solo yo
  - Equipo: todos los miembros del equipo
  - Público: cualquiera (solo para partidos oficiales)
- Botón "Guardar Apunte"

### `app/apunte/[id].tsx` — Ver / Editar apunte
- Vista completa del apunte
- Botón editar (solo el autor)
- Botón eliminar (solo el autor, con confirmación)
- Si está vinculado a un partido: card del partido con link

## Lógica

### `hooks/use-apuntes.ts`
```typescript
const useApuntes = (filters?: {
  categoria?:    CategoriaApunte
  partido_id?:   string
  visibilidad?:  VisibilidadApunte
}) => {
  // Query: apuntes del usuario + apuntes del equipo visibles
  // Ordenados por created_at DESC
}
```

### `hooks/use-create-apunte.ts`
```typescript
const useCreateApunte = () => {
  // Mutation: INSERT en apuntes
  // Validar que la visibilidad sea coherente:
  //   - Si partido es interno → visibilidad no puede ser 'publico'
  //   - Si no hay partido vinculado → visibilidad por defecto 'privado'
}
```

### Regla de visibilidad
```typescript
// En el formulario, si el partido vinculado es tipo Interno:
// → deshabilitar opción "Público" en el selector de visibilidad
// → mostrar mensaje: "Los apuntes de juegos internos no pueden ser públicos"
```

## Validaciones (Zod)
```typescript
const CreateApunteSchema = z.object({
  titulo:      z.string().min(3).max(200),
  contenido:   z.string().min(1).max(5000),
  categoria:   z.nativeEnum(CategoriaApunte),
  partido_id:  z.string().uuid().nullable().default(null),
  visibilidad: z.nativeEnum(VisibilidadApunte).default(VisibilidadApunte.Privado),
})
```

## Criterios de aceptación

- [ ] Apuntes privados solo los ve el autor
- [ ] Apuntes de equipo los ven todos los miembros del equipo
- [ ] Apuntes de juegos internos nunca pueden ser públicos
- [ ] El autor puede editar y eliminar sus apuntes
- [ ] Los filtros por categoría funcionan correctamente
- [ ] Un apunte vinculado a un partido interno no aparece en la vista pública
- [ ] El FAB abre el formulario directamente
- [ ] Si se crea desde la pantalla del scorer → el partido se pre-llena
- [ ] No hay `any` en TypeScript

## Notas para Claude Code

- El apunte rápido desde el scorer debe pre-llenar `partido_id`
  automáticamente con el partido en curso
- Los apuntes de equipo se consultan con una query que incluye
  los apuntes donde `partido.equipo_local_id` o `partido.equipo_visitante_id`
  es un equipo del que el usuario es miembro
- Usar `RLS` para la visibilidad — no filtrar solo en el cliente
