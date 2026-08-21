/**
 * Acción de moderación registrada en el historial (data/historial-acciones.json).
 * Guarda IDs, no nombres: si un usuario cambia de nombre, el histórico sigue
 * siendo correcto.
 */
export interface AccionAdmin {
  id: string;
  usuarioId: string;
  adminId: string;
  accion: string;
  descripcion: string;
  fecha: string;
}

/** Acción con los nombres ya resueltos para mostrarla en pantalla. */
export interface AccionAdminVista extends AccionAdmin {
  usuarioNombre: string;
  administrador: string;
}
