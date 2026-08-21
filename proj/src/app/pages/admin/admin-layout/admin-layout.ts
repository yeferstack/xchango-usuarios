import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidebarAdmin } from '../../../components/admin/sidebar-admin/sidebar-admin';
import { HeaderAdmin } from '../../../components/admin/header-admin/header-admin';
import { AdminsAdminService } from '../../../services/admin/admins-admin.service';
import { UsuariosAdminService } from '../../../services/admin/usuarios-admin.service';
import { PublicacionesAdminService } from '../../../services/admin/publicaciones-admin.service';
import { MetricasAdminService } from '../../../services/admin/metricas-admin.service';
import { AlertasAdminService } from '../../../services/admin/alertas-admin.service';
import { HistorialAdminService } from '../../../services/admin/historial-admin.service';

/** Título y bajada del header según la ruta activa. */
const TITULOS: Record<string, { titulo: string; sub: string }> = {
  dashboard: { titulo: 'Dashboard', sub: 'Resumen general de la plataforma' },
  reportes: { titulo: 'Reportes y estadísticas', sub: 'Métricas, gráficos y exportación de datos' },
  administracion: { titulo: 'Administración', sub: 'Estado y actividad del sistema' },
  usuarios: { titulo: 'Gestión de usuarios', sub: 'Administra las cuentas de la plataforma' },
  moderacion: { titulo: 'Moderación de contenido', sub: 'Revisa publicaciones reportadas' },
  ranking: { titulo: 'Ranking y métricas', sub: 'Usuarios, categorías y ubicaciones destacadas' },
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarAdmin, HeaderAdmin],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AdminsAdminService);
  private readonly usuarios = inject(UsuariosAdminService);
  private readonly publicaciones = inject(PublicacionesAdminService);
  private readonly metricas = inject(MetricasAdminService);
  private readonly alertas = inject(AlertasAdminService);
  private readonly historial = inject(HistorialAdminService);

  /** Drawer del sidebar en pantallas pequeñas. */
  readonly menuAbierto = signal(false);

  /** Segmento final de la URL, como signal. */
  private readonly seccion = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects.split('/').filter(Boolean).pop() ?? 'dashboard'),
      startWith(this.router.url.split('/').filter(Boolean).pop() ?? 'dashboard')
    ),
    { initialValue: 'dashboard' }
  );

  readonly titulo = computed(() => TITULOS[this.seccion()]?.titulo ?? 'Panel administrativo');
  readonly subtitulo = computed(() => TITULOS[this.seccion()]?.sub ?? '');

  ngOnInit(): void {
    // Todos los servicios cachean: llamar cargar() varias veces no repite la petición.
    this.usuarios.cargar();
    this.publicaciones.cargar();
    this.metricas.cargar();
    this.alertas.cargar();
    this.historial.cargar();
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
