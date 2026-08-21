import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioPlataforma } from '../../models/admin/usuario-plataforma';

export interface FiltroUsuarios {
  busqueda?: string;
  estado?: UsuarioPlataforma['estado'] | 'todos';
  nivel?: UsuarioPlataforma['nivelActividad'] | 'todos';
  ubicacion?: string | 'todas';
}

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private readonly http = inject(HttpClient);

  private readonly _usuarios = signal<UsuarioPlataforma[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private cargado = false;

  readonly usuarios = this._usuarios.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly total = computed(() => this._usuarios().length);
  readonly suspendidos = computed(() => this._usuarios().filter(u => u.estado === 'suspendido').length);

  /** Carga una sola vez. Llamar desde ngOnInit del componente. */
  cargar(): void {
    if (this.cargado) return;
    this.cargado = true;
    this._cargando.set(true);
    this._error.set(null);

    this.http.get<UsuarioPlataforma[]>('data/usuarios.json').subscribe({
      next: datos => {
        this._usuarios.set(datos);
        this._cargando.set(false);
      },
      error: () => {
        this.cargado = false; // permite reintentar
        this._error.set('No se pudieron cargar los usuarios.');
        this._cargando.set(false);
      },
    });
  }

  // ---------- Consultas ----------

  /** Buscador + filtros combinados. */
  filtrar(f: FiltroUsuarios): UsuarioPlataforma[] {
    const texto = (f.busqueda ?? '').trim().toLowerCase();

    return this._usuarios().filter(u => {
      const porTexto =
        !texto || u.nombre.toLowerCase().includes(texto) || u.email.toLowerCase().includes(texto);
      const porEstado = !f.estado || f.estado === 'todos' || u.estado === f.estado;
      const porNivel = !f.nivel || f.nivel === 'todos' || u.nivelActividad === f.nivel;
      const porUbicacion = !f.ubicacion || f.ubicacion === 'todas' || u.ubicacion === f.ubicacion;
      return porTexto && porEstado && porNivel && porUbicacion;
    });
  }

  /** Corta una lista ya filtrada en la página pedida. */
  paginar<T>(lista: T[], pagina: number, porPagina: number): T[] {
    const inicio = (pagina - 1) * porPagina;
    return lista.slice(inicio, inicio + porPagina);
  }

  obtener(id: string): UsuarioPlataforma | undefined {
    return this._usuarios().find(u => u.id === id);
  }

  /** Valores únicos para llenar el <select> de ubicación. */
  ubicaciones(): string[] {
    return [...new Set(this._usuarios().map(u => u.ubicacion))].sort();
  }

  /** Rankings de la sección 8 / HU76. */
  ranking(criterio: 'publicaciones' | 'intercambios' | 'actividad', limite = 5): UsuarioPlataforma[] {
    const lista = [...this._usuarios()];

    if (criterio === 'actividad') {
      const peso = { alto: 3, medio: 2, bajo: 1 };
      lista.sort(
        (a, b) =>
          peso[b.nivelActividad] * (b.publicaciones + b.intercambios) -
          peso[a.nivelActividad] * (a.publicaciones + a.intercambios)
      );
    } else {
      lista.sort((a, b) => b[criterio] - a[criterio]);
    }

    return lista.slice(0, limite);
  }

  // ---------- Mutaciones (en memoria) ----------

  suspender(id: string): void {
    this.cambiarEstado(id, 'suspendido');
  }

  activar(id: string): void {
    this.cambiarEstado(id, 'activo');
  }

  advertir(id: string): void {
    this.cambiarEstado(id, 'advertido');
  }

  editar(id: string, cambios: Partial<UsuarioPlataforma>): void {
    this._usuarios.update(lista => lista.map(u => (u.id === id ? { ...u, ...cambios } : u)));
  }

  private cambiarEstado(id: string, estado: UsuarioPlataforma['estado']): void {
    this._usuarios.update(lista => lista.map(u => (u.id === id ? { ...u, estado } : u)));
  }
}
