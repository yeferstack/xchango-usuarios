/**
 * Aviso dirigido a un usuario (data/notificaciones.json). Cubre HU44, HU46,
 * HU47, HU53, HU54, HU58 y HU59.
 *
 * ESTO NO ES UN CHAT. No hay emisor, ni hilo, ni respuesta, ni conversación
 * almacenada: es un aviso de una sola vía que le dice al usuario que ocurrió
 * algo. La negociación real sigue ocurriendo en WhatsApp.
 *
 * `alertas.json` no servía para esto: es del panel admin y no tiene usuarioId.
 */
export type TipoNotificacion =
  | 'solicitud'     // HU44: alguien propuso un trueque
  | 'aceptada'      // HU46
  | 'rechazada'     // HU47
  | 'completada'    // HU53: trueque cerrado, ya se puede calificar
  | 'recordatorio'  // HU58, HU59: solicitudes sin responder o publicaciones inactivas
  | 'verificacion'  // HU15-HU17
  | 'moderacion';   // HU73, HU74: advertencia o publicación retirada

export interface Notificacion {
  id: string;
  /** Destinatario del aviso. */
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  /** ID del trueque o publicación relacionada. null si el aviso es general. */
  referenciaId: string | null;
  leida: boolean;
  fecha: string;
}
