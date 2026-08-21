/**
 * Reporte de una publicación (data/publicaciones-reportadas.json).
 *
 * El JSON guarda SOLO los datos del reporte más claves foráneas. El título, el
 * dueño y la categoría ya no se duplican aquí: los resuelve
 * `PublicacionesAdminService` contra publicaciones.json y usuarios.json.
 */
export type EstadoReporte = 'pendiente' | 'aprobada' | 'eliminada';
export type GravedadReporte = 'baja' | 'media' | 'alta';

/** Forma cruda tal como está en el JSON. */
export interface Reporte {
  id: string;
  publicacionId: string;
  /** Usuario que levantó el reporte. */
  reportanteId: string;
  motivo: string;
  fecha: string;
  estado: EstadoReporte;
  gravedad: GravedadReporte;
}

/**
 * Reporte enriquecido con los datos de la publicación y su dueño.
 *
 * Conserva los nombres `titulo`, `usuarioId`, `usuarioNombre` y `categoria` que
 * ya usaban `moderacion.html` y `moderacion.ts`, de modo que la normalización
 * del JSON no obliga a reescribir la vista.
 */
export interface PublicacionReportada extends Reporte {
  titulo: string;
  usuarioId: string;
  usuarioNombre: string;
  categoria: string;
  tipo: string;
  reportanteNombre: string;
}
