-- ============================================================
-- ElPlay — Migration 002: Fix RLS bootstrap circular dependency
--
-- Problem: inserting a dueno_equipo/comisionado role requires
-- already having that role → chicken-and-egg on first use.
-- Fix: allow self-assignment based on dueno_id / comisionado_id
-- columns that are set at INSERT time on the parent tables.
-- ============================================================

-- ROLES_USUARIO: allow self-assignment based on natural ownership
DROP POLICY IF EXISTS "roles_insert" ON roles_usuario;
CREATE POLICY "roles_insert" ON roles_usuario FOR INSERT WITH CHECK (
  -- Bootstrap: user assigns themselves comisionado for a liga they own
  (
    rol = 'comisionado'
    AND liga_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM ligas WHERE id = liga_id AND comisionado_id = auth.uid())
  )
  -- Bootstrap: user assigns themselves dueno_equipo for a team they own
  OR (
    rol = 'dueno_equipo'
    AND equipo_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM equipos WHERE id = equipo_id AND dueno_id = auth.uid())
  )
  -- Ongoing: comisionado can assign roles within their liga
  OR (liga_id IS NOT NULL AND public.es_comisionado(liga_id))
  -- Ongoing: dueno_equipo can assign roles within their equipo
  OR (equipo_id IS NOT NULL AND public.es_dueno_equipo(equipo_id))
  -- Self-assignment as miembro (player links their account)
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

-- JUGADORES: also accept dueno_id as a direct check (before role is in DB)
DROP POLICY IF EXISTS "jugadores_insert" ON jugadores;
CREATE POLICY "jugadores_insert" ON jugadores FOR INSERT WITH CHECK (
  -- Has the role assigned
  public.es_dueno_equipo(equipo_id)
  -- OR is the team's natural owner (dueno_id column)
  OR EXISTS (SELECT 1 FROM equipos WHERE id = equipo_id AND dueno_id = auth.uid())
  -- OR is comisionado of the team's league
  OR EXISTS (
    SELECT 1 FROM equipos e
    WHERE e.id = equipo_id AND public.es_comisionado(e.liga_id)
  )
);

-- JUGADORES SELECT: same fix — dueno_id can see all players
DROP POLICY IF EXISTS "jugadores_select_equipo" ON jugadores;
CREATE POLICY "jugadores_select_equipo" ON jugadores FOR SELECT USING (
  public.es_dueno_equipo(equipo_id)
  OR public.es_miembro_equipo(equipo_id)
  OR EXISTS (SELECT 1 FROM equipos WHERE id = equipo_id AND dueno_id = auth.uid())
  OR usuario_id = auth.uid()
);

-- JUGADORES UPDATE: same fix
DROP POLICY IF EXISTS "jugadores_update" ON jugadores;
CREATE POLICY "jugadores_update" ON jugadores FOR UPDATE USING (
  public.es_dueno_equipo(equipo_id)
  OR EXISTS (SELECT 1 FROM equipos WHERE id = equipo_id AND dueno_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM equipos e
    WHERE e.id = equipo_id AND public.es_comisionado(e.liga_id)
  )
);
