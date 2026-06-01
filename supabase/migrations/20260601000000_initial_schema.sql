-- ============================================================
-- ElPlay — Migration 001: Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run on a fresh project. Uses IF NOT EXISTS throughout.
-- ============================================================

-- Extensions (Supabase enables these by default, but just in case)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS  (skip if already exist)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE tipo_partido      AS ENUM ('liga', 'torneo', 'interno');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_partido    AS ENUM ('pending', 'live', 'done', 'ko');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE media_entrada     AS ENUM ('top', 'bottom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_jugada       AS ENUM ('1B', '2B', '3B', 'HR', 'BB', 'HBP', 'K', 'OUT', 'E', 'DP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE posicion_campo    AS ENUM ('P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE formato_torneo    AS ENUM ('SE', 'DE', 'GE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_torneo     AS ENUM ('draft', 'open', 'active', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_inscripcion  AS ENUM ('self', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE visibilidad_apunte AS ENUM ('privado', 'equipo', 'publico');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE categoria_apunte  AS ENUM ('partido', 'tactica', 'jugador', 'resumen', 'general');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rol_usuario       AS ENUM ('comisionado', 'dueno_equipo', 'scorer', 'miembro', 'publico');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS ligas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre           TEXT NOT NULL,
  temporada        TEXT NOT NULL DEFAULT '',
  descripcion      TEXT,
  logo_url         TEXT,
  innings          INTEGER NOT NULL DEFAULT 9  CHECK (innings BETWEEN 3 AND 15),
  innings_minimos  INTEGER NOT NULL DEFAULT 5  CHECK (innings_minimos BETWEEN 3 AND 15),
  outs_por_entrada INTEGER NOT NULL DEFAULT 3  CHECK (outs_por_entrada IN (2, 3)),
  comisionado_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  activa           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add temporada if the table already existed without it
ALTER TABLE ligas ADD COLUMN IF NOT EXISTS temporada TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS equipos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liga_id          UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  nombre           TEXT NOT NULL,
  abreviatura      TEXT NOT NULL CHECK (char_length(abreviatura) BETWEEN 2 AND 4),
  logo_url         TEXT,
  color_primario   TEXT NOT NULL DEFAULT '#ff4d00',
  color_secundario TEXT NOT NULL DEFAULT '#ff8c00',
  dueno_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  activo           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (liga_id, nombre)
);

CREATE TABLE IF NOT EXISTS jugadores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id   UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  usuario_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre      TEXT NOT NULL,
  numero      INTEGER NOT NULL CHECK (numero BETWEEN 0 AND 99),
  posicion    posicion_campo NOT NULL DEFAULT 'DH',
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (equipo_id, numero)
);

CREATE TABLE IF NOT EXISTS torneos (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liga_id                   UUID REFERENCES ligas(id) ON DELETE CASCADE,
  nombre                    TEXT NOT NULL,
  descripcion               TEXT,
  formato                   formato_torneo NOT NULL DEFAULT 'SE',
  estado                    estado_torneo  NOT NULL DEFAULT 'draft',
  innings_override          INTEGER CHECK (innings_override BETWEEN 3 AND 15),
  outs_por_entrada_override INTEGER CHECK (outs_por_entrada_override IN (2, 3)),
  fecha_inicio              DATE,
  fecha_fin                 DATE,
  organizador_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  torneo_id   UUID NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  equipo_id   UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  tipo        tipo_inscripcion NOT NULL DEFAULT 'self',
  seed        INTEGER,
  inscrito_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (torneo_id, equipo_id)
);

CREATE TABLE IF NOT EXISTS knockout_rules (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liga_id             UUID REFERENCES ligas(id)   ON DELETE CASCADE,
  torneo_id           UUID REFERENCES torneos(id) ON DELETE CASCADE,
  partido_id          UUID,
  diferencia_carreras INTEGER NOT NULL CHECK (diferencia_carreras > 0),
  desde_entrada       INTEGER NOT NULL CHECK (desde_entrada >= 1),
  activa              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT knockout_exactamente_un_dueno CHECK (
    (liga_id IS NOT NULL)::INTEGER +
    (torneo_id IS NOT NULL)::INTEGER +
    (partido_id IS NOT NULL)::INTEGER = 1
  )
);

CREATE TABLE IF NOT EXISTS partidos (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liga_id              UUID REFERENCES ligas(id)   ON DELETE RESTRICT,
  torneo_id            UUID REFERENCES torneos(id) ON DELETE RESTRICT,
  equipo_local_id      UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  equipo_visitante_id  UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  scorer_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo                 tipo_partido   NOT NULL,
  estado               estado_partido NOT NULL DEFAULT 'pending',
  fecha                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entrada_actual       INTEGER NOT NULL DEFAULT 1 CHECK (entrada_actual >= 1),
  media_entrada_actual media_entrada NOT NULL DEFAULT 'top',
  innings_override     INTEGER CHECK (innings_override BETWEEN 3 AND 15),
  carreras_local       INTEGER NOT NULL DEFAULT 0 CHECK (carreras_local >= 0),
  carreras_visitante   INTEGER NOT NULL DEFAULT 0 CHECK (carreras_visitante >= 0),
  hits_local           INTEGER NOT NULL DEFAULT 0 CHECK (hits_local >= 0),
  hits_visitante       INTEGER NOT NULL DEFAULT 0 CHECK (hits_visitante >= 0),
  errores_local        INTEGER NOT NULL DEFAULT 0 CHECK (errores_local >= 0),
  errores_visitante    INTEGER NOT NULL DEFAULT 0 CHECK (errores_visitante >= 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT equipos_distintos CHECK (equipo_local_id <> equipo_visitante_id),
  CONSTRAINT liga_requerida_para_tipo_liga CHECK (
    tipo <> 'liga' OR liga_id IS NOT NULL
  ),
  CONSTRAINT torneo_requerido_para_tipo_torneo CHECK (
    tipo <> 'torneo' OR torneo_id IS NOT NULL
  )
);

-- Add partido_id FK to knockout_rules now that partidos exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'knockout_rules_partido_id_fkey'
  ) THEN
    ALTER TABLE knockout_rules
      ADD CONSTRAINT knockout_rules_partido_id_fkey
      FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS jugadas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id        UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id        UUID NOT NULL REFERENCES jugadores(id) ON DELETE RESTRICT,
  tipo              tipo_jugada NOT NULL,
  entrada           INTEGER NOT NULL CHECK (entrada >= 1),
  media_entrada     media_entrada NOT NULL,
  carreras_anotadas INTEGER NOT NULL DEFAULT 0 CHECK (carreras_anotadas >= 0),
  descripcion       TEXT,
  grupo_nombre      TEXT,
  anotado_por       UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  anotado_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS juego_grupos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id  UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#ff4d00',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (partido_id, nombre)
);

CREATE TABLE IF NOT EXISTS grupo_jugadores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo_id   UUID NOT NULL REFERENCES juego_grupos(id) ON DELETE CASCADE,
  jugador_id UUID NOT NULL REFERENCES jugadores(id)    ON DELETE CASCADE,
  UNIQUE (grupo_id, jugador_id)
);

