/**
 * Publicación de XchanGo (data/publicaciones.json).
 *
 * REGLA CENTRAL: los campos cambian según el tipo. Es una unión discriminada,
 * así que TypeScript rechaza en compilación un `bien_digital` con municipio o
 * un `servicio` con barrio.
 *
 *   Campo                | bien_fisico | servicio | bien_digital
 *   ---------------------|-------------|----------|-------------
 *   municipio            | obligatorio | obligat. |     NO
 *   barrio               | obligatorio |    NO    |     NO
 *   cantidadDisponible   | unidades    | horas... |     NO
 *   disponibilidad       | obligatorio | obligat. |     NO
 *   ofreces / buscas     | obligatorio | obligat. | obligatorio
 *
 * XchanGo es una plataforma de TRUEQUE: no existe precio ni campo monetario.
 */

export type TipoPublicacion = 'bien_fisico' | 'servicio' | 'bien_digital';
export type EstadoPublicacion = 'activa' | 'pausada' | 'finalizada' | 'eliminada';

interface PublicacionBase {
  id: string;
  usuarioId: string;
  categoriaId: string;
  titulo: string;
  descripcion: string;
  /** Qué entrega el dueño. */
  ofreces: string;
  /** Qué espera recibir a cambio. */
  buscas: string;
  imagenes: string[];
  estado: EstadoPublicacion;
  vistas: number;
  fechaCreacion: string;
  /** HU32: igual a fechaCreacion si nunca se editó. */
  fechaModificacion: string;
}

/** Bien físico: municipio + barrio, y cantidad en unidades. */
export interface PublicacionBienFisico extends PublicacionBase {
  tipo: 'bien_fisico';
  municipio: string;
  barrio: string;
  /** Ej.: "1 unidad", "3 unidades". */
  cantidadDisponible: string;
  disponibilidad: string;
}

/** Servicio: solo municipio (sin barrio); cantidad en horas, sesiones o cupos. */
export interface PublicacionServicio extends PublicacionBase {
  tipo: 'servicio';
  municipio: string;
  /** Ej.: "5 sesiones", "4 horas". NO son unidades físicas. */
  cantidadDisponible: string;
  /** Campo clave de un servicio. Ej.: "Lunes y miércoles de 4:00 PM a 7:00 PM". */
  disponibilidad: string;
}

/** Bien digital: entrega inmediata. Sin ubicación, cantidad ni disponibilidad. */
export interface PublicacionBienDigital extends PublicacionBase {
  tipo: 'bien_digital';
}

export type Publicacion =
  | PublicacionBienFisico
  | PublicacionServicio
  | PublicacionBienDigital;

export const ETIQUETA_TIPO: Record<TipoPublicacion, string> = {
  bien_fisico: 'Bien físico',
  servicio: 'Servicio',
  bien_digital: 'Bien digital',
};

/**
 * Clases de badge. Se reutilizan EXCLUSIVAMENTE clases que ya existen en tu
 * CSS, para no alterar ningún estilo:
 *   badge--bienes, badge--servicios, badge--electronicos.
 *
 * Si más adelante quieres un color propio para los bienes digitales, agrega
 * una regla `.badge--digitales` a home.css y cámbiala aquí.
 */
export const CLASE_BADGE_TIPO: Record<TipoPublicacion, string> = {
  bien_fisico: 'badge badge--bienes',
  servicio: 'badge badge--servicios',
  bien_digital: 'badge badge--electronicos',
};

/**
 * Publicación resuelta contra usuarios.json y categorias.json.
 *
 * IMPORTANTE: es un SUPERCONJUNTO exacto de la antigua interfaz `Trueque`.
 * Conserva `imagen`, `autor`, `ciudad`, `avatar`, `favorito`, `categoria`,
 * `imagenes`, `anio`, `publicadoHace`, `descripcion`, `caracteristicas` e
 * `interesesCambio`, de modo que las plantillas y los getters que ya tenías
 * siguen funcionando sin cambios.
 */
export type PublicacionVista = Publicacion & {
  autor: string;
  avatar: string;
  telefono: string;
  /** Municipio, o "Entrega digital" si el tipo es bien_digital. */
  ciudad: string;
  /** NOMBRE de la categoría (para mostrar). El ID sigue en `categoriaId`. */
  categoria: string;
  /** Primera imagen, con respaldo si la publicación no tiene ninguna. */
  imagen: string;
  favorito: boolean;
  /** Texto legible del tipo: "Bien físico", "Servicio", "Bien digital". */
  tipoEtiqueta: string;
  claseBadge: string;
  /** Ficha técnica ya adaptada al tipo de publicación. */
  caracteristicas: { label: string; valor: string }[];
  /** Lo que el dueño busca, separado en etiquetas. */
  interesesCambio: string[];
  publicadoHace: string;
  anio?: number;
  /** Cantidad de solicitudes de trueque recibidas. */
  propuestas: number;
};

export const esBienFisico = (p: Publicacion): p is PublicacionBienFisico =>
  p.tipo === 'bien_fisico';

export const esServicio = (p: Publicacion): p is PublicacionServicio =>
  p.tipo === 'servicio';

export const esBienDigital = (p: Publicacion): p is PublicacionBienDigital =>
  p.tipo === 'bien_digital';

/** true si el tipo maneja ubicación física (bien_fisico o servicio). */
export const tieneUbicacion = (
  p: Publicacion
): p is PublicacionBienFisico | PublicacionServicio => p.tipo !== 'bien_digital';
