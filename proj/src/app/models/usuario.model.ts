/**
 * Usuario de la plataforma (data/usuarios.json).
 *
 * Fuente ÚNICA del modelo de usuario. El panel admin lo reutiliza mediante el
 * alias `UsuarioPlataforma` en `models/admin/usuario-plataforma.ts`.
 */
export type EstadoUsuario = 'activo' | 'suspendido' | 'advertido';
export type NivelActividad = 'bajo' | 'medio' | 'alto';
/** HU03, HU16: estado de verificación de la cuenta. */
export type EstadoVerificacion = 'no_verificado' | 'verificado';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  /** Celular colombiano de 10 dígitos. Es la base del contacto por WhatsApp. */
  telefono: string;
  estado: EstadoUsuario;
  fechaRegistro: string;
  /** Municipio de Casanare donde reside el usuario. */
  ubicacion: string;
  nivelActividad: NivelActividad;
  avatar: string;

  /** HU21: texto libre del perfil. */
  descripcion: string;
  /** HU03/HU16: arranca en 'no_verificado' y pasa a 'verificado'. */
  verificacion: EstadoVerificacion;
  /**
   * HU02/HU06/HU10/HU24-HU26. Texto plano a propósito: esto es una base de
   * datos estática de práctica, NO debe usarse así con un backend real.
   */
  password: string;

  /** HU53: promedio de 1 a 5 recibido en trueques completados (0 si no tiene). */
  calificacion: number;
  totalCalificaciones: number;

  // Contadores derivados de los demás JSON (alimentan ranking y métricas).
  publicaciones: number;
  intercambios: number;
  reportes: number;
}