CREATE TABLE IF NOT EXISTS apuntes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id  UUID REFERENCES partidos(id) ON DELETE SET NULL,
  equipo_id   UUID REFERENCES equipos(id)  ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo      TEXT NOT NULL,
  contenido   TEXT NOT NULL,
  visibilidad visibilidad_apunte NOT NULL DEFAULT 'privado',
  categoria   categoria_apunte   NOT NULL DEFAULT 'general',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles_usuario (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol         rol_usuario NOT NULL,
  liga_id     UUID REFERENCES ligas(id)   ON DELETE CASCADE,
  equipo_id   UUID REFERENCES equipos(id) ON DELETE CASCADE,
  asignado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, liga_id, equipo_id, rol),
  CONSTRAINT rol_debe_tener_contexto CHECK (
    liga_id IS NOT NULL OR equipo_id IS NOT NULL
  )
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_partidos_liga_id      ON partidos(liga_id);
CREATE INDEX IF NOT EXISTS idx_partidos_torneo_id    ON partidos(torneo_id);
CREATE INDEX IF NOT EXISTS idx_partidos_tipo_estado  ON partidos(tipo, estado);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha        ON partidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_jugadas_partido_id    ON jugadas(partido_id);
CREATE INDEX IF NOT EXISTS idx_jugadas_jugador_id    ON jugadas(jugador_id);
CREATE INDEX IF NOT EXISTS idx_jugadas_entrada       ON jugadas(partido_id, entrada, media_entrada);
CREATE INDEX IF NOT EXISTS idx_jugadores_equipo_id   ON jugadores(equipo_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_usuario_id  ON jugadores(usuario_id) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_roles_usuario_id      ON roles_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_roles_liga_id         ON roles_usuario(liga_id)    WHERE liga_id   IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_roles_equipo_id       ON roles_usuario(equipo_id)  WHERE equipo_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_apuntes_equipo_id     ON apuntes(equipo_id);
CREATE INDEX IF NOT EXISTS idx_apuntes_partido_id    ON apuntes(partido_id) WHERE partido_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ko_rules_liga_id      ON knockout_rules(liga_id)    WHERE liga_id    IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ko_rules_torneo_id    ON knockout_rules(torneo_id)  WHERE torneo_id  IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ko_rules_partido_id   ON knockout_rules(partido_id) WHERE partido_id IS NOT NULL;

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at_ligas     BEFORE UPDATE ON ligas     FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_equipos   BEFORE UPDATE ON equipos   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_jugadores BEFORE UPDATE ON jugadores FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_torneos   BEFORE UPDATE ON torneos   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_partidos  BEFORE UPDATE ON partidos  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_apuntes   BEFORE UPDATE ON apuntes   FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- RLS HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION auth.es_comisionado(p_liga_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid() AND liga_id = p_liga_id AND rol = 'comisionado'
  );
$$;

CREATE OR REPLACE FUNCTION auth.es_dueno_equipo(p_equipo_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid() AND equipo_id = p_equipo_id AND rol = 'dueno_equipo'
  );
$$;

CREATE OR REPLACE FUNCTION auth.es_scorer(p_equipo_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid() AND equipo_id = p_equipo_id
      AND rol IN ('scorer', 'dueno_equipo', 'comisionado')
  );
$$;

CREATE OR REPLACE FUNCTION auth.es_miembro_equipo(p_equipo_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid() AND equipo_id = p_equipo_id
      AND rol IN ('dueno_equipo', 'scorer', 'miembro')
  );
$$;

CREATE OR REPLACE FUNCTION auth.tiene_acceso_liga(p_liga_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid() AND liga_id = p_liga_id
  ) OR EXISTS (
    SELECT 1 FROM roles_usuario ru
    JOIN equipos e ON e.id = ru.equipo_id
    WHERE ru.usuario_id = auth.uid() AND e.liga_id = p_liga_id
  );
$$;

CREATE OR REPLACE FUNCTION auth.puede_anotar_partido(p_partido_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM partidos p
    WHERE p.id = p_partido_id
      AND (
        p.scorer_id = auth.uid()
        OR auth.es_dueno_equipo(p.equipo_local_id)
        OR auth.es_dueno_equipo(p.equipo_visitante_id)
        OR (p.liga_id IS NOT NULL AND auth.es_comisionado(p.liga_id))
      )
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- LIGAS
ALTER TABLE ligas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ligas_select_publico"     ON ligas;
DROP POLICY IF EXISTS "ligas_select_comisionado" ON ligas;
DROP POLICY IF EXISTS "ligas_insert_autenticado" ON ligas;
DROP POLICY IF EXISTS "ligas_update_comisionado" ON ligas;
DROP POLICY IF EXISTS "ligas_delete_comisionado" ON ligas;
CREATE POLICY "ligas_select_publico"     ON ligas FOR SELECT USING (activa = true);
CREATE POLICY "ligas_select_comisionado" ON ligas FOR SELECT USING (comisionado_id = auth.uid());
CREATE POLICY "ligas_insert_autenticado" ON ligas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND comisionado_id = auth.uid());
CREATE POLICY "ligas_update_comisionado" ON ligas FOR UPDATE USING (comisionado_id = auth.uid()) WITH CHECK (comisionado_id = auth.uid());
CREATE POLICY "ligas_delete_comisionado" ON ligas FOR DELETE USING (comisionado_id = auth.uid());

-- EQUIPOS
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "equipos_select_publico"       ON equipos;
DROP POLICY IF EXISTS "equipos_select_dueno"         ON equipos;
DROP POLICY IF EXISTS "equipos_insert"               ON equipos;
DROP POLICY IF EXISTS "equipos_update"               ON equipos;
DROP POLICY IF EXISTS "equipos_delete_comisionado"   ON equipos;
CREATE POLICY "equipos_select_publico"     ON equipos FOR SELECT USING (activo = true AND EXISTS (SELECT 1 FROM ligas l WHERE l.id = liga_id AND l.activa = true));
CREATE POLICY "equipos_select_dueno"       ON equipos FOR SELECT USING (dueno_id = auth.uid());
CREATE POLICY "equipos_insert"             ON equipos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (auth.es_comisionado(liga_id) OR dueno_id = auth.uid()));
CREATE POLICY "equipos_update"             ON equipos FOR UPDATE USING (auth.es_comisionado(liga_id) OR dueno_id = auth.uid()) WITH CHECK (auth.es_comisionado(liga_id) OR dueno_id = auth.uid());
CREATE POLICY "equipos_delete_comisionado" ON equipos FOR DELETE USING (auth.es_comisionado(liga_id));

