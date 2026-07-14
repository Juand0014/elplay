# Empieza aquí — ElPlay (reinicio limpio)

**Parte activa: 00 Fundaciones**  
Board: https://trello.com/b/C6kNPrzX/elplay  
Mapa de etapas: [STAGES.md](STAGES.md)

Código base en **`main`**. Una app Expo = **web + mobile**.

---

## 1) Clonar y correr (todos)

```bash
git clone https://github.com/Juand0014/elplay.git && cd elplay
git checkout main && git pull
pnpm install && cp .env.example .env
```

**Web:**

```bash
pnpm web
# → http://localhost:8081
```

**Mobile:**

```bash
pnpm start
# Escanea el QR con Expo Go (misma Wi‑Fi)
```

Comenta en Trello: `OK local web` / `OK local mobile`.

---

## 2) Yariel (Partner) — hoy

Lista **Doing — Partner** (`priority:now`):

1. **Confirm local env (web + mobile)**  
2. **Smoke CI** (`pnpm typecheck && pnpm lint && pnpm test`)  
3. Cuando Parte 00 Done → card de **QA Scorer / polish** (Parte 01)

---

## 3) Juan (Owner) — hoy

Lista **Doing — Owner**:

1. Review de confirmaciones de Yariel  
2. **Bootstrap Trello** con etapas frescas (`pnpm trello:bootstrap`)  
3. (Opcional) Proyecto Supabase vacío  
4. Cuando Parte 00 OK → activar Parte 01 en MEMORY + Trello

```bash
# Necesitas key+token de https://trello.com/power-ups/admin
export TRELLO_API_KEY=...
export TRELLO_TOKEN=...
pnpm trello:bootstrap
```

---

## 4) Reglas

- Una sola parte activa  
- Código EN · UI ES (`src/i18n/es.ts`)  
- Antes de PR: typecheck · lint · test  
- No tocar cards *Doing — Partner* si eres agente, salvo que la card lo pida  

## Docs

[STAGES.md](STAGES.md) · [PLAN.md](PLAN.md) · [TRELLO.md](TRELLO.md) · [BOARD.md](BOARD.md) · [MEMORY.md](../MEMORY.md) · [CONTRIBUTING.md](CONTRIBUTING.md)
