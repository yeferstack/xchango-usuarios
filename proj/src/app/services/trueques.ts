import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { Usuario } from '../models/usuario.model';
import { Categoria } from '../models/categoria.model';
import {
  CLASE_BADGE_TIPO,
  ETIQUETA_TIPO,
  Publicacion,
  PublicacionVista,
  TipoPublicacion,
} from '../models/publicacion.model';
import { Trueque, TruequeVista } from '../models/trueque.model';
import { Notificacion, TipoNotificacion } from '../models/notificacion.model';

const CLAVE_DB = 'xchango_db';
const CLAVE_SESION = 'xchango_sesion';
const CLAVE_FAVORITOS = 'xchango_favoritos';
/** Súbelo si cambias los JSON semilla: obliga a regenerar lo guardado. */
const VERSION_DB = 3;

const IMAGEN_RESPALDO = 'https://placehold.co/600x450/ece2c9/1f1b16?text=Sin+imagen';

interface BaseDatos {
  version: number;
  usuarios: Usuario[];
  categorias: Categoria[];
  publicaciones: Publicacion[];
  trueques: Trueque[];
  notificaciones: Notificacion[];
}

export interface CategoriaSidebar {
  id: string;
  nombre: string;
  icono: string;
}

/** Datos que envían los formularios de crear / editar publicación. */
export interface DatosPublicacion {
  tipo: TipoPublicacion;
  categoriaId: string;
  titulo: string;
  descripcion: string;
  ofreces: string;
  buscas: string;
  municipio?: string;
  barrio?: string;
  cantidadDisponible?: string;
  disponibilidad?: string;
  imagenes?: string[];
}

/**
 * Store único de XchanGo.
 *
 * Carga los JSON semilla la primera vez y a partir de ahí trabaja contra
 * localStorage, así que crear, editar, eliminar y truequear PERSISTEN al
 * refrescar. No hay backend: esta es la capa que lo reemplaza.
 *
 * Rendimiento: todo lo que devuelve listas es un `computed`, que memoriza y
 * entrega la misma referencia hasta que cambian sus dependencias.
 *
 * Comunicación: sin chat interno. `enlaceWhatsApp()` arma la redirección.
 */
@Injectable({ providedIn: 'root' })
export class TruequesService {
  private readonly http = inject(HttpClient);

  private readonly _usuarios = signal<Usuario[]>([]);
  private readonly _categorias = signal<Categoria[]>([]);
  private readonly _publicaciones = signal<Publicacion[]>([]);
  private readonly _trueques = signal<Trueque[]>([]);
  private readonly _notificaciones = signal<Notificacion[]>([]);
  private readonly _favoritos = signal<ReadonlySet<string>>(this.leerFavoritos());
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _listo = signal(false);
  private enCurso = false;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly listo = this._listo.asReadonly();
  readonly usuarios = this._usuarios.asReadonly();
  readonly categorias = this._categorias.asReadonly();

  /** Id del usuario en sesión. null = nadie autenticado. */
  readonly usuarioActualId = signal<string | null>(this.leerSesion());

  readonly usuarioActual = computed<Usuario | null>(
    () => this._usuarios().find((u) => u.id === this.usuarioActualId()) ?? null,
  );

  readonly autenticado = computed(() => this.usuarioActual() !== null);

  readonly categoriasSidebar = computed<CategoriaSidebar[]>(() => [
    { id: 'todos', nombre: 'Todos', icono: 'grid' },
    ...this._categorias().map((c) => ({ id: c.id, nombre: c.nombre, icono: c.icono })),
  ]);

  // ==================================================================
  // Carga y persistencia
  // ==================================================================