-- JUGADORES
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jugadores_select_publico" ON jugadores;
DROP POLICY IF EXISTS "jugadores_select_equipo"  ON jugadores;
DROP POLICY IF EXISTS "jugadores_insert"         ON jugadores;
DROP POLICY IF EXISTS "jugadores_update"         ON jugadores;
CREATE POLICY "jugadores_select_publico" ON jugadores FOR SELECT USING (activo = true AND EXISTS (SELECT 1 FROM equipos e JOIN ligas l ON l.id = e.liga_id WHERE e.id = equipo_id AND e.activo = true AND l.activa = true));
CREATE POLICY "jugadores_select_equipo"  ON jugadores FOR SELECT USING (auth.es_dueno_equipo(equipo_id) OR auth.es_miembro_equipo(equipo_id) OR usuario_id = auth.uid());
CREATE POLICY "jugadores_insert"         ON jugadores FOR INSERT WITH CHECK (auth.es_dueno_equipo(equipo_id) OR EXISTS (SELECT 1 FROM equipos e WHERE e.id = equipo_id AND auth.es_comisionado(e.liga_id)));
CREATE POLICY "jugadores_update"         ON jugadores FOR UPDATE USING (auth.es_dueno_equipo(equipo_id) OR EXISTS (SELECT 1 FROM equipos e WHERE e.id = equipo_id AND auth.es_comisionado(e.liga_id)));

