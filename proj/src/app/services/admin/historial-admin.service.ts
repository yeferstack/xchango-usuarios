import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { AccionAdmin, AccionAdminVista } from '../../models/admin/accion-admin';
import { AdminUsuario } from '../../models/admin/admin-usuario';
import { Usuario } from '../../models/usuario.model';

/**
 * Historial de moderación.
 *
 * El JSON ahora guarda `usuarioId` + `adminId` en lugar de repetir nombres.
 * El servicio resuelve los nombres al vuelo y expone `AccionAdminVista`, que
 * conserva `usuarioNombre` y `administrador` para no tocar las plantillas.
 */
@Injectable({ providedIn: 'root' })
export class HistorialAdminService {
  private readonly http = inject(HttpClient);

  private readonly _acciones = signal<AccionAdmin[]>([]);
  private readonly _usuarios = signal<Usuario[]>([]);
  private readonly _admins = signal<AdminUsuario[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private cargado = false;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly acciones = computed<AccionAdminVista[]>(() => {
    const usuarios = new Map(this._usuarios().map((u) => [u.id, u]));
    const admins = new Map(this._admins().map((a) => [a.id, a]));

    return this._acciones().map((a) => ({
      ...a,
      usuarioNombre: usuarios.get(a.usuarioId)?.nombre ?? 'Usuario desconocido',
      administrador: admins.get(a.adminId)?.nombre ?? 'Administrador',
    }));
  });

  cargar(): void {
    if (this.cargado) return;
    this.cargado = true;
    this._cargando.set(true);
    this._error.set(null);

    forkJoin({
      acciones: this.http.get<AccionAdmin[]>('data/historial-acciones.json'),
      usuarios: this.http.get<Usuario[]>('data/usuarios.json'),
      admins: this.http.get<AdminUsuario[]>('data/admins.json'),
    }).subscribe({
      next: (d) => {
        this._acciones.set(d.acciones);
        this._usuarios.set(d.usuarios);
        this._admins.set(d.admins);
        this._cargando.set(false);
      },
      error: () => {
        this.cargado = false;
        this._error.set('No se pudo cargar el historial.');
        this._cargando.set(false);
      },
    });
  }

  /** HU71 — historial de un usuario puntual. */
  porUsuario(usuarioId: string): AccionAdminVista[] {
    return this.acciones().filter((a) => a.usuarioId === usuarioId);
  }

  /** HU68 — filtro por rango de fechas. */
  entreFechas(desde?: string, hasta?: string): AccionAdminVista[] {
    const min = desde ? new Date(desde).getTime() : -Infinity;
    // +1 día para que "hasta" incluya el día completo
    const max = hasta ? new Date(hasta).getTime() + 86_400_000 : Infinity;

    return this.acciones().filter((a) => {
      const f = new Date(a.fecha).getTime();
      return f >= min && f <= max;
    });
  }

  recientes(limite = 5): AccionAdminVista[] {
    return [...this.acciones()]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, limite);
  }

  /** Registra una acción nueva. Recibe IDs, nunca nombres. */
  registrar(accion: Omit<AccionAdmin, 'id' | 'fecha'>): void {
    this._acciones.update((lista) => [
      { ...accion, id: `ac_${Date.now()}`, fecha: new Date().toISOString() },
      ...lista,
    ]);
  }
}
