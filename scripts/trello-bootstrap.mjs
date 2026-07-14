#!/usr/bin/env node
/**
 * Bootstrap / reset ElPlay Trello stage cards.
 *
 * Usage:
 *   export TRELLO_API_KEY=...
 *   export TRELLO_TOKEN=...
 *   pnpm trello:bootstrap
 *   pnpm trello:bootstrap -- --archive-open
 *
 * Board: https://trello.com/b/C6kNPrzX/elplay
 */

const BOARD_ID = process.env.TRELLO_BOARD_ID || 'C6kNPrzX';
const KEY = process.env.TRELLO_API_KEY || process.env.TRELLO_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

const OWNER_USERNAME = process.env.TRELLO_OWNER || 'juandavidmatos1';
const PARTNER_USERNAME = process.env.TRELLO_PARTNER || 'yariel';

const ARCHIVE_OPEN = process.argv.includes('--archive-open');

if (!KEY || !TOKEN) {
  console.error(`
Missing Trello credentials.

1) Create an API key: https://trello.com/power-ups/admin
2) Generate a token (read,write):
   https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_KEY
3) Run:

   export TRELLO_API_KEY=...
   export TRELLO_TOKEN=...
   pnpm trello:bootstrap -- --archive-open
`);
  process.exit(1);
}

const api = (path, params = {}, method = 'GET', body) => {
  const url = new URL(`https://api.trello.com/1${path}`);
  url.searchParams.set('key', KEY);
  url.searchParams.set('token', TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  return fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${method} ${path} → ${res.status}: ${text}`);
    }
    return text ? JSON.parse(text) : null;
  });
};

const LIST_NAMES = {
  backlog: 'Backlog',
  spec: 'Spec Ready',
  owner: 'Doing — Owner',
  partner: 'Doing — Partner',
  contributor: 'Doing — Contributor',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
};

/** Cards for a clean Part 00 start + backlog stages. */
function stageCards(listIds, labels, members) {
  const L = listIds;
  const lab = (...keys) =>
    keys.map((k) => labels[k]).filter(Boolean).join(',');

  return [
    // Part 00 — active
    {
      name: '[P00] Confirm local env (pnpm web + pnpm start)',
      desc: `Parte 00 — Fundaciones

1. git checkout main && git pull
2. pnpm install && cp .env.example .env
3. pnpm web → marca ElPlay en http://localhost:8081
4. pnpm start → Expo Go QR
5. Comenta: OK local web / OK local mobile

Docs: README + docs/START_HERE.md + docs/STAGES.md`,
      idList: L.partner,
      idMembers: members.partner,
      idLabels: lab('part-00', 'partner', 'priority:now', 'good-first', 'role:mobile'),
      pos: 'top',
    },
    {
      name: '[P00] Smoke CI (typecheck / lint / test)',
      desc: `Parte 00

pnpm typecheck && pnpm lint && pnpm test

Comenta resultados en la card.`,
      idList: L.partner,
      idMembers: members.partner,
      idLabels: lab('part-00', 'partner', 'priority:now', 'role:qa'),
      pos: 'top',
    },
    {
      name: '[P00] Review foundations docs (MEMORY / STAGES / ARCHITECTURE)',
      desc: `Parte 00 — Owner

Revisar que MEMORY.md diga Parte 00 activa y que STAGES.md / README coincidan.`,
      idList: L.owner,
      idMembers: members.owner,
      idLabels: lab('part-00', 'owner', 'priority:now'),
      pos: 'top',
    },
    {
      name: '[P00] Keep Trello board aligned (bootstrap script)',
      desc: `pnpm trello:bootstrap -- --archive-open

Credenciales: TRELLO_API_KEY + TRELLO_TOKEN (nunca commitear).`,
      idList: L.owner,
      idMembers: members.owner,
      idLabels: lab('part-00', 'owner', 'priority:now'),
      pos: 'top',
    },
    {
      name: '[P00] Optional: create empty Supabase project',
      desc: `No bloquea Parte 00. Llenar EXPO_PUBLIC_SUPABASE_* en .env local cuando exista.`,
      idList: L.spec,
      idMembers: members.owner,
      idLabels: lab('part-00', 'owner', 'role:dba'),
      pos: 'bottom',
    },

    // Part 01 — backlog until 00 done
    {
      name: '[P01] QA Scorer — 2–3 innings',
      desc: `Después de Parte 00 Done.

Guest → crear partido → anotar 2–3 innings.
Diamante: # del corredor en el centro.`,
      idList: L.backlog,
      idMembers: [members.partner, members.owner].filter(Boolean).join(','),
      idLabels: lab('part-01', 'partner', 'role:qa'),
    },
    {
      name: '[P01] Polish scorer pad UX',
      desc: `Thumb-first, contraste scoreboard, i18n ES only.`,
      idList: L.backlog,
      idMembers: members.partner,
      idLabels: lab('part-01', 'partner', 'role:ux', 'role:mobile'),
    },
    {
      name: '[P01] Scorer engine / invite link review',
      desc: `Validar engine + invite token en main. Spec: specs/01-scorer-mvp.spec.md`,
      idList: L.backlog,
      idMembers: members.owner,
      idLabels: lab('part-01', 'owner'),
    },

    // Later stages (one umbrella card each)
    {
      name: '[P02] Live dashboard + /live/[id]',
      desc: 'Spec 02 — Realtime, exclude internal games.',
      idList: L.backlog,
      idMembers: members.owner,
      idLabels: lab('part-02', 'owner'),
    },
    {
      name: '[P02] Live cards UX',
      desc: 'Partner: pantallas live deportivas.',
      idList: L.backlog,
      idMembers: members.partner,
      idLabels: lab('part-02', 'partner', 'role:ux'),
    },
    {
      name: '[P03] Guest + Google Auth',
      desc: 'Spec 03 — Guest first-class, Google primary.',
      idList: L.backlog,
      idMembers: members.owner,
      idLabels: lab('part-03', 'owner'),
    },
    {
      name: '[P03] Auth screens polish',
      desc: 'Partner UI guest/Google.',
      idList: L.backlog,
      idMembers: members.partner,
      idLabels: lab('part-03', 'partner', 'role:ux'),
    },
    {
      name: '[P05] Roles + RLS + invite scorer',
      desc: 'Spec 05 — policies in migrations; invite name + expiry.',
      idList: L.backlog,
      idMembers: members.owner,
      idLabels: lab('part-05', 'owner', 'role:dba'),
    },
    {
      name: '[P05] Invite scorer UX',
      desc: 'Partner: name prompt + expired state.',
      idList: L.backlog,
      idMembers: members.partner,
      idLabels: lab('part-05', 'partner', 'role:ux'),
    },
    {
      name: '[P06] Leagues / teams / roster',
      desc: 'Spec 06',
      idList: L.backlog,
      idLabels: lab('part-06'),
    },
    {
      name: '[P07] Standings + KO engine',
      desc: 'Spec 07',
      idList: L.backlog,
      idLabels: lab('part-07'),
    },
    {
      name: '[P08] Internal games',
      desc: 'Spec 08 — never on public live',
      idList: L.backlog,
      idLabels: lab('part-08'),
    },
    {
      name: '[P09] Notes',
      desc: 'Spec 09',
      idList: L.backlog,
      idLabels: lab('part-09'),
    },
    {
      name: '[P10+] Tournaments / box score / zones / push',
      desc: 'After MVP stable',
      idList: L.backlog,
      idLabels: lab('part-10plus'),
    },
  ];
}

