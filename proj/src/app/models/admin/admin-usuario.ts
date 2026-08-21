export interface AdminUsuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'moderador';
  estado: 'activo' | 'inactivo';
  avatar?: string;
  ultimoAcceso?: string;
}