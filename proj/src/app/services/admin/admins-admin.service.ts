import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminUsuario } from '../../models/admin/admin-usuario';

/** Forma cruda del JSON: igual que AdminUsuario pero con password. */
interface AdminConPassword extends AdminUsuario {
  password: string;
}

const CLAVE_SESION = 'xchango_admin';

@Injectable({ providedIn: 'root' })
export class AdminsAdminService {
  private readonly http = inject(HttpClient);

  /** Sesión activa. La leemos de localStorage para sobrevivir a un F5. */
  private readonly _admin = signal<AdminUsuario | null>(this.leerSesion());
  private readonly _cargando = signal(false);

  readonly admin = this._admin.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly autenticado = computed(() => this._admin() !== null);

  /**
   * Login contra /data/admins.json.
   * Cuando exista NestJS, esto se vuelve un POST /api/admin/login
   * y el resto de la app no se entera.
   */
  async login(email: string, password: string): Promise<AdminUsuario> {
    this._cargando.set(true);
    try {
      const admins = await firstValueFrom(
        this.http.get<AdminConPassword[]>('data/admins.json')
      );

      const encontrado = admins.find(
        a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      );

      if (!encontrado) throw new Error('Correo o contraseña incorrectos.');
      if (encontrado.estado === 'inactivo') throw new Error('Esta cuenta está inactiva.');

      // Nunca guardamos la contraseña en la sesión
      const { password: _omitida, ...datos } = encontrado;
      const sesion: AdminUsuario = { ...datos, ultimoAcceso: new Date().toISOString() };

      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      this._admin.set(sesion);
      return sesion;
    } finally {
      this._cargando.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem(CLAVE_SESION);
    this._admin.set(null);
  }

  /** ID del admin en sesión. Es lo que se guarda en el historial. */
  idActual(): string {
    return this._admin()?.id ?? 'a1';
  }

  /** Nombre del admin en sesión, solo para mostrar en pantalla. */
  nombreActual(): string {
    return this._admin()?.nombre ?? 'Administrador';
  }

  private leerSesion(): AdminUsuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE_SESION);
      return guardado ? (JSON.parse(guardado) as AdminUsuario) : null;
    } catch {
      return null;
    }
  }
}
