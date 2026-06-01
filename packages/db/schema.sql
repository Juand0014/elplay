-- ============================================================
-- ElPlay — Schema Completo Fase 1
-- Supabase / PostgreSQL
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TIPOS / ENUMS
-- ============================================================

CREATE TYPE tipo_partido    AS ENUM ('liga', 'torneo', 'interno');
CREATE TYPE estado_partido   AS ENUM ('pending', 'live', 'done', 'ko');
CREATE TYPE media_entrada    AS ENUM ('top', 'bottom');
CREATE TYPE tipo_jugada      AS ENUM ('1B', '2B', '3B', 'HR', 'BB', 'HBP', 'K', 'OUT', 'E', 'DP');
CREATE TYPE posicion_campo   AS ENUM ('P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH');
CREATE TYPE formato_torneo   AS ENUM ('SE', 'DE', 'GE');
CREATE TYPE estado_torneo    AS ENUM ('draft', 'open', 'active', 'done');
CREATE TYPE tipo_inscripcion AS ENUM ('self', 'admin');
CREATE TYPE visibilidad_apunte AS ENUM ('privado', 'equipo', 'publico');
CREATE TYPE categoria_apunte AS ENUM ('partido', 'tactica', 'jugador', 'resumen', 'general');
CREATE TYPE rol_usuario      AS ENUM ('comisionado', 'dueno_equipo', 'scorer', 'miembro', 'publico');

-- ============================================================
-- TABLA: ligas
-- Root de todo. El comisionado crea y administra la liga.
-- ============================================================

CREATE TABLE ligas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre           TEXT NOT NULL,
  temporada        TEXT NOT NULL DEFAULT '',   -- ej: "2026", "Verano 2026"
  descripcion      TEXT,
  logo_url         TEXT,
  -- Default game config — overrideable by tournament or individual game
  innings          INTEGER NOT NULL DEFAULT 9 CHECK (innings BETWEEN 3 AND 15),
  innings_minimos  INTEGER NOT NULL DEFAULT 5 CHECK (innings_minimos BETWEEN 3 AND 15),
  outs_por_entrada INTEGER NOT NULL DEFAULT 3 CHECK (outs_por_entrada IN (2, 3)),
  comisionado_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  activa           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: equipos
-- Un equipo pertenece a una liga.
-- ============================================================

CREATE TABLE equipos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liga_id     UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  abreviatura TEXT NOT NULL CHECK (char_length(abreviatura) BETWEEN 2 AND 4),
  logo_url    TEXT,
  color_primario   TEXT NOT NULL DEFAULT '#ff4d00',
  color_secundario TEXT NOT NULL DEFAULT '#ff8c00',
  -- Dueño / manager del equipo
  dueno_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (liga_id, nombre)
);

-- ============================================================
-- TABLA: jugadores
-- Roster de un equipo.
-- ============================================================

CREATE TABLE jugadores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id   UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  -- Puede estar vinculado a un usuario registrado (opcional)
  usuario_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre      TEXT NOT NULL,
  numero      INTEGER NOT NULL CHECK (numero BETWEEN 0 AND 99),
  posicion    posicion_campo NOT NULL DEFAULT 'DH',
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (equipo_id, numero)
);

-- ============================================================
-- TABLA: torneos
-- Un torneo puede pertenecer a una liga o existir independiente.
-- ============================================================

CREATE TABLE torneos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- liga_id puede ser NULL: torneo puede existir sin liga
  liga_id     UUID REFERENCES ligas(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  formato     formato_torneo NOT NULL DEFAULT 'SE',
  estado      estado_torneo  NOT NULL DEFAULT 'draft',
  -- Override de configuración de juego — NULL = hereda de liga
  innings_override       INTEGER CHECK (innings_override BETWEEN 3 AND 15),
  outs_por_entrada_override INTEGER CHECK (outs_por_entrada_override IN (2, 3)),
  fecha_inicio DATE,
  fecha_fin    DATE,
  organizador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: inscripciones
-- Equipos inscritos en un torneo.
-- ============================================================

CREATE TABLE inscripciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  torneo_id   UUID NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  equipo_id   UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  tipo        tipo_inscripcion NOT NULL DEFAULT 'self',
  seed        INTEGER,  -- posición de cabeza de serie en el bracket
  inscrito_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (torneo_id, equipo_id)
);