  cargar(): void {
    if (this._listo() || this.enCurso) return;

    const guardada = this.leerDb();
    if (guardada) {
      this.aplicar(guardada);
      this._listo.set(true);
      return;
    }

    this.enCurso = true;
    this._cargando.set(true);
    this._error.set(null);

    forkJoin({
      usuarios: this.http.get<Usuario[]>('data/usuarios.json'),
      categorias: this.http.get<Categoria[]>('data/categorias.json'),
      publicaciones: this.http.get<Publicacion[]>('data/publicaciones.json'),
      trueques: this.http.get<Trueque[]>('data/trueques.json'),
      notificaciones: this.http.get<Notificacion[]>('data/notificaciones.json'),
    }).subscribe({
      next: (d) => {
        this.aplicar({ version: VERSION_DB, ...d });
        this.guardarDb();
        this._cargando.set(false);
        this.enCurso = false;
        this._listo.set(true);
      },
      error: (e) => {
        this.enCurso = false;
        this._error.set(
          'No se pudieron cargar los datos. Revisa que src/app/data esté ' +
            'publicada como asset en angular.json (debe servirse en /data).',
        );
        this._cargando.set(false);
        console.error('[XchanGo] Error cargando data/*.json:', e);
      },
    });
  }

  /** Borra lo guardado y vuelve a los JSON originales. */
  reiniciarDatos(): void {
    try {
      localStorage.removeItem(CLAVE_DB);
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      /* localStorage no disponible */
    }
    this._listo.set(false);
    this.usuarioActualId.set(null);
    this.cargar();
  }

  private aplicar(db: BaseDatos): void {
    this._usuarios.set(db.usuarios);
    this._categorias.set(db.categorias);
    this._publicaciones.set(db.publicaciones);
    this._trueques.set(db.trueques);
    this._notificaciones.set(db.notificaciones);
  }

  private leerDb(): BaseDatos | null {
    try {
      const crudo = localStorage.getItem(CLAVE_DB);
      if (!crudo) return null;
      const db = JSON.parse(crudo) as BaseDatos;
      if (db.version !== VERSION_DB) return null; // semilla nueva: se regenera
      return db;
    } catch {
      return null;
    }
  }

  private guardarDb(): void {
    try {
      const db: BaseDatos = {
        version: VERSION_DB,
        usuarios: this._usuarios(),
        categorias: this._categorias(),
        publicaciones: this._publicaciones(),
        trueques: this._trueques(),
        notificaciones: this._notificaciones(),
      };
      localStorage.setItem(CLAVE_DB, JSON.stringify(db));
    } catch {
      /* cuota llena o incógnito: la app sigue funcionando en memoria */
    }
  }

  private leerSesion(): string | null {
    try {
      return localStorage.getItem(CLAVE_SESION);
    } catch {
      return null;
    }
  }

  private guardarSesion(id: string | null): void {
    try {
      if (id) localStorage.setItem(CLAVE_SESION, id);
      else localStorage.removeItem(CLAVE_SESION);
    } catch {
      /* ignora */
    }
  }

  // ==================================================================
  // Sesión (HU05-HU07, HU24-HU26)
  // ==================================================================

  /** null si entra bien; si no, el mensaje de error. */
  iniciarSesion(email: string, password: string): string | null {
    const u = this._usuarios().find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!u) return 'No existe una cuenta con ese correo.';
    if (u.password !== password) return 'La contraseña es incorrecta.';
    if (u.estado === 'suspendido') return 'Tu cuenta está suspendida.';

