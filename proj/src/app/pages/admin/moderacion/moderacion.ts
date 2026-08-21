import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BadgeEstado } from '../../../components/admin/badge-estado/badge-estado';
import { ModalConfirmacion } from '../../../components/admin/modal-confirmacion/modal-confirmacion';
import { Icon } from '../../../components/admin/icon/icon';
import { PublicacionesAdminService } from '../../../services/admin/publicaciones-admin.service';
import { UsuariosAdminService } from '../../../services/admin/usuarios-admin.service';
import { HistorialAdminService } from '../../../services/admin/historial-admin.service';
import { AdminsAdminService } from '../../../services/admin/admins-admin.service';
import { PublicacionReportada } from '../../../models/admin/publicacion-reportada';

type TipoAccion = 'aprobar' | 'eliminar' | 'advertir' | 'suspender';
type Pestana = 'reportadas' | 'eliminadas';

@Component({
  selector: 'app-moderacion',
  standalone: true,
  imports: [DatePipe, BadgeEstado, ModalConfirmacion, Icon],
  templateUrl: './moderacion.html',
  styleUrl: './moderacion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Moderacion implements OnInit {
  private readonly publicacionesSrv = inject(PublicacionesAdminService);
  private readonly usuariosSrv = inject(UsuariosAdminService);
  private readonly historialSrv = inject(HistorialAdminService);
  private readonly auth = inject(AdminsAdminService);

  readonly cargando = this.publicacionesSrv.cargando;
  readonly eliminadas = this.publicacionesSrv.eliminadas;
  readonly pendientes = this.publicacionesSrv.pendientes;

  readonly pestana = signal<Pestana>('reportadas');

  // --- Filtros (HU75) ---
  readonly motivo = signal<string>('todos');
  readonly estado = signal<string>('todos');
  readonly gravedad = signal<string>('todas');
  readonly categoria = signal<string>('todas');

  readonly motivos = computed(() => this.publicacionesSrv.motivos());
  readonly categorias = computed(() => this.publicacionesSrv.categorias());

  readonly listado = computed(() =>
    this.publicacionesSrv.filtrar({
      motivo: this.motivo(),
      estado: this.estado() as PublicacionReportada['estado'] | 'todos',
      gravedad: this.gravedad() as PublicacionReportada['gravedad'] | 'todas',
      categoria: this.categoria(),
    })
  );

  readonly detalle = signal<PublicacionReportada | null>(null);
  readonly modal = signal<{ tipo: TipoAccion; pub: PublicacionReportada } | null>(null);

  readonly configModal = computed(() => {
    const m = this.modal();
    if (!m) return null;

    const config = {
      aprobar: {
        titulo: 'Aprobar publicación',
        mensaje: `"${m.pub.titulo}" se marcará como revisada y seguirá visible en la plataforma.`,
        texto: 'Aprobar',
        icono: 'check-circle',
        tono: 'neutro' as const,
        pideMotivo: false,
        etiqueta: '',
      },
      eliminar: {
        titulo: 'Eliminar publicación',
        mensaje: `"${m.pub.titulo}" será retirada y quedará registrada en el historial de eliminaciones.`,
        texto: 'Eliminar',
        icono: 'trash',
        tono: 'danger' as const,
        pideMotivo: true,
        etiqueta: 'Motivo de la eliminación',
      },
      advertir: {
        titulo: 'Advertir al usuario',
        mensaje: `Se enviará una advertencia a ${m.pub.usuarioNombre} por el contenido publicado.`,
        texto: 'Enviar advertencia',
        icono: 'alert',
        tono: 'warn' as const,
        pideMotivo: true,
        etiqueta: 'Motivo de la advertencia',
      },
      suspender: {
        titulo: 'Suspender al usuario',
        mensaje: `La cuenta de ${m.pub.usuarioNombre} quedará bloqueada en la plataforma.`,
        texto: 'Suspender',
        icono: 'ban',
        tono: 'danger' as const,
        pideMotivo: true,
        etiqueta: 'Motivo de la suspensión',
      },
    };

    return config[m.tipo];
  });

  ngOnInit(): void {
    this.publicacionesSrv.cargar();
    this.usuariosSrv.cargar();
    this.historialSrv.cargar();
  }

  filtrar(campo: 'motivo' | 'estado' | 'gravedad' | 'categoria', valor: string): void {
    this[campo].set(valor);
  }

  limpiarFiltros(): void {
    this.motivo.set('todos');
    this.estado.set('todos');
    this.gravedad.set('todas');
    this.categoria.set('todas');
  }

  abrirModal(tipo: TipoAccion, pub: PublicacionReportada): void {
    this.modal.set({ tipo, pub });
  }

  confirmarAccion(motivo: string): void {
    const m = this.modal();
    if (!m) return;

    // El historial guarda el ID del admin, nunca su nombre.
    const adminId = this.auth.idActual();

    switch (m.tipo) {
      case 'aprobar':
        this.publicacionesSrv.aprobar(m.pub.id);
        this.registrar(m.pub, 'Aprobación', 'Reporte revisado y descartado.', adminId);
        break;

      case 'eliminar':
        this.publicacionesSrv.eliminar(m.pub.id, motivo, adminId);
        this.registrar(m.pub, 'Eliminación', `Publicación eliminada: ${motivo}`, adminId);
        break;

      case 'advertir':
        this.usuariosSrv.advertir(m.pub.usuarioId);
        this.registrar(m.pub, 'Advertencia', motivo, adminId);
        break;

      case 'suspender':
        this.usuariosSrv.suspender(m.pub.usuarioId);
        this.registrar(m.pub, 'Suspensión', motivo, adminId);
        break;
    }

    this.modal.set(null);
    this.detalle.set(null);
  }

  private registrar(
    pub: PublicacionReportada,
    accion: string,
    descripcion: string,
    adminId: string,
  ): void {
    this.historialSrv.registrar({
      usuarioId: pub.usuarioId,
      adminId,
      accion,
      descripcion,
    });
  }
}