-- ============================================================
-- TABLA: knockout_rules
-- Reglas de misericordia — polimórfico: liga | torneo | partido
-- Jerarquía: liga (default) → torneo (override) → partido (override manual)
-- ============================================================

CREATE TABLE knockout_rules (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Solo uno de estos puede ser NOT NULL a la vez
  liga_id              UUID REFERENCES ligas(id)    ON DELETE CASCADE,
  torneo_id            UUID REFERENCES torneos(id)  ON DELETE CASCADE,
  partido_id           UUID,  -- FK se agrega después de crear partidos
  diferencia_carreras  INTEGER NOT NULL CHECK (diferencia_carreras > 0),
  desde_entrada        INTEGER NOT NULL CHECK (desde_entrada >= 1),
  activa               BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraint: exactamente uno de los tres FK debe estar presente
  CONSTRAINT knockout_exactamente_un_dueno CHECK (
    (liga_id IS NOT NULL)::INTEGER +
    (torneo_id IS NOT NULL)::INTEGER +
    (partido_id IS NOT NULL)::INTEGER = 1
  )
);

-- ============================================================
-- TABLA: partidos
-- Los 3 tipos: liga | torneo | interno
-- ============================================================

CREATE TABLE partidos (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- liga_id puede ser NULL para partidos de torneo independiente
  liga_id              UUID REFERENCES ligas(id)    ON DELETE RESTRICT,
  torneo_id            UUID REFERENCES torneos(id)  ON DELETE RESTRICT,
  equipo_local_id      UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  equipo_visitante_id  UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  scorer_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo                 tipo_partido   NOT NULL,
  estado               estado_partido NOT NULL DEFAULT 'pending',
  fecha                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Número de entrada actual (1-indexed)
  entrada_actual       INTEGER NOT NULL DEFAULT 1 CHECK (entrada_actual >= 1),
  media_entrada_actual media_entrada NOT NULL DEFAULT 'top',
  -- Override de innings — NULL = hereda de liga/torneo/default
  innings_override     INTEGER CHECK (innings_override BETWEEN 3 AND 15),
  -- Score
  carreras_local       INTEGER NOT NULL DEFAULT 0 CHECK (carreras_local >= 0),
  carreras_visitante   INTEGER NOT NULL DEFAULT 0 CHECK (carreras_visitante >= 0),
  hits_local           INTEGER NOT NULL DEFAULT 0 CHECK (hits_local >= 0),
  hits_visitante       INTEGER NOT NULL DEFAULT 0 CHECK (hits_visitante >= 0),
  errores_local        INTEGER NOT NULL DEFAULT 0 CHECK (errores_local >= 0),
  errores_visitante    INTEGER NOT NULL DEFAULT 0 CHECK (errores_visitante >= 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un equipo no puede jugar contra sí mismo
  CONSTRAINT equipos_distintos CHECK (equipo_local_id <> equipo_visitante_id),
  -- Los partidos de liga deben tener liga_id
  CONSTRAINT liga_requerida_para_tipo_liga CHECK (
    tipo <> 'liga' OR liga_id IS NOT NULL
  ),
  -- Los partidos de torneo deben tener torneo_id
  CONSTRAINT torneo_requerido_para_tipo_torneo CHECK (
    tipo <> 'torneo' OR torneo_id IS NOT NULL
  )
);

-- Ahora que existe la tabla partidos, agregar el FK de knockout_rules
ALTER TABLE knockout_rules
  ADD CONSTRAINT knockout_rules_partido_id_fkey
  FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE;

-- ============================================================
-- TABLA: jugadas
-- Play-by-play. Una fila por jugada anotada en el scorer.
-- ============================================================

CREATE TABLE jugadas (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id         UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id         UUID NOT NULL REFERENCES jugadores(id) ON DELETE RESTRICT,
  tipo               tipo_jugada NOT NULL,
  entrada            INTEGER NOT NULL CHECK (entrada >= 1),
  media_entrada      media_entrada NOT NULL,
  carreras_anotadas  INTEGER NOT NULL DEFAULT 0 CHECK (carreras_anotadas >= 0),
  descripcion        TEXT,
  -- Si es juego interno, registrar a qué grupo pertenece el bateador
  grupo_nombre       TEXT,
  anotado_por        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  anotado_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: juego_grupos
-- Solo para partidos internos. Define los 2 grupos.
-- ============================================================

CREATE TABLE juego_grupos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id  UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,  -- 'Grupo A' | 'Grupo B'
  color       TEXT NOT NULL DEFAULT '#ff4d00',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (partido_id, nombre)
);

-- ============================================================
-- TABLA: grupo_jugadores
-- Qué jugadores del roster fueron asignados a cada grupo.
-- ============================================================

CREATE TABLE grupo_jugadores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo_id    UUID NOT NULL REFERENCES juego_grupos(id) ON DELETE CASCADE,
  jugador_id  UUID NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  UNIQUE (grupo_id, jugador_id)
);

