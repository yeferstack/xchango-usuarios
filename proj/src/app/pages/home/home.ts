import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header';
import { SidebarComponent, CategoriaTrueque } from '../../layout/sidebar/sidebar';
import { PublicacionVista, TipoPublicacion } from '../../models/publicacion.model';
import { TruequesService } from '../../services/trueques';

type FiltroTrueque = 'todos' | 'bienes' | 'servicios' | 'digitales';

/** Cada pestaña del home corresponde a un tipo real de publicación. */
const TIPO_POR_FILTRO: Record<Exclude<FiltroTrueque, 'todos'>, TipoPublicacion> = {
  bienes: 'bien_fisico',
  servicios: 'servicio',
  digitales: 'bien_digital',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  busqueda = '';
  filtroActivo: FiltroTrueque = 'todos';
  categoriaSeleccionada = 'todos';
  mostrarSoloFavoritos = false;
  orden = 'Más recientes';

  /**
   * Catálogo único (data/categorias.json). Viene de un `computed` del servicio,
   * así que devuelve SIEMPRE la misma referencia hasta que cambian los datos.
   * No construir aquí un array nuevo: el sidebar lo recibe por @Input y Angular
   * lo vería como cambiado en cada ciclo de detección de cambios.
   */
  get categorias(): CategoriaTrueque[] {
    return this.truequesService.categoriasSidebar();
  }

  beneficios = [
    {
      titulo: 'Trueques seguros',
      descripcion: 'Perfiles verificados y comunidad confiable.',
      icono: 'shield',
    },
    {
      titulo: 'Comunidad activa',
      descripcion: 'Miles de personas intercambiando cada día.',
      icono: 'users',
    },
    {
      titulo: 'Rápido y fácil',
      descripcion: 'Publica tu trueque en minutos y recibe propuestas.',
      icono: 'bolt',
    },
    {
      titulo: 'Atención 24/7',
      descripcion: 'Estamos para ayudarte en todo momento.',
      icono: 'chat',
    },
  ];

  notificaciones = 2;

  constructor(
    private truequesService: TruequesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.truequesService.cargar();
  }

  /** Catálogo visible, ya resuelto contra usuarios y categorías. */
  get trueques(): PublicacionVista[] {
    return this.truequesService.publicaciones();
  }

  /** true mientras se cargan los JSON. */
  get cargando(): boolean {
    return this.truequesService.cargando();
  }

  /** Mensaje de error si los JSON no se pudieron cargar. */
  get errorCarga(): string | null {
    return this.truequesService.error();
  }

  /** Abre WhatsApp con el dueño. XchanGo no tiene chat interno. */
  contactarPorWhatsApp(publicacion: PublicacionVista, evento?: Event): void {
    evento?.stopPropagation();
    const enlace = this.truequesService.enlaceWhatsApp(publicacion);
    if (enlace) {
      window.open(enlace, '_blank');
    }
  }

  /** Combina búsqueda + tab (Bienes/Servicios/Digitales) + categoría del sidebar + solo-favoritos */
  get truequesFiltrados(): PublicacionVista[] {
    let resultado = this.trueques;

    if (this.mostrarSoloFavoritos) {
      resultado = resultado.filter((t) => t.favorito);
    }

    if (this.filtroActivo !== 'todos') {
      const tipo = TIPO_POR_FILTRO[this.filtroActivo];
      resultado = resultado.filter((t) => t.tipo === tipo);
    }

    if (this.categoriaSeleccionada !== 'todos') {
      resultado = resultado.filter((t) => t.categoriaId === this.categoriaSeleccionada);
    }

    if (this.busqueda.trim()) {
      const termino = this.busqueda.trim().toLowerCase();
      resultado = resultado.filter(
        (t) =>
          t.titulo.toLowerCase().includes(termino) ||
          t.autor.toLowerCase().includes(termino) ||
          t.ciudad.toLowerCase().includes(termino),
      );
    }

    return resultado;
  }

  get cantidadFavoritos(): number {
    return this.trueques.filter((t) => t.favorito).length;
  }

  seleccionarFiltro(filtro: FiltroTrueque): void {
    this.filtroActivo = filtro;
  }

  seleccionarCategoria(id: string): void {
    this.categoriaSeleccionada = id;
  }

  irAInicio(): void {
    this.mostrarSoloFavoritos = false;
    this.filtroActivo = 'todos';
    this.categoriaSeleccionada = 'todos';
    this.busqueda = '';
  }

  verSoloFavoritos(): void {
    this.mostrarSoloFavoritos = true;
  }

  alternarFavorito(trueque: PublicacionVista, evento: Event): void {
    evento.stopPropagation();
    this.truequesService.alternarFavorito(trueque);
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroActivo = 'todos';
    this.categoriaSeleccionada = 'todos';
    this.mostrarSoloFavoritos = false;
  }

  /**
   * Clase del badge por TIPO. Reutiliza SOLO clases que ya existen en tu CSS
   * (badge--bienes, badge--servicios, badge--electronicos). Cero cambios de
   * estilo.
   */
  claseBadge(tipo: TipoPublicacion): string {
    return this.truequesService.claseBadge(tipo);
  }

  publicarTrueque(): void {
    // Punto de integración: abrir modal o navegar a la ruta de publicación
    console.log('Publicar un trueque');
  }

  manejarErrorImagen(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    img.src = 'https://placehold.co/600x450/ece2c9/1f1b16?text=Sin+imagen';
  }

  /** Navega a la página de detalle del trueque (/trueque/:id). */
  irADetalle(trueque: PublicacionVista): void {
    this.router.navigate(['/trueque', trueque.id]);
  }
}