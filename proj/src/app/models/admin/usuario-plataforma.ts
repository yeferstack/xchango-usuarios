import { Usuario, EstadoUsuario, NivelActividad } from '../usuario.model';

/**
 * El panel de administración consume exactamente el mismo usuario que el resto
 * de la aplicación. Se conserva el nombre `UsuarioPlataforma` para no romper los
 * servicios y componentes admin que ya lo importan, pero los campos se definen
 * en un único lugar: `models/usuario.model.ts`.
 */
export interface UsuarioPlataforma extends Usuario {}

export type { EstadoUsuario, NivelActividad };
