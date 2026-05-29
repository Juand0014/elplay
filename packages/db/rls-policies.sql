-- ============================================================
-- ElPlay — Row Level Security Policies
-- Roles: comisionado | dueno_equipo | scorer | miembro | publico
-- REGLA: NUNCA validar permisos solo en el frontend.
--        Todo permiso se enforcea a nivel DB.
-- ============================================================

-- ============================================================
-- FUNCIONES HELPER
-- Encapsulan queries de rol para reutilizar en policies.
-- ============================================================

-- Devuelve true si el usuario actual es comisionado de una liga dada
CREATE OR REPLACE FUNCTION auth.es_comisionado(p_liga_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid()
      AND liga_id    = p_liga_id
      AND rol        = 'comisionado'
  );
$$;

-- Devuelve true si el usuario actual es dueño del equipo dado
CREATE OR REPLACE FUNCTION auth.es_dueno_equipo(p_equipo_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid()
      AND equipo_id  = p_equipo_id
      AND rol        = 'dueno_equipo'
  );
$$;

-- Devuelve true si el usuario actual es scorer del equipo dado
CREATE OR REPLACE FUNCTION auth.es_scorer(p_equipo_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid()
      AND equipo_id  = p_equipo_id
      AND rol        IN ('scorer', 'dueno_equipo', 'comisionado')
  );
$$;

-- Devuelve true si el usuario es miembro del equipo (cualquier rol con acceso al equipo)
CREATE OR REPLACE FUNCTION auth.es_miembro_equipo(p_equipo_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid()
      AND equipo_id  = p_equipo_id
      AND rol        IN ('dueno_equipo', 'scorer', 'miembro')
  );
$$;

-- Devuelve true si el usuario tiene cualquier rol en la liga dada
CREATE OR REPLACE FUNCTION auth.tiene_acceso_liga(p_liga_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles_usuario
    WHERE usuario_id = auth.uid()
      AND liga_id    = p_liga_id
  )
  OR EXISTS (
    SELECT 1 FROM roles_usuario ru
    JOIN equipos e ON e.id = ru.equipo_id
    WHERE ru.usuario_id = auth.uid()
      AND e.liga_id     = p_liga_id
  );
$$;

-- Devuelve true si el usuario puede anotar en un partido específico
CREATE OR REPLACE FUNCTION auth.puede_anotar_partido(p_partido_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM partidos p
    WHERE p.id = p_partido_id
      AND (
        -- Es el scorer asignado
        p.scorer_id = auth.uid()
        -- O es dueño del equipo local
        OR auth.es_dueno_equipo(p.equipo_local_id)
        -- O es dueño del equipo visitante
        OR auth.es_dueno_equipo(p.equipo_visitante_id)
        -- O es comisionado de la liga
        OR (p.liga_id IS NOT NULL AND auth.es_comisionado(p.liga_id))
      )
  );
$$;

-- ============================================================
-- RLS: LIGAS
-- ============================================================

ALTER TABLE ligas ENABLE ROW LEVEL SECURITY;

-- SELECT: todos pueden ver ligas activas (dashboard público)
CREATE POLICY "ligas_select_publico"
  ON ligas FOR SELECT
  USING (activa = true);

-- SELECT: el comisionado puede ver sus ligas aunque estén inactivas
CREATE POLICY "ligas_select_comisionado"
  ON ligas FOR SELECT
  USING (comisionado_id = auth.uid());

-- INSERT: cualquier usuario autenticado puede crear una liga (se convierte en comisionado)
CREATE POLICY "ligas_insert_autenticado"
  ON ligas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND comisionado_id = auth.uid());

-- UPDATE: solo el comisionado puede modificar su liga
CREATE POLICY "ligas_update_comisionado"
  ON ligas FOR UPDATE
  USING (comisionado_id = auth.uid())
  WITH CHECK (comisionado_id = auth.uid());

-- DELETE: solo el comisionado (soft delete con activa = false preferible)
CREATE POLICY "ligas_delete_comisionado"
  ON ligas FOR DELETE
  USING (comisionado_id = auth.uid());

-- ============================================================
-- RLS: EQUIPOS
-- ============================================================

ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;

-- SELECT: equipos activos de ligas activas son públicos
CREATE POLICY "equipos_select_publico"
  ON equipos FOR SELECT
  USING (
    activo = true
    AND EXISTS (
      SELECT 1 FROM ligas l WHERE l.id = liga_id AND l.activa = true
    )
  );

-- SELECT: el dueño puede ver su equipo aunque esté inactivo
CREATE POLICY "equipos_select_dueno"
  ON equipos FOR SELECT
  USING (dueno_id = auth.uid());