    this.usuarioActualId.set(u.id);
    this.guardarSesion(u.id);
    return null;
  }

  cerrarSesion(): void {
    this.usuarioActualId.set(null);
    this.guardarSesion(null);
  }

  /** HU01-HU03. null si registra bien; si no, el mensaje de error. */
  registrar(datos: {
    nombre: string;
    email: string;
    password: string;
    telefono: string;
    ubicacion: string;
  }): string | null {
    const email = datos.email.trim().toLowerCase();
    if (!datos.nombre.trim()) return 'El nombre es obligatorio.';
    if (this._usuarios().some((u) => u.email.toLowerCase() === email)) {
      return 'Ese correo ya está registrado.';
    }
    if (datos.password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    const nuevo: Usuario = {
      id: this.siguienteId('u', this._usuarios()),
      nombre: datos.nombre.trim(),
      email,
      telefono: datos.telefono.replace(/\D/g, ''),
      password: datos.password,
      estado: 'activo',
      verificacion: 'no_verificado',
      descripcion: '',
      fechaRegistro: this.hoy(),
      ubicacion: datos.ubicacion || 'Yopal',
      nivelActividad: 'bajo',
      avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(email)}`,
      publicaciones: 0,
      intercambios: 0,
      reportes: 0,
      calificacion: 0,
      totalCalificaciones: 0,
    };

    this._usuarios.update((l) => [...l, nuevo]);
    this.usuarioActualId.set(nuevo.id);
    this.guardarSesion(nuevo.id);
    this.notificar(
      nuevo.id,
      'verificacion',
      'Verifica tu cuenta',
      'Tu cuenta se creó correctamente. Verifica tu correo para publicar.',
      null,
    );
    this.guardarDb();
    return null;
  }

  /** HU21-HU23. */
  actualizarPerfil(
    cambios: Partial<
      Pick<Usuario, 'nombre' | 'telefono' | 'ubicacion' | 'descripcion' | 'avatar'>
    >,
  ): boolean {
    const id = this.usuarioActualId();
    if (!id) return false;
    this._usuarios.update((l) => l.map((u) => (u.id === id ? { ...u, ...cambios } : u)));
    this.guardarDb();
    return true;
  }

  /** HU24-HU26. */
  cambiarPassword(actual: string, nueva: string): string | null {
    const u = this.usuarioActual();
    if (!u) return 'No hay sesión activa.';
    if (u.password !== actual) return 'La contraseña actual no coincide.';
    if (nueva.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
    this._usuarios.update((l) =>
      l.map((x) => (x.id === u.id ? { ...x, password: nueva } : x)),
    );
    this.guardarDb();
    return null;
  }

  /** HU15-HU17. */
  verificarCuenta(): void {
    const id = this.usuarioActualId();
    if (!id) return;
    this._usuarios.update((l) =>
      l.map((u) => (u.id === id ? { ...u, verificacion: 'verificado' as const } : u)),
    );
    this.guardarDb();
  }

  // ==================================================================
  // Publicaciones
  // ==================================================================

  readonly todas = computed<PublicacionVista[]>(() => {
    const usuarios = new Map(this._usuarios().map((u) => [u.id, u]));
    const categorias = new Map(this._categorias().map((c) => [c.id, c]));
    const favoritos = this._favoritos();

    const propuestas = new Map<string, number>();
    for (const t of this._trueques()) {
      propuestas.set(t.publicacionId, (propuestas.get(t.publicacionId) ?? 0) + 1);
    }

    return this._publicaciones().map((p) => {
      const autor = usuarios.get(p.usuarioId);
      const nombreCategoria = categorias.get(p.categoriaId)?.nombre ?? 'Sin categoría';
      const digital = p.tipo === 'bien_digital';

      return {
        ...p,
        autor: autor?.nombre ?? 'Usuario desconocido',
        avatar: autor?.avatar ?? '',
        telefono: autor?.telefono ?? '',
        ciudad: digital ? 'Entrega digital' : p.municipio,
        categoria: nombreCategoria,
        imagen: p.imagenes[0] ?? IMAGEN_RESPALDO,
        favorito: favoritos.has(p.id),
        tipoEtiqueta: ETIQUETA_TIPO[p.tipo],
        claseBadge: CLASE_BADGE_TIPO[p.tipo],
        caracteristicas: this.fichaTecnica(p, nombreCategoria),
        interesesCambio: this.separarIntereses(p.buscas),
        publicadoHace: this.textoRelativo(p.fechaCreacion),
        propuestas: propuestas.get(p.id) ?? 0,
      } as PublicacionVista;
    });
  });

  readonly publicaciones = computed<PublicacionVista[]>(() =>
    this.todas().filter((p) => p.estado !== 'eliminada'),
  );

  readonly misPublicaciones = computed<PublicacionVista[]>(() => {
    const id = this.usuarioActualId();
    return id
      ? this.todas().filter((p) => p.usuarioId === id && p.estado !== 'eliminada')
      : [];
  });

  readonly favoritos = computed<PublicacionVista[]>(() =>
    this.publicaciones().filter((p) => p.favorito),
  );

  obtenerPorId(id: string): PublicacionVista | undefined {
    return this.todas().find((p) => p.id === id);
  }

  /** HU27-HU29. Devuelve el id creado, o null si no hay sesión. */
  crearPublicacion(datos: DatosPublicacion): string | null {
    const usuario = this.usuarioActual();
    if (!usuario) return null;

    const id = this.siguienteId('pub', this._publicaciones());
    const nueva = this.armarPorTipo(
      {
        id,
        usuarioId: usuario.id,
        categoriaId: datos.categoriaId,
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        ofreces: datos.ofreces.trim() || datos.titulo.trim(),
        buscas: datos.buscas.trim(),
        imagenes: datos.imagenes?.length ? datos.imagenes : [],
        estado: 'activa',
        vistas: 0,
        fechaCreacion: this.hoy(),
        fechaModificacion: this.hoy(),
      },
      datos,
    );

    this._publicaciones.update((l) => [nueva, ...l]);
    this.recalcularPublicaciones(usuario.id);
    this.guardarDb();
    return id;
  }

  /** HU30-HU32. */
  actualizarPublicacion(id: string, datos: DatosPublicacion): boolean {
    const actual = this._publicaciones().find((p) => p.id === id);
    if (!actual || actual.usuarioId !== this.usuarioActualId()) return false;

    const actualizada = this.armarPorTipo(
      {
        id: actual.id,
        usuarioId: actual.usuarioId,
        categoriaId: datos.categoriaId,
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        ofreces: datos.ofreces.trim() || datos.titulo.trim(),
        buscas: datos.buscas.trim(),
        imagenes: datos.imagenes?.length ? datos.imagenes : actual.imagenes,
        estado: actual.estado,
        vistas: actual.vistas,
        fechaCreacion: actual.fechaCreacion,
        fechaModificacion: this.hoy(),
      },
      datos,
    );

    this._publicaciones.update((l) => l.map((p) => (p.id === id ? actualizada : p)));
    this.guardarDb();
    return true;
  }

  /** HU33-HU35. No borra el registro: cambia el estado. */
  eliminarPublicacion(id: string): boolean {
    const p = this._publicaciones().find((x) => x.id === id);
    if (!p || p.usuarioId !== this.usuarioActualId()) return false;
    this._publicaciones.update((l) =>
      l.map((x) => (x.id === id ? { ...x, estado: 'eliminada' as const } : x)),
    );
    this.recalcularPublicaciones(p.usuarioId);
    this.guardarDb();
    return true;
  }

  /** Pausa o reactiva una publicación propia. */
  alternarEstadoPublicacion(id: string): void {
    this._publicaciones.update((l) =>
      l.map((p) => {
        if (p.id !== id || p.usuarioId !== this.usuarioActualId()) return p;
        if (p.estado === 'activa') return { ...p, estado: 'pausada' as const };
        if (p.estado === 'pausada') return { ...p, estado: 'activa' as const };
        return p;
      }),
    );
    this.guardarDb();
  }

  /**
   * Arma la publicación según el tipo. Aquí es donde se garantiza que un bien
   * digital nunca termine con municipio y que un servicio nunca guarde barrio.
   */
  private armarPorTipo(
    base: Record<string, unknown>,
    datos: DatosPublicacion,
  ): Publicacion {
    if (datos.tipo === 'bien_fisico') {
      return {
        ...base,
        tipo: 'bien_fisico',
        municipio: datos.municipio ?? '',
        barrio: datos.barrio ?? '',
        cantidadDisponible: datos.cantidadDisponible || '1 unidad',
        disponibilidad: datos.disponibilidad || 'Por acordar',
      } as unknown as Publicacion;
    }
    if (datos.tipo === 'servicio') {
      return {
        ...base,
        tipo: 'servicio',
        municipio: datos.municipio ?? '',
        cantidadDisponible: datos.cantidadDisponible || '1 sesión',
        disponibilidad: datos.disponibilidad || 'Por acordar',
      } as unknown as Publicacion;
    }
    return { ...base, tipo: 'bien_digital' } as unknown as Publicacion;
  }

  private recalcularPublicaciones(usuarioId: string): void {
    const n = this._publicaciones().filter(
      (p) => p.usuarioId === usuarioId && p.estado !== 'eliminada',
    ).length;
    this._usuarios.update((l) =>
      l.map((u) => (u.id === usuarioId ? { ...u, publicaciones: n } : u)),
    );
  }

  etiquetaTipo(tipo: TipoPublicacion): string {
    return ETIQUETA_TIPO[tipo];
  }

  /** Solo clases que ya existen en el CSS del proyecto. */
  claseBadge(tipo: TipoPublicacion): string {
    return CLASE_BADGE_TIPO[tipo] ?? 'badge';
  }

  calificacionDe(usuarioId: string): number {
    return this._usuarios().find((u) => u.id === usuarioId)?.calificacion ?? 0;
  }

  private fichaTecnica(
    p: Publicacion,
    categoria: string,
  ): { label: string; valor: string }[] {
    const filas: { label: string; valor: string }[] = [
      { label: 'Tipo', valor: ETIQUETA_TIPO[p.tipo] },
      { label: 'Categoría', valor: categoria },
      { label: 'Ofrece', valor: p.ofreces },
      { label: 'Busca', valor: p.buscas },
    ];
    if (p.tipo === 'bien_fisico') {
      filas.push(
        { label: 'Municipio', valor: p.municipio },
        { label: 'Barrio', valor: p.barrio },
        { label: 'Cantidad disponible', valor: p.cantidadDisponible },
        { label: 'Disponibilidad', valor: p.disponibilidad },
      );
    } else if (p.tipo === 'servicio') {
      filas.push(
        { label: 'Municipio', valor: p.municipio },
        { label: 'Cantidad disponible', valor: p.cantidadDisponible },
        { label: 'Disponibilidad', valor: p.disponibilidad },
      );
    } else {
      filas.push({ label: 'Entrega', valor: 'Inmediata / digital' });
    }
    return filas;
  }

  private separarIntereses(buscas: string): string[] {
    const partes = buscas
      .split(/\s*(?:,|\bo\b)\s*/i)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    return partes.length ? partes : ['Abierto a propuestas'];
  }

  private textoRelativo(fecha: string): string {
    const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000);
    if (dias <= 0) return 'Publicado hoy';
    if (dias === 1) return 'Publicado ayer';
    return `Publicado hace ${dias} días`;
  }

  // ==================================================================
  // Trueques (HU42-HU53)
  // ==================================================================

  readonly trueques = computed<TruequeVista[]>(() => {
    const usuarios = new Map(this._usuarios().map((u) => [u.id, u]));
    const publicaciones = new Map(this._publicaciones().map((p) => [p.id, p]));

    return this._trueques().map((t) => {
      const sol = usuarios.get(t.solicitanteId);
      const pro = usuarios.get(t.propietarioId);
      return {
        ...t,
        solicitanteNombre: sol?.nombre ?? 'Usuario desconocido',
        solicitanteAvatar: sol?.avatar ?? '',
        solicitanteTelefono: sol?.telefono ?? '',
        propietarioNombre: pro?.nombre ?? 'Usuario desconocido',
        propietarioTelefono: pro?.telefono ?? '',
        publicacionTitulo:
          publicaciones.get(t.publicacionId)?.titulo ?? 'Publicación no disponible',
      };
    });
  });

  readonly truequesRecibidos = computed<TruequeVista[]>(() =>
    this.trueques().filter((t) => t.propietarioId === this.usuarioActualId()),
  );

  readonly truequesEnviados = computed<TruequeVista[]>(() =>
    this.trueques().filter((t) => t.solicitanteId === this.usuarioActualId()),
  );

  readonly solicitudesPendientes = computed(
    () => this.truequesRecibidos().filter((t) => t.estado === 'pendiente').length,
  );

  /** HU42-HU44. null si se envía bien; si no, el mensaje de error. */
  solicitarTrueque(publicacionId: string, ofrece: string): string | null {
    const yo = this.usuarioActual();
    if (!yo) return 'Inicia sesión para proponer un trueque.';

    const pub = this._publicaciones().find((p) => p.id === publicacionId);
    if (!pub) return 'La publicación ya no existe.';
    if (pub.usuarioId === yo.id) return 'Esta publicación es tuya.';
    if (pub.estado !== 'activa') return 'Esta publicación no está disponible.';

    const repetida = this._trueques().some(
      (t) =>
        t.publicacionId === publicacionId &&
        t.solicitanteId === yo.id &&
        (t.estado === 'pendiente' || t.estado === 'aceptado'),
    );
    if (repetida) return 'Ya tienes una propuesta abierta para esta publicación.';

    const nuevo: Trueque = {
      id: this.siguienteId('tr', this._trueques()),
      solicitanteId: yo.id,
      propietarioId: pub.usuarioId,
      publicacionId,
      ofrece: ofrece.trim() || 'Propuesta por acordar',
      busca: pub.titulo,
      estado: 'pendiente',
      fechaSolicitud: this.hoy(),
      fechaCierre: null,
      confirmadoSolicitante: false,
      confirmadoPropietario: false,
      calificacionSolicitante: null,
      calificacionPropietario: null,
    };

    this._trueques.update((l) => [nuevo, ...l]);
    this.notificar(
      pub.usuarioId,
      'solicitud',
      'Nueva solicitud de trueque',
      `${yo.nombre} quiere truequear por tu publicación "${pub.titulo}".`,
      nuevo.id,
    );
    this.guardarDb();
    return null;
  }

  /** HU46. */
  aceptarTrueque(truequeId: string): void {
    const t = this._trueques().find((x) => x.id === truequeId);
    if (!t || t.propietarioId !== this.usuarioActualId()) return;
    this.cambiarEstadoTrueque(truequeId, 'aceptado');
    this.notificar(
      t.solicitanteId,
      'aceptada',
      'Tu solicitud fue aceptada',
      'Aceptaron tu propuesta. Continúa la negociación por WhatsApp.',
      truequeId,
    );
    this.guardarDb();
  }

  /** HU47. */
  rechazarTrueque(truequeId: string): void {
    const t = this._trueques().find((x) => x.id === truequeId);
    if (!t || t.propietarioId !== this.usuarioActualId()) return;
    this.cambiarEstadoTrueque(truequeId, 'rechazado', this.hoy());
    this.notificar(
      t.solicitanteId,
      'rechazada',
      'Tu solicitud fue rechazada',
      `Tu propuesta por "${this.tituloDe(t.publicacionId)}" fue rechazada.`,
      truequeId,
    );
    this.guardarDb();
  }

  /** HU51-HU52. Cuando confirman ambas partes, el trueque queda completado. */
  confirmarTrueque(truequeId: string): void {
    const yo = this.usuarioActualId();
    if (!yo) return;

    this._trueques.update((l) =>
      l.map((t) => {
        if (t.id !== truequeId) return t;
        const soySolicitante = t.solicitanteId === yo;
        const soyPropietario = t.propietarioId === yo;
        if (!soySolicitante && !soyPropietario) return t;
        if (t.estado !== 'aceptado') return t;

        const conf: Trueque = {
          ...t,
          confirmadoSolicitante: soySolicitante ? true : t.confirmadoSolicitante,
          confirmadoPropietario: soyPropietario ? true : t.confirmadoPropietario,
        };
        if (conf.confirmadoSolicitante && conf.confirmadoPropietario) {
          conf.estado = 'completado';
          conf.fechaCierre = this.hoy();
        }
        return conf;
      }),
    );

    const t = this._trueques().find((x) => x.id === truequeId);
    if (t?.estado === 'completado') {
      // La publicación queda finalizada, salvo los digitales (son ilimitados).
      this._publicaciones.update((l) =>
        l.map((p) =>
          p.id === t.publicacionId && p.tipo !== 'bien_digital'
            ? { ...p, estado: 'finalizada' as const }
            : p,
        ),
      );
      for (const uid of [t.solicitanteId, t.propietarioId]) {
        this.notificar(
          uid,
          'completada',
          'Trueque completado',
          `El trueque de "${this.tituloDe(t.publicacionId)}" quedó cerrado. Ya puedes calificar.`,
          t.id,
        );
        this.recalcularIntercambios(uid);
      }
    }
    this.guardarDb();
  }

  /** HU53. Nota de 1 a 5 que da el usuario en sesión. */
  calificarTrueque(truequeId: string, nota: number): void {
    const yo = this.usuarioActualId();
    if (!yo || nota < 1 || nota > 5) return;

    this._trueques.update((l) =>
      l.map((t) => {
        if (t.id !== truequeId || t.estado !== 'completado') return t;
        if (t.solicitanteId === yo) return { ...t, calificacionSolicitante: nota };
        if (t.propietarioId === yo) return { ...t, calificacionPropietario: nota };
        return t;
      }),
    );
    this.recalcularCalificaciones();
    this.guardarDb();
  }

  /** Nota que YA dio el usuario en sesión en ese trueque (0 si no ha calificado). */
  miCalificacion(t: TruequeVista): number {
    const yo = this.usuarioActualId();
    if (t.solicitanteId === yo) return t.calificacionSolicitante ?? 0;
    if (t.propietarioId === yo) return t.calificacionPropietario ?? 0;
    return 0;
  }

  private cambiarEstadoTrueque(
    id: string,
    estado: Trueque['estado'],
    cierre?: string,
  ): void {
    this._trueques.update((l) =>
      l.map((t) => (t.id === id ? { ...t, estado, fechaCierre: cierre ?? t.fechaCierre } : t)),
    );
  }

  private tituloDe(publicacionId: string): string {
    return (
      this._publicaciones().find((p) => p.id === publicacionId)?.titulo ?? 'la publicación'
    );
  }

  private recalcularIntercambios(usuarioId: string): void {
    const n = this._trueques().filter(
      (t) =>
        t.estado === 'completado' &&
        (t.solicitanteId === usuarioId || t.propietarioId === usuarioId),
    ).length;
    this._usuarios.update((l) =>
      l.map((u) => (u.id === usuarioId ? { ...u, intercambios: n } : u)),
    );
  }

  private recalcularCalificaciones(): void {
    const recibidas = new Map<string, number[]>();
    const push = (id: string, n: number) => {
      const arr = recibidas.get(id) ?? [];
      arr.push(n);
      recibidas.set(id, arr);
    };
    for (const t of this._trueques()) {
      if (t.calificacionSolicitante !== null) push(t.propietarioId, t.calificacionSolicitante);
      if (t.calificacionPropietario !== null) push(t.solicitanteId, t.calificacionPropietario);
    }
    this._usuarios.update((l) =>
      l.map((u) => {
        const notas = recibidas.get(u.id) ?? [];
        return {
          ...u,
          totalCalificaciones: notas.length,
          calificacion: notas.length
            ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10
            : 0,
        };
      }),
    );
  }

  // ==================================================================
  // Notificaciones (HU54-HU59). Avisos de una vía, NO mensajería.
  // ==================================================================

  readonly notificaciones = computed<Notificacion[]>(() => {
    const id = this.usuarioActualId();
    if (!id) return [];
    return this._notificaciones()
      .filter((n) => n.usuarioId === id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  });

  readonly notificacionesSinLeer = computed(
    () => this.notificaciones().filter((n) => !n.leida).length,
  );

  marcarNotificacionLeida(id: string): void {
    this._notificaciones.update((l) => l.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    this.guardarDb();
  }

  marcarTodasLeidas(): void {
    const yo = this.usuarioActualId();
    this._notificaciones.update((l) =>
      l.map((n) => (n.usuarioId === yo ? { ...n, leida: true } : n)),
    );
    this.guardarDb();
  }

  private notificar(
    usuarioId: string,
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
    referenciaId: string | null,
  ): void {
    this._notificaciones.update((l) => [
      {
        id: this.siguienteId('not', l),
        usuarioId,
        tipo,
        titulo,
        mensaje,
        referenciaId,
        leida: false,
        fecha: new Date().toISOString(),
      },
      ...l,
    ]);
  }

  // ==================================================================
  // WhatsApp (reemplaza cualquier idea de chat interno)
  // ==================================================================

  enlaceWhatsApp(publicacion: PublicacionVista): string | null {
    if (!publicacion.telefono) return null;
    if (publicacion.usuarioId === this.usuarioActualId()) return null;

    const yo = this.usuarioActual()?.nombre ?? 'un usuario de XchanGo';
    const texto =
      `Hola ${publicacion.autor}, soy ${yo}. ` +
      `Vi tu publicación "${publicacion.titulo}" en XchanGo y quiero proponerte un trueque. ` +
      `Tú buscas: ${publicacion.buscas}. ¿Lo hablamos?`;
    return this.construirEnlace(publicacion.telefono, texto);
  }

  /** Contacto con la contraparte de un trueque ya iniciado. */
  enlaceWhatsAppTrueque(t: TruequeVista): string | null {
    const yo = this.usuarioActualId();
    const soyPropietario = t.propietarioId === yo;
    const telefono = soyPropietario ? t.solicitanteTelefono : t.propietarioTelefono;
    const destino = soyPropietario ? t.solicitanteNombre : t.propietarioNombre;
    if (!telefono) return null;

    const texto =
      `Hola ${destino}, te escribo desde XchanGo por el trueque de ` +
      `"${t.publicacionTitulo}". Ofrezco: ${t.ofrece}.`;
    return this.construirEnlace(telefono, texto);
  }

  abrirWhatsApp(enlace: string | null): void {
    if (enlace) window.open(enlace, '_blank');
  }

  private construirEnlace(telefono: string, texto: string): string {
    const d = telefono.replace(/\D/g, '');
    return `https://wa.me/${d.startsWith('57') ? d : '57' + d}?text=${encodeURIComponent(texto)}`;
  }

  // ==================================================================
  // Favoritos
  // ==================================================================

  alternarFavorito(publicacion: { id: string }): void {
    this._favoritos.update((a) => {
      const c = new Set(a);
      if (c.has(publicacion.id)) c.delete(publicacion.id);
      else c.add(publicacion.id);
      try {
        localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify([...c]));
      } catch {
        /* ignora */
      }
      return c;
    });
  }

  esFavorito(id: string): boolean {
    return this._favoritos().has(id);
  }

  private leerFavoritos(): ReadonlySet<string> {
    try {
      const g = localStorage.getItem(CLAVE_FAVORITOS);
      if (!g) return new Set<string>();
      const ids: unknown = JSON.parse(g);
      return new Set(
        Array.isArray(ids) ? ids.filter((i): i is string => typeof i === 'string') : [],
      );
    } catch {
      return new Set<string>();
    }
  }

  // ==================================================================
  // Utilidades
  // ==================================================================

  private siguienteId(prefijo: string, lista: { id: string }[]): string {
    let max = 0;
    for (const x of lista) {
      const n = Number(x.id.replace(prefijo, ''));
      if (!Number.isNaN(n) && n > max) max = n;
    }
    return `${prefijo}${max + 1}`;
  }

  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
