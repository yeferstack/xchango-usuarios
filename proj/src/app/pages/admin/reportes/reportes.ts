import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';

import { StatCard } from '../../../components/admin/stat-card/stat-card';
import { ChartLinea } from '../../../components/admin/chart-linea/chart-linea';
import { ChartBarras } from '../../../components/admin/chart-barras/chart-barras';
import { ChartDona } from '../../../components/admin/chart-dona/chart-dona';
import { BadgeEstado } from '../../../components/admin/badge-estado/badge-estado';
import { FiltroFechas } from '../../../components/admin/filtro-fechas/filtro-fechas';
import { Icon } from '../../../components/admin/icon/icon';

import {
  MetricasAdminService,
  Periodo
} from '../../../services/admin/metricas-admin.service';

import { UsuariosAdminService } from '../../../services/admin/usuarios-admin.service';
import { HistorialAdminService } from '../../../services/admin/historial-admin.service';
import { AlertasAdminService } from '../../../services/admin/alertas-admin.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    DatePipe,
    StatCard,
    ChartLinea,
    ChartBarras,
    ChartDona,
    BadgeEstado,
    FiltroFechas,
    Icon
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reportes implements OnInit, OnDestroy {

  private readonly metricasSrv = inject(MetricasAdminService);
  private readonly usuariosSrv = inject(UsuariosAdminService);
  private readonly historialSrv = inject(HistorialAdminService);
  private readonly alertasSrv = inject(AlertasAdminService);

  readonly resumen = this.metricasSrv.resumen;
  readonly comparativas = this.metricasSrv.comparativas;
  readonly alertas = this.alertasSrv.alertas;

  readonly periodo = signal<Periodo>('90d');

  readonly desde = signal('');
  readonly hasta = signal('');
  readonly exportando = signal('');

  readonly actividad = computed(() =>
    this.metricasSrv.actividadUsuarios(this.periodo())
  );

  readonly intercambios = computed(() =>
    this.metricasSrv.intercambiosPorMes(this.periodo())
  );

  readonly categorias = computed(() =>
    this.metricasSrv.publicacionesPorCategoria()
  );

  readonly ubicaciones = computed(() =>
    this.metricasSrv.actividadPorUbicacion()
  );

  /** HU76 — ranking de usuarios más activos. */
  readonly ranking = computed(() =>
    this.usuariosSrv.ranking('actividad', 5)
  );

  /** HU68 — historial filtrado por rango de fechas. */
  readonly historial = computed(() =>
    this.historialSrv.entreFechas(
      this.desde() || undefined,
      this.hasta() || undefined
    )
  );

  ngOnInit(): void {
    this.metricasSrv.cargar();
    this.usuariosSrv.cargar();
    this.historialSrv.cargar();
    this.alertasSrv.cargar();

    this.metricasSrv.iniciarTiempoReal(6000);
  }

  ngOnDestroy(): void {
    this.metricasSrv.detenerTiempoReal();
  }

  cambiarRango(r: any): void {
    this.desde.set(r.desde);
    this.hasta.set(r.hasta);

    if (r.periodo === 'personalizado') {
      return;
    }

    switch (r.periodo) {
      case 'hoy':
        this.periodo.set('1d' as Periodo);
        break;

      case '7dias':
        this.periodo.set('7d' as Periodo);
        break;

      case '30dias':
        this.periodo.set('30d' as Periodo);
        break;

      case '90dias':
        this.periodo.set('90d' as Periodo);
        break;

      default:
        break;
    }
  }

  variacion(clave: string): number | null {
    return this.comparativas()[clave]?.porcentaje ?? null;
  }

  /**
   * HU67 — exportación CSV.
   * Excel puede abrir el archivo directamente.
   */
  exportarCSV(): void {

    const filas = [
      ['Métrica', 'Valor'],

      ...Object.entries(this.resumen() ?? {})
        .map(([k, v]) => [k, String(v)]),

      [],

      ['Categoría', 'Publicaciones'],

      ...this.categorias()
        .map(c => [c.label, String(c.valor)]),

      [],

      ['Ubicación', 'Actividad'],

      ...this.ubicaciones()
        .map(u => [u.label, String(u.valor)]),
    ];

    const csv = filas
      .map(f => f.join(';'))
      .join('\n');

    this.descargar(
      new Blob(
        ['\uFEFF' + csv],
        { type: 'text/csv;charset=utf-8;' }
      ),
      'reporte-xchango.csv'
    );

    this.avisar('CSV');
  }

  /** Abre el diálogo de impresión para guardar como PDF. */
  exportarPDF(): void {
    this.avisar('PDF');

    setTimeout(() => {
      window.print();
    }, 200);
  }

  private descargar(blob: Blob, nombre: string): void {

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombre;

    enlace.click();

    URL.revokeObjectURL(url);
  }

  private avisar(formato: string): void {

    this.exportando.set(formato);

    setTimeout(() => {
      this.exportando.set('');
    }, 2200);
  }
}