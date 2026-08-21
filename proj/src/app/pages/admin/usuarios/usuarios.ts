import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeEstado } from '../../../components/admin/badge-estado/badge-estado';
import { Paginacion } from '../../../components/admin/paginacion/paginacion';
import { ModalConfirmacion } from '../../../components/admin/modal-confirmacion/modal-confirmacion';
import { Icon } from '../../../components/admin/icon/icon';
import { UsuariosAdminService } from '../../../services/admin/usuarios-admin.service';
import { HistorialAdminService } from '../../../services/admin/historial-admin.service';
import { AdminsAdminService } from '../../../services/admin/admins-admin.service';
import { UsuarioPlataforma } from '../../../models/admin/usuario-plataforma';

type TipoAccion = 'suspender' | 'activar' | 'advertir';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [DatePipe, FormsModule, BadgeEstado, Paginacion, ModalConfirmacion, Icon],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Usuarios implements OnInit {
  private readonly usuariosSrv = inject(UsuariosAdminService);
  private readonly historialSrv = inject(HistorialAdminService);
  private readonly auth = inject(AdminsAdminService);

  readonly cargando = this.usuariosSrv.cargando;
  readonly error = this.usuariosSrv.error;

  // --- Filtros ---
  readonly busqueda = signal('');
  readonly estado = signal<'todos' | UsuarioPlataforma['estado']>('todos');
  readonly nivel = signal<'todos' | UsuarioPlataforma['nivelActividad']>('todos');
  readonly ubicacion = signal<string>('todas');
  readonly pagina = signal(1);
  readonly porPagina = 8;

  readonly ubicaciones = computed(() => this.usuariosSrv.ubicaciones());

  readonly filtrados = computed(() =>
    this.usuariosSrv.filtrar({
      busqueda: this.busqueda(),
      estado: this.estado(),
      nivel: this.nivel(),
      ubicacion: this.ubicacion(),
    })
  );

  readonly visibles = computed(() =>
    this.usuariosSrv.paginar(this.filtrados(), this.pagina(), this.porPagina)
  );

  // --- Panel de detalle e historial ---
  readonly detalle = signal<UsuarioPlataforma | null>(null);
  readonly historial = computed(() => {
    const u = this.detalle();
    return u ? this.historialSrv.porUsuario(u.id) : [];
  });

  // --- Modal de confirmación ---
  readonly modal = signal<{ tipo: TipoAccion; usuario: UsuarioPlataforma } | null>(null);

  readonly configModal = computed(() => {
    const m = this.modal();
    if (!m) return null;

    const config = {
      suspender: {
        titulo: 'Suspender usuario',
        mensaje: `La cuenta de ${m.usuario.nombre} quedará bloqueada y no podrá publicar ni intercambiar.`,
        texto: 'Suspender',
        icono: 'ban',
        tono: 'danger' as const,
        pideMotivo: true,
      },
      activar: {
        titulo: 'Reactivar usuario',
        mensaje: `${m.usuario.nombre} recuperará el acceso completo a la plataforma.`,
        texto: 'Reactivar',
        icono: 'check-circle',
        tono: 'neutro' as const,
        pideMotivo: false,
      },
      advertir: {
        titulo: 'Enviar advertencia',
        mensaje: `Se notificará a ${m.usuario.nombre} sobre el mal uso de la plataforma.`,
        texto: 'Enviar advertencia',
        icono: 'alert',
        tono: 'warn' as const,
        pideMotivo: true,
      },
    };

    return config[m.tipo];
  });

  ngOnInit(): void {
    this.usuariosSrv.cargar();
    this.historialSrv.cargar();
  }

  // --- Filtros ---
  buscar(valor: string): void {
    this.busqueda.set(valor);
    this.pagina.set(1);
  }

  filtrarEstado(valor: string): void {
    this.estado.set(valor as UsuarioPlataforma['estado'] | 'todos');
    this.pagina.set(1);
  }

  filtrarNivel(valor: string): void {
    this.nivel.set(valor as UsuarioPlataforma['nivelActividad'] | 'todos');
    this.pagina.set(1);
  }

  filtrarUbicacion(valor: string): void {
    this.ubicacion.set(valor);
    this.pagina.set(1);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.estado.set('todos');
    this.nivel.set('todos');
    this.ubicacion.set('todas');
    this.pagina.set(1);
  }

  // --- Acciones ---
  abrirModal(tipo: TipoAccion, usuario: UsuarioPlataforma): void {
    this.modal.set({ tipo, usuario });
  }

  confirmarAccion(motivo: string): void {
    const m = this.modal();
    if (!m) return;

    const acciones: Record<TipoAccion, { ejecutar: () => void; nombre: string; texto: string }> = {
      suspender: {
        ejecutar: () => this.usuariosSrv.suspender(m.usuario.id),
        nombre: 'Suspensión',
        texto: motivo || 'Cuenta suspendida por el administrador.',
      },
      activar: {
        ejecutar: () => this.usuariosSrv.activar(m.usuario.id),
        nombre: 'Activación',
        texto: 'Cuenta reactivada por el administrador.',
      },
      advertir: {
        ejecutar: () => this.usuariosSrv.advertir(m.usuario.id),
        nombre: 'Advertencia',
        texto: motivo || 'Advertencia enviada por mal uso.',
      },
    };

    const accion = acciones[m.tipo];
    accion.ejecutar();

    // Queda registrada en el historial (HU71)
    this.historialSrv.registrar({
      usuarioId: m.usuario.id,
      adminId: this.auth.idActual(),
      accion: accion.nombre,
      descripcion: accion.texto,
    });

    // Refresca el panel de detalle si está abierto
    if (this.detalle()?.id === m.usuario.id) {
      this.detalle.set(this.usuariosSrv.obtener(m.usuario.id) ?? null);
    }

    this.modal.set(null);
  }

  verDetalle(usuario: UsuarioPlataforma): void {
    this.detalle.set(usuario);
  }
}
