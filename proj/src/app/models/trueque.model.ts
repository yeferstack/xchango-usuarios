/**
 * Trueque = solicitud de intercambio entre dos usuarios (data/trueques.json).
 *
 * OJO: antes este archivo contenía la interfaz de una PUBLICACIÓN. Ahora las
 * publicaciones viven en `models/publicacion.model.ts` y aquí queda la entidad
 * central de XchanGo, que antes no existía en ninguna parte del proyecto.
 *
 * Flujo: usuario A ofrece algo -> usuario B ofrece algo -> negocian por
 * WhatsApp -> realizan el trueque. No hay dinero en ningún punto.
 */

export type EstadoTrueque =
  | 'pendiente'
  | 'aceptado'
  | 'rechazado'
  | 'completado';

export interface Trueque {
  id: string;
  /** Usuario que propone el intercambio. */
  solicitanteId: string;
  /** Usuario dueño de la publicación. */
  propietarioId: string;
  publicacionId: string;
  /** Lo que entrega el solicitante. */
  ofrece: string;
  /** Lo que el solicitante quiere recibir (normalmente el bien publicado). */
  busca: string;
  estado: EstadoTrueque;
  fechaSolicitud: string;
  /** Fecha de cierre; null mientras el trueque siga abierto. */
  fechaCierre: string | null;

  /** HU51: ambas partes deben confirmar para pasar a 'completado'. */
  confirmadoSolicitante: boolean;
  confirmadoPropietario: boolean;

  /** HU53: nota de 1 a 5 que DA cada parte; null si aún no calificó. */
  calificacionSolicitante: number | null;
  calificacionPropietario: number | null;
}

/** Trueque resuelto contra usuarios.json y publicaciones.json. */
export interface TruequeVista extends Trueque {
  solicitanteNombre: string;
  solicitanteAvatar: string;
  solicitanteTelefono: string;
  propietarioNombre: string;
  propietarioTelefono: string;
  publicacionTitulo: string;
}

export const ETIQUETA_ESTADO_TRUEQUE: Record<EstadoTrueque, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  completado: 'Completado',
};
