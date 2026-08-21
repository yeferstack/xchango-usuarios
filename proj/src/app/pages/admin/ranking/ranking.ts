import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ChartBarras } from '../../../components/admin/chart-barras/chart-barras';
import { BadgeEstado } from '../../../components/admin/badge-estado/badge-estado';
import { Icon } from '../../../components/admin/icon/icon';
import { UsuariosAdminService } from '../../../services/admin/usuarios-admin.service';
import { MetricasAdminService } from '../../../services/admin/metricas-admin.service';
import { Comparativa } from '../../../models/admin/metrica';

type CriterioRanking = 'actividad' | 'intercambios' | 'publicaciones';

interface TarjetaComparativa {
  clave: string;
  texto: string;
  icono: string;
  datos: Comparativa;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [ChartBarras, BadgeEstado, Icon],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ranking implements OnInit {
  private readonly usuariosSrv = inject(UsuariosAdminService);
  private readonly metricasSrv = inject(MetricasAdminService);

  readonly criterio = signal<CriterioRanking>('actividad');

  readonly criterios: { id: CriterioRanking; texto: string; icono: string }[] = [
    { id: 'actividad', texto: 'Más activos', icono: 'activity' },
    { id: 'intercambios', texto: 'Más intercambios', icono: 'swap' },
    { id: 'publicaciones', texto: 'Más publicaciones', icono: 'package' },
  ];

  readonly top = computed(() => this.usuariosSrv.ranking(this.criterio(), 8));

  readonly categorias = computed(() => this.metricasSrv.categoriasMasUsadas(6));
  readonly crecimiento = computed(() => this.metricasSrv.crecimientoCategorias());
  readonly ubicaciones = computed(() => this.metricasSrv.ubicacionesMasActivas(7));

  /** HU77 — comparación de este mes contra el anterior. */
  readonly comparativas = computed<TarjetaComparativa[]>(() => {
    const c = this.metricasSrv.comparativas();

    const definiciones = [
      { clave: 'usuarios', texto: 'Usuarios activos', icono: 'users' },
      { clave: 'usuariosNuevos', texto: 'Usuarios nuevos', icono: 'user-check' },
      { clave: 'publicaciones', texto: 'Publicaciones nuevas', icono: 'package' },
      { clave: 'intercambios', texto: 'Intercambios realizados', icono: 'swap' },
    ];

    const tarjetas: TarjetaComparativa[] = [];
    for (const d of definiciones) {
      const datos = c[d.clave];
      if (datos) tarjetas.push({ ...d, datos });
    }
    return tarjetas;
  });

  ngOnInit(): void {
    this.usuariosSrv.cargar();
    this.metricasSrv.cargar();
  }

  /** Valor que se muestra a la derecha de cada usuario según el criterio. */
  valorDe(u: { publicaciones: number; intercambios: number }): number {
    if (this.criterio() === 'publicaciones') return u.publicaciones;
    if (this.criterio() === 'intercambios') return u.intercambios;
    return u.publicaciones + u.intercambios;
  }
}