-- INSERT: comisionado de la liga O usuario autenticado creando su equipo
CREATE POLICY "equipos_insert"
  ON equipos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      auth.es_comisionado(liga_id)
      OR dueno_id = auth.uid()
    )
  );

-- UPDATE: comisionado de la liga O dueño del equipo
CREATE POLICY "equipos_update"
  ON equipos FOR UPDATE
  USING (
    auth.es_comisionado(liga_id)
    OR dueno_id = auth.uid()
  )
  WITH CHECK (
    auth.es_comisionado(liga_id)
    OR dueno_id = auth.uid()
  );

-- DELETE: solo comisionado
CREATE POLICY "equipos_delete_comisionado"
  ON equipos FOR DELETE
  USING (auth.es_comisionado(liga_id));

-- ============================================================
-- RLS: JUGADORES
-- ============================================================

ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;

-- SELECT: jugadores de equipos activos son públicos
CREATE POLICY "jugadores_select_publico"
  ON jugadores FOR SELECT
  USING (
    activo = true
    AND EXISTS (
      SELECT 1 FROM equipos e
      JOIN ligas l ON l.id = e.liga_id
      WHERE e.id = equipo_id AND e.activo = true AND l.activa = true
    )
  );

-- SELECT: dueño y miembros del equipo pueden ver todos (activos e inactivos)
CREATE POLICY "jugadores_select_equipo"
  ON jugadores FOR SELECT
  USING (
    auth.es_dueno_equipo(equipo_id)
    OR auth.es_miembro_equipo(equipo_id)
    OR usuario_id = auth.uid()
  );

-- INSERT: comisionado de la liga o dueño del equipo
CREATE POLICY "jugadores_insert"
  ON jugadores FOR INSERT
  WITH CHECK (
    auth.es_dueno_equipo(equipo_id)
    OR EXISTS (
      SELECT 1 FROM equipos e WHERE e.id = equipo_id AND auth.es_comisionado(e.liga_id)
    )
  );

-- UPDATE: comisionado o dueño del equipo
CREATE POLICY "jugadores_update"
  ON jugadores FOR UPDATE
  USING (
    auth.es_dueno_equipo(equipo_id)
    OR EXISTS (
      SELECT 1 FROM equipos e WHERE e.id = equipo_id AND auth.es_comisionado(e.liga_id)
    )
  );

-- ============================================================
-- RLS: TORNEOS
-- ============================================================

ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;

-- SELECT: torneos activos son públicos; drafts solo para el organizador
CREATE POLICY "torneos_select"
  ON torneos FOR SELECT
  USING (
    estado <> 'draft'
    OR organizador_id = auth.uid()
    OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
  );

-- INSERT: comisionado de la liga o cualquier usuario autenticado (torneo sin liga)
CREATE POLICY "torneos_insert"
  ON torneos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND organizador_id = auth.uid()
    AND (
      liga_id IS NULL
      OR auth.es_comisionado(liga_id)
    )
  );

-- UPDATE: organizador o comisionado de la liga
CREATE POLICY "torneos_update"
  ON torneos FOR UPDATE
  USING (
    organizador_id = auth.uid()
    OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
  );

-- ============================================================
-- RLS: INSCRIPCIONES
-- ============================================================

ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- SELECT: público para torneos no-draft
CREATE POLICY "inscripciones_select"
  ON inscripciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.estado <> 'draft'
    )
  );

-- INSERT: el dueño del equipo se inscribe, o el organizador inscribe manualmente
CREATE POLICY "inscripciones_insert"
  ON inscripciones FOR INSERT
  WITH CHECK (
    auth.es_dueno_equipo(equipo_id)
    OR EXISTS (
      SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid()
    )
  );

-- DELETE: el dueño del equipo se desinscribe, o el organizador elimina
CREATE POLICY "inscripciones_delete"
  ON inscripciones FOR DELETE
  USING (
    auth.es_dueno_equipo(equipo_id)
    OR EXISTS (
      SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid()
    )
  );

-- ============================================================
-- RLS: KNOCKOUT_RULES
-- ============================================================

ALTER TABLE knockout_rules ENABLE ROW LEVEL SECURITY;

-- SELECT: público (necesario para el scorer engine y dashboard público)
CREATE POLICY "ko_rules_select_publico"
  ON knockout_rules FOR SELECT
  USING (activa = true);

