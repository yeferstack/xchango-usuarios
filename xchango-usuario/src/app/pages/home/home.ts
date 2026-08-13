import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CategoriaTrueque {
  id: string;
  nombre: string;
  icono: string;
}

interface Trueque {
  id: number;
  titulo: string;
  tipo: 'Electrónicos' | 'Servicios' | 'Bienes Físicos' | 'Vehículos' | 'Digitales';
  imagen: string;
  autor: string;
  ciudad: string;
  avatar: string;
  favorito: boolean;
}

type FiltroTrueque = 'todos' | 'bienes' | 'servicios' | 'digitales';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  busqueda = '';
  filtroActivo: FiltroTrueque = 'todos';
  orden = 'Más recientes';

  categorias: CategoriaTrueque[] = [
    { id: 'todos', nombre: 'Todos', icono: 'grid' },
    { id: 'electronicos', nombre: 'Electrónicos', icono: 'phone' },
    { id: 'vehiculos', nombre: 'Vehículos', icono: 'car' },
    { id: 'ropa', nombre: 'Ropa', icono: 'shirt' },
    { id: 'hogar', nombre: 'Hogar', icono: 'home' },
    { id: 'deportes', nombre: 'Deportes', icono: 'bike' },
    { id: 'videojuegos', nombre: 'Videojuegos', icono: 'gamepad' },
    { id: 'libros', nombre: 'Libros', icono: 'book' },
    { id: 'muebles', nombre: 'Muebles', icono: 'cabinet' },
    { id: 'juguetes', nombre: 'Juguetes', icono: 'toy' },
  ];

  categoriaSeleccionada = 'todos';

  trueques: Trueque[] = [
    {
      id: 1,
      titulo: 'iPhone 13 \\ 128GB',
      tipo: 'Electrónicos',
      imagen: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&q=80',
      autor: 'Juan P.',
      ciudad: 'Bogotá',
      avatar: 'https://i.pravatar.cc/40?img=12',
      favorito: false,
    },
    {
      id: 2,
      titulo: 'Servicio de albañilería',
      tipo: 'Servicios',
      imagen: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
      autor: 'Carlos M.',
      ciudad: 'Medellín',
      avatar: 'https://i.pravatar.cc/40?img=33',
      favorito: false,
    },
    {
      id: 3,
      titulo: 'Servicio de jardinería',
      tipo: 'Bienes Físicos',
      imagen: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
      autor: 'Laura G.',
      ciudad: 'Cali',
      avatar: 'https://i.pravatar.cc/40?img=47',
      favorito: false,
    },
    {
      id: 4,
      titulo: 'Nissan GT-R R35',
      tipo: 'Vehículos',
      imagen: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
      autor: 'Andrés V.',
      ciudad: 'Envigado',
      avatar: 'https://i.pravatar.cc/40?img=15',
      favorito: false,
    },
    {
      id: 5,
      titulo: 'Desarrollo de páginas web',
      tipo: 'Servicios',
      imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
      autor: 'Diego C.',
      ciudad: 'Bogotá',
      avatar: 'https://i.pravatar.cc/40?img=8',
      favorito: false,
    },
    {
      id: 6,
      titulo: 'Pulsar NS 200',
      tipo: 'Bienes Físicos',
      imagen: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80',
      autor: 'Mateo L.',
      ciudad: 'Bucaramanga',
      avatar: 'https://i.pravatar.cc/40?img=51',
      favorito: false,
    },
  ];

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

  get truequesFiltrados(): Trueque[] {
    let resultado = this.trueques;

    if (this.filtroActivo === 'bienes') {
      resultado = resultado.filter(
        (t) => t.tipo === 'Bienes Físicos' || t.tipo === 'Vehículos' || t.tipo === 'Electrónicos',
      );
    } else if (this.filtroActivo === 'servicios') {
      resultado = resultado.filter((t) => t.tipo === 'Servicios');
    } else if (this.filtroActivo === 'digitales') {
      resultado = resultado.filter((t) => t.tipo === 'Digitales');
    }

    if (this.busqueda.trim()) {
      const termino = this.busqueda.trim().toLowerCase();
      resultado = resultado.filter((t) => t.titulo.toLowerCase().includes(termino));
    }

    return resultado;
  }

  seleccionarFiltro(filtro: FiltroTrueque): void {
    this.filtroActivo = filtro;
  }

  seleccionarCategoria(id: string): void {
    this.categoriaSeleccionada = id;
  }

  alternarFavorito(trueque: Trueque, evento: Event): void {
    evento.stopPropagation();
    trueque.favorito = !trueque.favorito;
  }

  claseBadge(tipo: Trueque['tipo']): string {
    switch (tipo) {
      case 'Electrónicos':
        return 'badge badge--electronicos';
      case 'Servicios':
        return 'badge badge--servicios';
      case 'Bienes Físicos':
        return 'badge badge--bienes';
      case 'Vehículos':
        return 'badge badge--vehiculos';
      default:
        return 'badge';
    }
  }

  publicarTrueque(): void {
    // Punto de integración: abrir modal o navegar a la ruta de publicación
    console.log('Publicar un trueque');
  }
}
