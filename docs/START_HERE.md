# Empieza aquí — ElPlay (tú)

El código limpio ya está en **`main`**. Este archivo es tu checklist en local.

## Paso 1 — Traer el proyecto a tu PC

En PowerShell (ajusta la ruta si tu carpeta es otra):

```powershell
cd C:\ElPlayApp
# Si este repo ya es el clone de Juand0014/elplay:
git fetch origin
git checkout main
git pull origin main

# Si tenías un monorepo viejo aparte, clona limpio:
# git clone https://github.com/Juand0014/elplay.git
# cd elplay
```

Luego:

```powershell
pnpm install
copy .env.example .env
pnpm web
```

Abre la URL que Expo muestre (suele ser `http://localhost:8081`).

## Paso 2 — Probar el Scorer (Parte 01)

1. Toca **Entrar como invitado**
2. Escribe 2 equipos → **Empezar a anotar**
3. Pon un # en “Bateador / corredor” — debe verse en el **centro del diamante**
4. Prueba bola / strike / out / hits / +1 carrera / deshacer

No necesitas Supabase ni Google para esta prueba.

## Paso 3 — Partner + Trello (cuando quieras)

1. Invita al Partner al repo GitHub  
2. Crea tablero Trello con [TRELLO.md](TRELLO.md)  
3. Asígnale QA del scorer + polish UX (Issue #6)

## Paso 4 — Siguiente con el agente

Cuando hayas probado en local, escribe:  
**“Parte 01 OK, sigue con Live”**

---

## Docs

| Doc | Para qué |
|---|---|
| [PLAN.md](PLAN.md) | Roadmap completo |
| [MEMORY.md](../MEMORY.md) | Cursor + Claude |
| [TRELLO.md](TRELLO.md) | Asignar al 3ro |
