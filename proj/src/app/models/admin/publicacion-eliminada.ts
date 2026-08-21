/**
 * Publicación retirada por moderación (data/publicaciones-eliminadas.json).
 * Solo claves foráneas: el nombre del usuario y del administrador se resuelven
 * en el servicio para no duplicar información.
 */
export interface PublicacionEliminada {
  id: string;
  publicacionId: string;
  usuarioId: string;
  adminId: string;
  motivo: string;
  fecha: string;
}

/** Registro enriquecido para la pestaña "Eliminadas" del panel de moderación. */
export interface PublicacionEliminadaVista extends PublicacionEliminada {
  titulo: string;
  usuarioNombre: string;
  administrador: string;
}