-- INSERT: solo el comisionado (liga), organizador (torneo) o scorer del partido
CREATE POLICY "ko_rules_insert"
  ON knockout_rules FOR INSERT
  WITH CHECK (
    (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
    OR (torneo_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid()
    ))
    OR (partido_id IS NOT NULL AND auth.puede_anotar_partido(partido_id))
  );

-- UPDATE/DELETE: mismo criterio que INSERT
CREATE POLICY "ko_rules_update"
  ON knockout_rules FOR UPDATE
  USING (
    (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
    OR (torneo_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid()
    ))
    OR (partido_id IS NOT NULL AND auth.puede_anotar_partido(partido_id))
  );

-- ============================================================
-- RLS: PARTIDOS
-- ============================================================

ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;

-- SELECT: partidos de liga/torneo son públicos; internos solo para miembros del equipo
CREATE POLICY "partidos_select_publico"
  ON partidos FOR SELECT
  USING (tipo <> 'interno');

-- SELECT: partidos internos — solo miembros del equipo local (el dueño del equipo interno)
CREATE POLICY "partidos_select_interno"
  ON partidos FOR SELECT
  USING (
    tipo = 'interno'
    AND (
      auth.es_miembro_equipo(equipo_local_id)
      OR auth.es_dueno_equipo(equipo_local_id)
      OR auth.es_scorer(equipo_local_id)
      OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
    )
  );

-- INSERT: comisionado (liga), dueño de equipo (interno), o scorer asignado
CREATE POLICY "partidos_insert"
  ON partidos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- Partido de liga: necesita ser comisionado
      (tipo = 'liga' AND liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
      -- Partido de torneo: organizador o comisionado
      OR (tipo = 'torneo' AND torneo_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM torneos t WHERE t.id = torneo_id AND t.organizador_id = auth.uid()
      ))
      OR (tipo = 'torneo' AND liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
      -- Partido interno: dueño del equipo
      OR (tipo = 'interno' AND auth.es_dueno_equipo(equipo_local_id))
    )
  );

-- UPDATE: quien puede anotar puede actualizar (score, estado, etc.)
CREATE POLICY "partidos_update"
  ON partidos FOR UPDATE
  USING (auth.puede_anotar_partido(id));

-- ============================================================
-- RLS: JUGADAS
-- ============================================================

ALTER TABLE jugadas ENABLE ROW LEVEL SECURITY;

-- SELECT: jugadas de partidos públicos son públicas
CREATE POLICY "jugadas_select_publico"
  ON jugadas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partidos p
      WHERE p.id = partido_id AND p.tipo <> 'interno'
    )
  );

-- SELECT: jugadas de partidos internos — solo miembros del equipo
CREATE POLICY "jugadas_select_interno"
  ON jugadas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partidos p
      WHERE p.id = partido_id
        AND p.tipo = 'interno'
        AND (
          auth.es_miembro_equipo(p.equipo_local_id)
          OR auth.es_dueno_equipo(p.equipo_local_id)
          OR auth.es_scorer(p.equipo_local_id)
        )
    )
  );

-- INSERT: solo quien puede anotar el partido
CREATE POLICY "jugadas_insert"
  ON jugadas FOR INSERT
  WITH CHECK (
    auth.puede_anotar_partido(partido_id)
    AND anotado_por = auth.uid()
  );

-- DELETE: quien puede anotar puede corregir/eliminar jugadas
CREATE POLICY "jugadas_delete"
  ON jugadas FOR DELETE
  USING (auth.puede_anotar_partido(partido_id));

-- ============================================================
-- RLS: JUEGO_GRUPOS
-- ============================================================

ALTER TABLE juego_grupos ENABLE ROW LEVEL SECURITY;

-- SELECT: miembros del equipo del partido
CREATE POLICY "juego_grupos_select"
  ON juego_grupos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partidos p
      WHERE p.id = partido_id
        AND (
          auth.es_miembro_equipo(p.equipo_local_id)
          OR auth.es_dueno_equipo(p.equipo_local_id)
          OR auth.es_scorer(p.equipo_local_id)
        )
    )
  );

-- INSERT/UPDATE/DELETE: dueño del equipo o scorer asignado
CREATE POLICY "juego_grupos_insert"
  ON juego_grupos FOR INSERT
  WITH CHECK (auth.puede_anotar_partido(partido_id));

CREATE POLICY "juego_grupos_update"
  ON juego_grupos FOR UPDATE
  USING (auth.puede_anotar_partido(partido_id));

CREATE POLICY "juego_grupos_delete"
  ON juego_grupos FOR DELETE
  USING (auth.puede_anotar_partido(partido_id));

-- ============================================================
-- RLS: GRUPO_JUGADORES
-- ============================================================

