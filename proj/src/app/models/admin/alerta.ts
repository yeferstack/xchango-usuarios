export interface Alerta {
  id: string;
  tipo: 'sospechosa' | 'moderacion' | 'sistema' | 'usuario';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  prioridad: 'baja' | 'media' | 'alta';
}