async function ensureLists(existing) {
  const byName = Object.fromEntries(existing.map((l) => [l.name, l.id]));
  for (const name of Object.values(LIST_NAMES)) {
    if (!byName[name]) {
      const created = await api('/lists', { name, idBoard: BOARD_ID, pos: 'bottom' }, 'POST');
      byName[name] = created.id;
      console.log('Created list:', name);
    }
  }
  return {
    backlog: byName[LIST_NAMES.backlog],
    spec: byName[LIST_NAMES.spec],
    owner: byName[LIST_NAMES.owner],
    partner: byName[LIST_NAMES.partner],
    contributor: byName[LIST_NAMES.contributor],
    review: byName[LIST_NAMES.review],
    blocked: byName[LIST_NAMES.blocked],
    done: byName[LIST_NAMES.done],
  };
}

async function ensureLabels(existing) {
  const needed = [
    'part-00',
    'part-01',
    'part-02',
    'part-03',
    'part-05',
    'part-06',
    'part-07',
    'part-08',
    'part-09',
    'part-10plus',
    'role:ux',
    'role:mobile',
    'role:dba',
    'role:qa',
    'priority:now',
    'good-first',
    'owner',
    'partner',
  ];
  const byName = Object.fromEntries(existing.map((l) => [l.name, l.id]));
  for (const name of needed) {
    if (!byName[name]) {
      const created = await api(
        '/labels',
        { name, color: name === 'priority:now' ? 'red' : 'black', idBoard: BOARD_ID },
        'POST',
      );
      byName[name] = created.id;
      console.log('Created label:', name);
    }
  }
  return byName;
}

async function resolveMember(username) {
  try {
    const member = await api(`/members/${username}`, { fields: 'id,username,fullName' });
    return member.id;
  } catch (err) {
    console.warn(`Could not resolve @${username}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Board:', BOARD_ID);
  const board = await api(`/boards/${BOARD_ID}`, { fields: 'name,url' });
  console.log('Connected:', board.name, board.url);

  const lists = await ensureLists(await api(`/boards/${BOARD_ID}/lists`, { fields: 'name,id' }));
  const labels = await ensureLabels(
    await api(`/boards/${BOARD_ID}/labels`, { fields: 'name,id', limit: 1000 }),
  );

  const ownerId = await resolveMember(OWNER_USERNAME);
  const partnerId = await resolveMember(PARTNER_USERNAME);
  const members = { owner: ownerId || undefined, partner: partnerId || undefined };
  console.log('Members:', { owner: OWNER_USERNAME, ownerId, partner: PARTNER_USERNAME, partnerId });

  if (ARCHIVE_OPEN) {
    const openCards = await api(`/boards/${BOARD_ID}/cards`, {
      fields: 'name,id,closed',
      filter: 'open',
    });
    console.log(`Archiving ${openCards.length} open cards…`);
    for (const card of openCards) {
      await api(`/cards/${card.id}`, { closed: true }, 'PUT');
    }
  }

  const cards = stageCards(lists, labels, members);
  for (const card of cards) {
    const created = await api(
      '/cards',
      {
        idList: card.idList,
        name: card.name,
        desc: card.desc,
        idLabels: card.idLabels || '',
        idMembers: card.idMembers || '',
        pos: card.pos || 'bottom',
      },
      'POST',
    );
    console.log('+', created.name);
  }

  console.log('\nDone. Board:', board.url);
  console.log('Part 00 cards are in Doing with priority:now.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
