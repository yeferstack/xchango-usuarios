import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Comparativa,
  MetricasData,
  MetricasResumen,
  SerieGrafico,
} from '../../models/admin/metrica';

export type Periodo = '1d' | '7d' | '30d' | '90d' | 'anio';

/**
 * Estas interfaces se redeclaraban aquí, duplicando `models/admin/metrica.ts`.
 * Ahora se importan de allí y se reexportan para no romper a quien las
 * importaba desde este archivo.
 */
export type { MetricasData, MetricasResumen, SerieGrafico };
export type MetricaComparativa = Comparativa;

const RESUMEN_VACIO: MetricasResumen = {
  usuarios: 0,
  usuariosActivos: 0,
  publicaciones: 0,
  intercambios: 0,
  publicacionesReportadas: 0,
  usuariosSuspendidos: 0,
};

@Injectable({ providedIn: 'root' })
export class MetricasAdminService {
  private readonly http = inject(HttpClient);
  private readonly datos = signal<MetricasData | null>(null);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private cargado = false;
  private temporizador: ReturnType<typeof setInterval> | null = null;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly resumen = signal<MetricasResumen>({ ...RESUMEN_VACIO });
  readonly comparativas = signal<Record<string, Comparativa>>({});

  cargar(): void {
    if (this.cargado) return;
    this.cargado = true;
    this._cargando.set(true);
    this.http.get<MetricasData>('data/metricas.json').subscribe({
      next: (datos) => {
        this.aplicar(datos);
        this._cargando.set(false);
      },
      error: () => {
        this.cargado = false;
        this._error.set('No se pudieron cargar las métricas.');
        this._cargando.set(false);
      },
    });
  }

  actividadUsuarios(periodo: Periodo): SerieGrafico[] { return this.recortar(this.datos()?.actividadMensual ?? [], periodo); }
  intercambiosPorMes(periodo: Periodo): SerieGrafico[] { return this.recortar(this.datos()?.intercambiosPorMes ?? [], periodo); }
  publicacionesPorCategoria(): SerieGrafico[] { return this.datos()?.publicacionesPorCategoria ?? []; }
  actividadPorUbicacion(): SerieGrafico[] { return this.datos()?.actividadPorUbicacion ?? []; }
  crecimientoCategorias(): SerieGrafico[] { return this.datos()?.crecimientoCategorias ?? []; }
  categoriasMasUsadas(limite = 6): SerieGrafico[] { return [...this.publicacionesPorCategoria()].sort((a, b) => b.valor - a.valor).slice(0, limite); }
  ubicacionesMasActivas(limite = 7): SerieGrafico[] { return [...this.actividadPorUbicacion()].sort((a, b) => b.valor - a.valor).slice(0, limite); }

  iniciarTiempoReal(intervalo = 6000): void {
    if (this.temporizador === null) this.temporizador = setInterval(() => this.recargar(), intervalo);
  }

  detenerTiempoReal(): void {
    if (this.temporizador !== null) clearInterval(this.temporizador);
    this.temporizador = null;
  }

  private recargar(): void {
    this.http.get<MetricasData>('data/metricas.json').subscribe((datos) => this.aplicar(datos));
  }

  private aplicar(datos: MetricasData): void {
    this.datos.set(datos);
    this.resumen.set(datos.resumen);
    this.comparativas.set(datos.comparativas);
  }

  private recortar(datos: SerieGrafico[], periodo: Periodo): SerieGrafico[] {
    const limites: Record<Periodo, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90, anio: datos.length };
    return datos.slice(-Math.min(limites[periodo], datos.length));
  }
}