-- TORNEOS
ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "torneos_select" ON torneos;
DROP POLICY IF EXISTS "torneos_insert" ON torneos;
DROP POLICY IF EXISTS "torneos_update" ON torneos;
CREATE POLICY "torneos_select" ON torneos FOR SELECT USING (estado <> 'draft' OR organizador_id = auth.uid() OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id)));
CREATE POLICY "torneos_insert" ON torneos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND organizador_id = auth.uid() AND (liga_id IS NULL OR auth.es_comisionado(liga_id)));
CREATE POLICY "torneos_update" ON torneos FOR UPDATE USING (organizador_id = auth.uid() OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id)));

-- INSCRIPCIONES
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inscripciones_select" ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_insert" ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_delete" ON inscripciones;
CREATE POLICY "inscripciones_select" ON inscripciones FOR SELECT USING (EXISTS (SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.estado <> 'draft'));
CREATE POLICY "inscripciones_insert" ON inscripciones FOR INSERT WITH CHECK (auth.es_dueno_equipo(equipo_id) OR EXISTS (SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid()));
CREATE POLICY "inscripciones_delete" ON inscripciones FOR DELETE USING (auth.es_dueno_equipo(equipo_id) OR EXISTS (SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid()));

-- KNOCKOUT_RULES
ALTER TABLE knockout_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ko_rules_select_publico" ON knockout_rules;
DROP POLICY IF EXISTS "ko_rules_insert"         ON knockout_rules;
DROP POLICY IF EXISTS "ko_rules_update"         ON knockout_rules;
CREATE POLICY "ko_rules_select_publico" ON knockout_rules FOR SELECT USING (activa = true);
CREATE POLICY "ko_rules_insert"         ON knockout_rules FOR INSERT WITH CHECK ((liga_id IS NOT NULL AND auth.es_comisionado(liga_id)) OR (torneo_id IS NOT NULL AND EXISTS (SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid())) OR (partido_id IS NOT NULL AND auth.puede_anotar_partido(partido_id)));
CREATE POLICY "ko_rules_update"         ON knockout_rules FOR UPDATE USING ((liga_id IS NOT NULL AND auth.es_comisionado(liga_id)) OR (torneo_id IS NOT NULL AND EXISTS (SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid())) OR (partido_id IS NOT NULL AND auth.puede_anotar_partido(partido_id)));

