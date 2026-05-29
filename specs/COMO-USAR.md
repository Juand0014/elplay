# Cómo usar los Specs con Claude Code

## El flujo completo

```
Spec → Implementación → Review → Commit → Siguiente spec
```

## Comando base para cada spec

```bash
# Ejemplo para el Spec 02
claude "Lee el CLAUDE.md y luego implementa exactamente lo que dice
/specs/fase-1/02-auth.spec.md. Empieza verificando que el Spec 01
(monorepo) está completo antes de continuar."
```

## Orden estricto Fase 1

```bash
# Ya completado
✅ Spec 01 — Monorepo Setup

# Siguientes — ejecutar en este orden exacto
claude "Implementa /specs/fase-1/02-auth.spec.md"
claude "Implementa /specs/fase-1/03-ligas-crud.spec.md"
claude "Implementa /specs/fase-1/04-equipos-jugadores.spec.md"
claude "Implementa /specs/fase-1/05-crear-partido.spec.md"
claude "Implementa /specs/fase-1/06-scorer-en-vivo.spec.md"
claude "Implementa /specs/fase-1/07-ko-engine.spec.md"
claude "Implementa /specs/fase-1/08-dashboard-publico.spec.md"
claude "Implementa /specs/fase-1/09-juego-interno.spec.md"
claude "Implementa /specs/fase-1/10-apuntes.spec.md"
claude "Implementa /specs/fase-1/11-dashboard-tabla.spec.md"
```

## Después de cada spec

```bash
# 1. Review automático
claude ultrareview

# 2. Si pasa → commit
git add .
git commit -m "feat(spec-XX): <descripción>"

# 3. Siguiente spec
```

## Si Claude Code falla en un spec

```bash
# Darle más contexto
claude "El spec /specs/fase-1/06-scorer-en-vivo.spec.md falló en
la parte del Realtime. Lee CLAUDE.md sección 'Realtime' y reintenta
solo esa parte."
```

## Agentes paralelos (Fase 2 en adelante)

Cuando termines la Fase 1 puedes correr specs en paralelo con agentes:

```bash
claude --model opus --agents '{
  "backend":  {"description": "Specs de DB, RLS, Edge Functions"},
  "mobile":   {"description": "Specs de pantallas React Native"},
  "engine":   {"description": "Specs de lógica de negocio"}
}'
```

## Checklist antes de cada spec

- [ ] El spec anterior está en `main` con commit
- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm lint` pasa sin errores
- [ ] La app corre en simulador sin crashes
