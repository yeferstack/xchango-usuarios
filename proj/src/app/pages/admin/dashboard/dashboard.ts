import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCard } from '../../../components/admin/stat-card/stat-card';
import { ChartLinea } from '../../../components/admin/chart-linea/chart-linea';
import { ChartBarras } from '../../../components/admin/chart-barras/chart-barras';
import { ChartDona } from '../../../components/admin/chart-dona/chart-dona';
import { BadgeEstado } from '../../../components/admin/badge-estado/badge-estado';
import { Icon } from '../../../components/admin/icon/icon';
import { MetricasAdminService } from '../../../services/admin/metricas-admin.service';
import { HistorialAdminService } from '../../../services/admin/historial-admin.service';
import { AlertasAdminService } from '../../../services/admin/alertas-admin.service';
import { PublicacionesAdminService } from '../../../services/admin/publicaciones-admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, StatCard, ChartLinea, ChartBarras, ChartDona, BadgeEstado, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly metricasSrv = inject(MetricasAdminService);
  private readonly historialSrv = inject(HistorialAdminService);
  private readonly alertasSrv = inject(AlertasAdminService);
  private readonly publicacionesSrv = inject(PublicacionesAdminService);

  readonly cargando = this.metricasSrv.cargando;
  readonly resumen = this.metricasSrv.resumen;
  readonly comparativas = this.metricasSrv.comparativas;

  readonly actividad = computed(() => this.metricasSrv.actividadUsuarios('anio'));
  readonly intercambios = computed(() => this.metricasSrv.intercambiosPorMes('anio'));
  readonly categorias = computed(() => this.metricasSrv.publicacionesPorCategoria());
  readonly ubicaciones = computed(() => this.metricasSrv.actividadPorUbicacion());

  readonly accionesRecientes = computed(() => this.historialSrv.recientes(5));
  readonly alertasActivas = computed(() => this.alertasSrv.alertas().filter(a => !a.leida).slice(0, 3));
  readonly reportesRecientes = computed(() =>
    this.publicacionesSrv.reportadas().filter(p => p.estado === 'pendiente').slice(0, 5)
  );

  /** Porcentaje de variación de cada tarjeta (null si no hay comparativa). */
  variacion(clave: string): number | null {
    return this.comparativas()[clave]?.porcentaje ?? null;
  }

  ngOnInit(): void {
    // Los servicios ya fueron cargados por el layout; esto cubre el acceso directo.
    this.metricasSrv.cargar();
    this.historialSrv.cargar();
    this.alertasSrv.cargar();
    this.publicacionesSrv.cargar();
    this.metricasSrv.iniciarTiempoReal(6000);
  }

  ngOnDestroy(): void {
    this.metricasSrv.detenerTiempoReal();
  }
}
