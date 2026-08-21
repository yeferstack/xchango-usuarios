import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { Usuario } from '../../models/usuario.model';
import { Categoria } from '../../models/categoria.model';
import { Publicacion, ETIQUETA_TIPO } from '../../models/publicacion.model';
import {
  PublicacionReportada,
  Reporte,
} from '../../models/admin/publicacion-reportada';
import {
  PublicacionEliminada,
  PublicacionEliminadaVista,
} from '../../models/admin/publicacion-eliminada';
import { AdminUsuario } from '../../models/admin/admin-usuario';

/**
 * Moderación de publicaciones.
 *
 * `publicaciones-reportadas.json` ya no duplica el título, el dueño ni la
 * categoría: guarda solo `publicacionId` + `reportanteId`. Este servicio hace
 * el join contra publicaciones.json, usuarios.json y categorias.json, y expone
 * `PublicacionReportada` con los mismos nombres de campo que ya usaba la vista,
 * de modo que `moderacion.html` no necesita cambios.
 *
 * Las interfaces que antes se redeclaraban aquí ahora viven en `models/admin/`.
 */
@Injectable({ providedIn: 'root' })
export class PublicacionesAdminService {
  private readonly http = inject(HttpClient);

  private readonly _reportes = signal<Reporte[]>([]);
  private readonly _eliminadas = signal<PublicacionEliminada[]>([]);
  private readonly _publicaciones = signal<Publicacion[]>([]);
  private readonly _usuarios = signal<Usuario[]>([]);
  private readonly _categorias = signal<Categoria[]>([]);
  private readonly _admins = signal<AdminUsuario[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private cargado = false;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  // ---------- Índices para el join ----------
  private readonly mapaPublicaciones = computed(
    () => new Map(this._publicaciones().map((p) => [p.id, p]))
  );
  private readonly mapaUsuarios = computed(
    () => new Map(this._usuarios().map((u) => [u.id, u]))
  );
  private readonly mapaCategorias = computed(
    () => new Map(this._categorias().map((c) => [c.id, c]))
  );
  private readonly mapaAdmins = computed(
    () => new Map(this._admins().map((a) => [a.id, a]))
  );

  /** Reportes con título, dueño y categoría ya resueltos. */
  readonly reportadas = computed<PublicacionReportada[]>(() => {
    const pubs = this.mapaPublicaciones();
    const usuarios = this.mapaUsuarios();
    const categorias = this.mapaCategorias();

    return this._reportes().map((r) => {
      const pub = pubs.get(r.publicacionId);
      const dueno = pub ? usuarios.get(pub.usuarioId) : undefined;

      return {
        ...r,
        titulo: pub?.titulo ?? 'Publicación no disponible',
        usuarioId: pub?.usuarioId ?? '',
        usuarioNombre: dueno?.nombre ?? 'Usuario desconocido',
        categoria: pub ? categorias.get(pub.categoriaId)?.nombre ?? 'Sin categoría' : 'Sin categoría',
        tipo: pub ? ETIQUETA_TIPO[pub.tipo] : '',
        reportanteNombre: usuarios.get(r.reportanteId)?.nombre ?? 'Usuario desconocido',
      };
    });
  });

  /** Eliminadas con título y nombres resueltos. */
  readonly eliminadas = computed<PublicacionEliminadaVista[]>(() => {
    const pubs = this.mapaPublicaciones();
    const usuarios = this.mapaUsuarios();
    const admins = this.mapaAdmins();

    return this._eliminadas().map((e) => ({
      ...e,
      titulo: pubs.get(e.publicacionId)?.titulo ?? 'Publicación no disponible',
      usuarioNombre: usuarios.get(e.usuarioId)?.nombre ?? 'Usuario desconocido',
      administrador: admins.get(e.adminId)?.nombre ?? 'Administrador',
    }));
  });

  readonly pendientes = computed(
    () => this._reportes().filter((r) => r.estado === 'pendiente').length
  );

  cargar(): void {
    if (this.cargado) return;
    this.cargado = true;
    this._cargando.set(true);
    this._error.set(null);

    forkJoin({
      reportes: this.http.get<Reporte[]>('data/publicaciones-reportadas.json'),
      eliminadas: this.http.get<PublicacionEliminada[]>('data/publicaciones-eliminadas.json'),
      publicaciones: this.http.get<Publicacion[]>('data/publicaciones.json'),
      usuarios: this.http.get<Usuario[]>('data/usuarios.json'),
      categorias: this.http.get<Categoria[]>('data/categorias.json'),
      admins: this.http.get<AdminUsuario[]>('data/admins.json'),
    }).subscribe({
      next: (d) => {
        this._reportes.set(d.reportes);
        this._eliminadas.set(d.eliminadas);
        this._publicaciones.set(d.publicaciones);
        this._usuarios.set(d.usuarios);
        this._categorias.set(d.categorias);
        this._admins.set(d.admins);
        this._cargando.set(false);
      },
      error: () => {
        this.cargado = false;
        this._error.set('No se pudieron cargar las publicaciones reportadas.');
        this._cargando.set(false);
      },
    });
  }

  // ---------- Consultas ----------

  motivos(): string[] {
    return [...new Set(this._reportes().map((r) => r.motivo))].sort();
  }

  /** Se alimenta del catálogo único de categorías, no de los reportes. */
  categorias(): string[] {
    return this._categorias().map((c) => c.nombre).sort();
  }

  filtrar(f: {
    motivo?: string;
    estado?: PublicacionReportada['estado'] | 'todos';
    gravedad?: PublicacionReportada['gravedad'] | 'todas';
    categoria?: string;
  }): PublicacionReportada[] {
    return this.reportadas().filter(
      (p) =>
        (!f.motivo || f.motivo === 'todos' || p.motivo === f.motivo) &&
        (!f.estado || f.estado === 'todos' || p.estado === f.estado) &&
        (!f.gravedad || f.gravedad === 'todas' || p.gravedad === f.gravedad) &&
        (!f.categoria || f.categoria === 'todas' || p.categoria === f.categoria)
    );
  }

  obtenerPublicacion(publicacionId: string): Publicacion | undefined {
    return this.mapaPublicaciones().get(publicacionId);
  }

  // ---------- Mutaciones (en memoria) ----------

  aprobar(reporteId: string): void {
    this.actualizarEstado(reporteId, 'aprobada');
  }

  /**
   * Marca el reporte como resuelto, cambia la publicación a estado 'eliminada'
   * y deja el registro en la lista de eliminadas, referenciando por ID.
   */
  eliminar(reporteId: string, motivo: string, adminId: string): void {
    const reporte = this._reportes().find((r) => r.id === reporteId);
    if (!reporte) return;

    const publicacion = this.mapaPublicaciones().get(reporte.publicacionId);
    if (!publicacion) return;

    this.actualizarEstado(reporteId, 'eliminada');

    this._publicaciones.update((lista) =>
      lista.map((p) => (p.id === publicacion.id ? { ...p, estado: 'eliminada' as const } : p))
    );

    this._eliminadas.update((lista) => [
      {
        id: `el_${Date.now()}`,
        publicacionId: publicacion.id,
        usuarioId: publicacion.usuarioId,
        adminId,
        motivo,
        fecha: new Date().toISOString(),
      },
      ...lista,
    ]);
  }

  private actualizarEstado(reporteId: string, estado: Reporte['estado']): void {
    this._reportes.update((lista) =>
      lista.map((r) => (r.id === reporteId ? { ...r, estado } : r))
    );
  }
}
