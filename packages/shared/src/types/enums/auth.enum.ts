/** Roles del sistema — definen qué puede hacer cada usuario */
export enum RolUsuario {
  Comisionado  = 'comisionado',   // Dueño de la liga — máximo poder
  DuenoEquipo  = 'dueno_equipo',  // Capitán/manager del equipo
  Scorer       = 'scorer',        // Anotador asignado a un partido
  Miembro      = 'miembro',       // Jugador del roster del equipo
  Publico      = 'publico',       // Sin cuenta — solo lectura pública
}
