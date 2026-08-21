import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alerta } from '../../models/admin/alerta';

@Injectable({ providedIn: 'root' })
export class AlertasAdminService {
  private readonly http = inject(HttpClient);

  private readonly _alertas = signal<Alerta[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private cargado = false;

  readonly alertas = this._alertas.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  /** Contador para el badge de notificaciones del header. */
  readonly noLeidas = computed(() => this._alertas().filter(a => !a.leida).length);

  cargar(): void {
    if (this.cargado) return;
    this.cargado = true;
    this._cargando.set(true);
    this._error.set(null);

    this.http.get<Alerta[]>('data/alertas.json').subscribe({
      next: datos => {
        this._alertas.set(datos);
        this._cargando.set(false);
      },
      error: () => {
        this.cargado = false;
        this._error.set('No se pudieron cargar las alertas.');
        this._cargando.set(false);
      },
    });
  }

  porTipo(tipo: Alerta['tipo'] | 'todas'): Alerta[] {
    return tipo === 'todas' ? this._alertas() : this._alertas().filter(a => a.tipo === tipo);
  }

  porPrioridad(prioridad: Alerta['prioridad']): Alerta[] {
    return this._alertas().filter(a => a.prioridad === prioridad);
  }

  marcarLeida(id: string): void {
    this._alertas.update(lista => lista.map(a => (a.id === id ? { ...a, leida: true } : a)));
  }

  marcarTodasLeidas(): void {
    this._alertas.update(lista => lista.map(a => ({ ...a, leida: true })));
  }
}