-- ============================================================
-- TABLA: apuntes
-- Notas internas — pueden vincularse a un partido o ser generales.
-- ============================================================

CREATE TABLE apuntes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id   UUID REFERENCES partidos(id) ON DELETE SET NULL,
  -- Equipo al que pertenece el apunte (para filtrar por miembros)
  equipo_id    UUID REFERENCES equipos(id) ON DELETE CASCADE,
  usuario_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  contenido    TEXT NOT NULL,
  visibilidad  visibilidad_apunte NOT NULL DEFAULT 'privado',
  categoria    categoria_apunte   NOT NULL DEFAULT 'general',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: roles_usuario
-- Tabla de membresía para manejar roles por equipo/liga.
-- auth.users tiene el usuario; aquí definimos su rol en cada contexto.
-- ============================================================

CREATE TABLE roles_usuario (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol         rol_usuario NOT NULL,
  -- El rol puede ser en el contexto de una liga o un equipo
  liga_id     UUID REFERENCES ligas(id)   ON DELETE CASCADE,
  equipo_id   UUID REFERENCES equipos(id) ON DELETE CASCADE,
  asignado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, liga_id, equipo_id, rol),
  -- Debe tener al menos un contexto
  CONSTRAINT rol_debe_tener_contexto CHECK (
    liga_id IS NOT NULL OR equipo_id IS NOT NULL
  )
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================

-- Partidos: búsqueda por liga, torneo, tipo, estado
CREATE INDEX idx_partidos_liga_id      ON partidos(liga_id);
CREATE INDEX idx_partidos_torneo_id    ON partidos(torneo_id);
CREATE INDEX idx_partidos_tipo_estado  ON partidos(tipo, estado);
CREATE INDEX idx_partidos_fecha        ON partidos(fecha DESC);

-- Jugadas: búsqueda por partido y jugador
CREATE INDEX idx_jugadas_partido_id    ON jugadas(partido_id);
CREATE INDEX idx_jugadas_jugador_id    ON jugadas(jugador_id);
CREATE INDEX idx_jugadas_entrada       ON jugadas(partido_id, entrada, media_entrada);

-- Jugadores: búsqueda por equipo
CREATE INDEX idx_jugadores_equipo_id   ON jugadores(equipo_id);
CREATE INDEX idx_jugadores_usuario_id  ON jugadores(usuario_id) WHERE usuario_id IS NOT NULL;

-- Roles: búsqueda por usuario
CREATE INDEX idx_roles_usuario_id      ON roles_usuario(usuario_id);
CREATE INDEX idx_roles_liga_id         ON roles_usuario(liga_id) WHERE liga_id IS NOT NULL;
CREATE INDEX idx_roles_equipo_id       ON roles_usuario(equipo_id) WHERE equipo_id IS NOT NULL;

-- Apuntes: búsqueda por equipo y visibilidad
CREATE INDEX idx_apuntes_equipo_id     ON apuntes(equipo_id);
CREATE INDEX idx_apuntes_partido_id    ON apuntes(partido_id) WHERE partido_id IS NOT NULL;

-- Knockout rules: búsqueda por contexto
CREATE INDEX idx_ko_rules_liga_id      ON knockout_rules(liga_id) WHERE liga_id IS NOT NULL;
CREATE INDEX idx_ko_rules_torneo_id    ON knockout_rules(torneo_id) WHERE torneo_id IS NOT NULL;
CREATE INDEX idx_ko_rules_partido_id   ON knockout_rules(partido_id) WHERE partido_id IS NOT NULL;

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_ligas
  BEFORE UPDATE ON ligas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_equipos
  BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_jugadores
  BEFORE UPDATE ON jugadores
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_torneos
  BEFORE UPDATE ON torneos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_partidos
  BEFORE UPDATE ON partidos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_apuntes
  BEFORE UPDATE ON apuntes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