ALTER TABLE grupo_jugadores ENABLE ROW LEVEL SECURITY;

-- SELECT: miembros del equipo
CREATE POLICY "grupo_jugadores_select"
  ON grupo_jugadores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM juego_grupos jg
      JOIN partidos p ON p.id = jg.partido_id
      WHERE jg.id = grupo_id
        AND (
          auth.es_miembro_equipo(p.equipo_local_id)
          OR auth.es_dueno_equipo(p.equipo_local_id)
        )
    )
  );

-- INSERT/DELETE: dueño del equipo o scorer
CREATE POLICY "grupo_jugadores_insert"
  ON grupo_jugadores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM juego_grupos jg
      WHERE jg.id = grupo_id AND auth.puede_anotar_partido(jg.partido_id)
    )
  );

CREATE POLICY "grupo_jugadores_delete"
  ON grupo_jugadores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM juego_grupos jg
      WHERE jg.id = grupo_id AND auth.puede_anotar_partido(jg.partido_id)
    )
  );

-- ============================================================
-- RLS: APUNTES
-- ============================================================

ALTER TABLE apuntes ENABLE ROW LEVEL SECURITY;

-- SELECT: apuntes públicos son visibles para todos
CREATE POLICY "apuntes_select_publico"
  ON apuntes FOR SELECT
  USING (visibilidad = 'publico');

-- SELECT: apuntes de equipo — solo miembros del equipo
CREATE POLICY "apuntes_select_equipo"
  ON apuntes FOR SELECT
  USING (
    visibilidad = 'equipo'
    AND equipo_id IS NOT NULL
    AND (
      auth.es_miembro_equipo(equipo_id)
      OR auth.es_dueno_equipo(equipo_id)
      OR auth.es_scorer(equipo_id)
    )
  );

-- SELECT: apuntes privados — solo el autor
CREATE POLICY "apuntes_select_privado"
  ON apuntes FOR SELECT
  USING (
    visibilidad = 'privado'
    AND usuario_id = auth.uid()
  );

-- INSERT: cualquier usuario autenticado puede crear apuntes
CREATE POLICY "apuntes_insert"
  ON apuntes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND usuario_id = auth.uid()
  );

-- UPDATE: solo el autor puede editar
CREATE POLICY "apuntes_update"
  ON apuntes FOR UPDATE
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- DELETE: solo el autor o el comisionado de la liga (para moderar)
CREATE POLICY "apuntes_delete"
  ON apuntes FOR DELETE
  USING (
    usuario_id = auth.uid()
    OR (
      equipo_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM equipos e WHERE e.id = equipo_id AND auth.es_comisionado(e.liga_id)
      )
    )
  );

-- ============================================================
-- RLS: ROLES_USUARIO
-- ============================================================

ALTER TABLE roles_usuario ENABLE ROW LEVEL SECURITY;

-- SELECT: cada usuario puede ver sus propios roles
CREATE POLICY "roles_select_propio"
  ON roles_usuario FOR SELECT
  USING (usuario_id = auth.uid());

-- SELECT: el comisionado puede ver todos los roles de su liga
CREATE POLICY "roles_select_comisionado"
  ON roles_usuario FOR SELECT
  USING (
    liga_id IS NOT NULL AND auth.es_comisionado(liga_id)
  );

-- SELECT: el dueño puede ver roles de su equipo
CREATE POLICY "roles_select_dueno"
  ON roles_usuario FOR SELECT
  USING (
    equipo_id IS NOT NULL AND auth.es_dueno_equipo(equipo_id)
  );

-- INSERT: el comisionado asigna roles de liga; el dueño asigna roles de equipo
CREATE POLICY "roles_insert"
  ON roles_usuario FOR INSERT
  WITH CHECK (
    (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
    OR (equipo_id IS NOT NULL AND auth.es_dueno_equipo(equipo_id))
    -- Un usuario puede auto-asignarse como miembro si es jugador del equipo
    OR (
      rol = 'miembro'
      AND equipo_id IS NOT NULL
      AND usuario_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM jugadores j
        WHERE j.equipo_id = roles_usuario.equipo_id
          AND j.usuario_id = auth.uid()
      )
    )
  );

-- DELETE: comisionado elimina de liga; dueño elimina de equipo; usuario se elimina a sí mismo
CREATE POLICY "roles_delete"
  ON roles_usuario FOR DELETE
  USING (
    usuario_id = auth.uid()
    OR (liga_id IS NOT NULL AND auth.es_comisionado(liga_id))
    OR (equipo_id IS NOT NULL AND auth.es_dueno_equipo(equipo_id))
  );