-- PARTIDOS
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "partidos_select_publico" ON partidos;
DROP POLICY IF EXISTS "partidos_select_interno" ON partidos;
DROP POLICY IF EXISTS "partidos_insert"         ON partidos;
DROP POLICY IF EXISTS "partidos_update"         ON partidos;
CREATE POLICY "partidos_select_publico" ON partidos FOR SELECT USING (tipo <> 'interno');
CREATE POLICY "partidos_select_interno" ON partidos FOR SELECT USING (tipo = 'interno' AND (auth.es_miembro_equipo(equipo_local_id) OR auth.es_dueno_equipo(equipo_local_id) OR auth.es_scorer(equipo_local_id) OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))));
CREATE POLICY "partidos_insert"         ON partidos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND ((tipo = 'liga' AND liga_id IS NOT NULL AND auth.es_comisionado(liga_id)) OR (tipo = 'torneo' AND torneo_id IS NOT NULL AND EXISTS (SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid())) OR (tipo = 'torneo' AND liga_id IS NOT NULL AND auth.es_comisionado(liga_id)) OR (tipo = 'interno' AND auth.es_dueno_equipo(equipo_local_id))));
CREATE POLICY "partidos_update"         ON partidos FOR UPDATE USING (auth.puede_anotar_partido(id));

-- JUGADAS
ALTER TABLE jugadas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jugadas_select_publico" ON jugadas;
DROP POLICY IF EXISTS "jugadas_select_interno" ON jugadas;
DROP POLICY IF EXISTS "jugadas_insert"         ON jugadas;
DROP POLICY IF EXISTS "jugadas_delete"         ON jugadas;
CREATE POLICY "jugadas_select_publico" ON jugadas FOR SELECT USING (EXISTS (SELECT 1 FROM partidos p WHERE p.id = partido_id AND p.tipo <> 'interno'));
CREATE POLICY "jugadas_select_interno" ON jugadas FOR SELECT USING (EXISTS (SELECT 1 FROM partidos p WHERE p.id = partido_id AND p.tipo = 'interno' AND (auth.es_miembro_equipo(p.equipo_local_id) OR auth.es_dueno_equipo(p.equipo_local_id) OR auth.es_scorer(p.equipo_local_id))));
CREATE POLICY "jugadas_insert"         ON jugadas FOR INSERT WITH CHECK (auth.puede_anotar_partido(partido_id) AND anotado_por = auth.uid());
CREATE POLICY "jugadas_delete"         ON jugadas FOR DELETE USING (auth.puede_anotar_partido(partido_id));

-- JUEGO_GRUPOS
ALTER TABLE juego_grupos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "juego_grupos_select" ON juego_grupos;
DROP POLICY IF EXISTS "juego_grupos_insert" ON juego_grupos;
DROP POLICY IF EXISTS "juego_grupos_update" ON juego_grupos;
DROP POLICY IF EXISTS "juego_grupos_delete" ON juego_grupos;
CREATE POLICY "juego_grupos_select" ON juego_grupos FOR SELECT USING (EXISTS (SELECT 1 FROM partidos p WHERE p.id = partido_id AND (auth.es_miembro_equipo(p.equipo_local_id) OR auth.es_dueno_equipo(p.equipo_local_id) OR auth.es_scorer(p.equipo_local_id))));
CREATE POLICY "juego_grupos_insert" ON juego_grupos FOR INSERT WITH CHECK (auth.puede_anotar_partido(partido_id));
CREATE POLICY "juego_grupos_update" ON juego_grupos FOR UPDATE USING (auth.puede_anotar_partido(partido_id));
CREATE POLICY "juego_grupos_delete" ON juego_grupos FOR DELETE USING (auth.puede_anotar_partido(partido_id));

