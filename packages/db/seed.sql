-- ============================================================
-- ElPlay — Seed Data para Desarrollo
-- ============================================================

-- NOTA: Este seed asume que ya existen usuarios en auth.users.
-- Para desarrollo local con Supabase, crea los usuarios manualmente
-- o usa supabase auth signup desde la CLI.

-- UUIDs de usuarios de prueba (para dev local)
-- Reemplazar con los IDs reales después de crear los usuarios en auth.
DO $$
DECLARE
  comisionado_id  UUID := '00000000-0000-0000-0000-000000000001';
  dueno1_id       UUID := '00000000-0000-0000-0000-000000000002';
  dueno2_id       UUID := '00000000-0000-0000-0000-000000000003';
  scorer1_id      UUID := '00000000-0000-0000-0000-000000000004';
  liga_id         UUID := uuid_generate_v4();
  equipo1_id      UUID := uuid_generate_v4();
  equipo2_id      UUID := uuid_generate_v4();
  torneo1_id      UUID := uuid_generate_v4();
BEGIN

  -- Liga de prueba
  INSERT INTO ligas (id, nombre, descripcion, comisionado_id, innings, innings_minimos)
  VALUES (
    liga_id,
    'Liga Sábado Bella Vista',
    'Liga de softball recreativa, sábados en el parque Bella Vista',
    comisionado_id,
    7,  -- 7 innings por defecto para esta liga
    5
  );

  -- Equipos
  INSERT INTO equipos (id, liga_id, nombre, abreviatura, color_primario, dueno_id)
  VALUES
    (equipo1_id, liga_id, 'Los Tigres',    'TIG', '#ff4d00', dueno1_id),
    (equipo2_id, liga_id, 'Las Águilas',   'AGU', '#3b82f6', dueno2_id);

  -- Jugadores Tigres (9 jugadores)
  INSERT INTO jugadores (equipo_id, nombre, numero, posicion) VALUES
    (equipo1_id, 'Carlos Marte',     10, 'P'),
    (equipo1_id, 'Pedro Santos',     15, 'C'),
    (equipo1_id, 'Juan Rodríguez',    3, '1B'),
    (equipo1_id, 'Miguel Herrera',    7, '2B'),
    (equipo1_id, 'Luis Fernández',   22, '3B'),
    (equipo1_id, 'Rafael Díaz',       5, 'SS'),
    (equipo1_id, 'Andrés García',    14, 'LF'),
    (equipo1_id, 'José Martínez',    18, 'CF'),
    (equipo1_id, 'Daniel López',      9, 'RF'),
    (equipo1_id, 'Ramón Peña',       33, 'DH'),
    (equipo1_id, 'Víctor Cruz',      11, 'P');

  -- Jugadores Águilas (9 jugadores)
  INSERT INTO jugadores (equipo_id, nombre, numero, posicion) VALUES
    (equipo2_id, 'Roberto Vargas',    1, 'P'),
    (equipo2_id, 'Eduardo Castillo',  8, 'C'),
    (equipo2_id, 'Fernando Rojas',   20, '1B'),
    (equipo2_id, 'Héctor Morales',    4, '2B'),
    (equipo2_id, 'Antonio Jiménez',  16, '3B'),
    (equipo2_id, 'Sergio Reyes',      2, 'SS'),
    (equipo2_id, 'Guillermo Torres', 25, 'LF'),
    (equipo2_id, 'Ernesto Flores',   13, 'CF'),
    (equipo2_id, 'Manuel Ríos',       6, 'RF'),
    (equipo2_id, 'Álvaro Medina',    19, 'DH');

  -- Regla de KO de la liga: 15+ carreras desde la 5ta entrada
  INSERT INTO knockout_rules (liga_id, diferencia_carreras, desde_entrada)
  VALUES (liga_id, 15, 5);

  -- Segunda regla KO: 10+ carreras desde la 7ma entrada
  INSERT INTO knockout_rules (liga_id, diferencia_carreras, desde_entrada)
  VALUES (liga_id, 10, 7);

  -- Torneo de prueba
  INSERT INTO torneos (id, liga_id, nombre, formato, estado, organizador_id)
  VALUES (
    torneo1_id,
    liga_id,
    'Copa Bella Vista 2026',
    'SE',
    'open',
    comisionado_id
  );

  -- Roles
  INSERT INTO roles_usuario (usuario_id, rol, liga_id) VALUES
    (comisionado_id, 'comisionado', liga_id);

  INSERT INTO roles_usuario (usuario_id, rol, equipo_id) VALUES
    (dueno1_id,  'dueno_equipo', equipo1_id),
    (dueno2_id,  'dueno_equipo', equipo2_id),
    (scorer1_id, 'scorer',       equipo1_id);

END $$;