-- GRUPO_JUGADORES
ALTER TABLE grupo_jugadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grupo_jugadores_select" ON grupo_jugadores;
DROP POLICY IF EXISTS "grupo_jugadores_insert" ON grupo_jugadores;
DROP POLICY IF EXISTS "grupo_jugadores_delete" ON grupo_jugadores;
CREATE POLICY "grupo_jugadores_select" ON grupo_jugadores FOR SELECT USING (EXISTS (SELECT 1 FROM juego_grupos jg JOIN partidos p ON p.id = jg.partido_id WHERE jg.id = grupo_id AND (auth.es_miembro_equipo(p.equipo_local_id) OR auth.es_dueno_equipo(p.equipo_local_id))));
CREATE POLICY "grupo_jugadores_insert" ON grupo_jugadores FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM juego_grupos jg WHERE jg.id = grupo_id AND auth.puede_anotar_partido(jg.partido_id)));
CREATE POLICY "grupo_jugadores_delete" ON grupo_jugadores FOR DELETE USING (EXISTS (SELECT 1 FROM juego_grupos jg WHERE jg.id = grupo_id AND auth.puede_anotar_partido(jg.partido_id)));

-- APUNTES
ALTER TABLE apuntes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "apuntes_select_publico" ON apuntes;
DROP POLICY IF EXISTS "apuntes_select_equipo"  ON apuntes;
DROP POLICY IF EXISTS "apuntes_select_privado" ON apuntes;
DROP POLICY IF EXISTS "apuntes_insert"         ON apuntes;
DROP POLICY IF EXISTS "apuntes_update"         ON apuntes;
DROP POLICY IF EXISTS "apuntes_delete"         ON apuntes;
CREATE POLICY "apuntes_select_publico" ON apuntes FOR SELECT USING (visibilidad = 'publico');
CREATE POLICY "apuntes_select_equipo"  ON apuntes FOR SELECT USING (visibilidad = 'equipo' AND equipo_id IS NOT NULL AND (auth.es_miembro_equipo(equipo_id) OR auth.es_dueno_equipo(equipo_id) OR auth.es_scorer(equipo_id)));
CREATE POLICY "apuntes_select_privado" ON apuntes FOR SELECT USING (visibilidad = 'privado' AND usuario_id = auth.uid());
CREATE POLICY "apuntes_insert"         ON apuntes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND usuario_id = auth.uid());
CREATE POLICY "apuntes_update"         ON apuntes FOR UPDATE USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "apuntes_delete"         ON apuntes FOR DELETE USING (usuario_id = auth.uid() OR (equipo_id IS NOT NULL AND EXISTS (SELECT 1 FROM equipos e WHERE e.id = equipo_id AND auth.es_comisionado(e.liga_id))));

-- ROLES_USUARIO
ALTER TABLE roles_usuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_select_propio"      ON roles_usuario;
DROP POLICY IF EXISTS "roles_select_comisionado" ON roles_usuario;
DROP POLICY IF EXISTS "roles_select_dueno"       ON roles_usuario;
DROP POLICY IF EXISTS "roles_insert"             ON roles_usuario;
DROP POLICY IF EXISTS "roles_delete"             ON roles_usuario;
CREATE POLICY "roles_select_propio"      ON roles_usuario FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "roles_select_comisionado" ON roles_usuario FOR SELECT USING (liga_id IS NOT NULL AND auth.es_comisionado(liga_id));
CREATE POLICY "roles_select_dueno"       ON roles_usuario FOR SELECT USING (equipo_id IS NOT NULL AND auth.es_dueno_equipo(equipo_id));
CREATE POLICY "roles_insert"             ON roles_usuario FOR INSERT WITH CHECK ((liga_id IS NOT NULL AND auth.es_comisionado(liga_id)) OR (equipo_id IS NOT NULL AND auth.es_dueno_equipo(equipo_id)) OR (rol = 'miembro' AND equipo_id IS NOT NULL AND usuario_id = auth.uid() AND EXISTS (SELECT 1 FROM jugadores j WHERE j.equipo_id = roles_usuario.equipo_id AND j.usuario_id = auth.uid())));
CREATE POLICY "roles_delete"             ON roles_usuario FOR DELETE USING (usuario_id = auth.uid() OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id)) OR (equipo_id IS NOT NULL AND auth.es_dueno_equipo(equipo_id)));
