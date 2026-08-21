import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal
} from '@angular/core';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MetodoAcceso, ModoAuth, MetodoAuth } from './metodo-acceso/metodo-acceso';

export interface Producto {
  imagen: string;
  nombre: string;
  ubicacion: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
  imports: [MetodoAcceso],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login implements OnInit, OnDestroy {

  /* =========================================================
     PRODUCTOS DESTACADOS
     ========================================================= */

  productos: Producto[] = [

    {
      imagen: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=220&fit=crop',
      nombre: 'Canon EOS 200D',
      ubicacion: 'Yopal'
    },

    {
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtPnCA_0TO68aqvqwfOV-sHfTd_Ejn832DODwDfBBQ5MTNboRLkpWWl3HU&s=10',
      nombre: 'Smartwatch',
      ubicacion: 'Mani'
    },

    {
      imagen: 'https://http2.mlstatic.com/D_NQ_NP_694714-CBT109951411899_042026-O.webp',
      nombre: 'Tenis deportivos',
      ubicacion: 'Yopal'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=220&fit=crop',
      nombre: 'Audífonos inalám',
      ubicacion: 'Yopal'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=220&fit=crop',
      nombre: 'MacBook Air M1',
      ubicacion: 'Monterrey'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=220&fit=crop',
      nombre: 'Bicicleta GW',
      ubicacion: 'Mani'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&h=220&fit=crop',
      nombre: 'PlayStation 5',
      ubicacion: 'Aguazul'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=220&fit=crop',
      nombre: 'Audífonos Sony',
      ubicacion: 'Yopal'
    },

    {
      imagen: 'https://silloneschile.cl/wp-content/uploads/2023/08/silloneschile.cl-sofa-de-cuero.webp',
      nombre: 'Sillon Clasico',
      ubicacion: 'Monterrey'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=220&fit=crop',
      nombre: 'Gafas de sol',
      ubicacion: 'Aguazul'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=220&fit=crop',
      nombre: 'Jean clásico',
      ubicacion: 'Villanueva'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=220&fit=crop',
      nombre: 'Chaqueta',
      ubicacion: 'Aguazul'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=220&fit=crop',
      nombre: 'Cámara digital',
      ubicacion: 'Yopal'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1593642532744-d377ab507dc8?w=300&h=220&fit=crop',
      nombre: 'Laptop Lenovo',
      ubicacion: 'Monterrey'
    },

    {
      imagen: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=220&fit=crop',
      nombre: 'Camiseta deportiva',
      ubicacion: 'Yopal'
    }

  ];


  /* =========================================================
     CONFIGURACIÓN
     ========================================================= */

  private readonly visibles = 4;

  private readonly dotsCount = 4;

  private readonly intervalo = 5000;

  // Antes 500ms de fundido + 100ms extra de espera = 600ms
  // en los que las tarjetas se veían "fantasma"/en blanco.
  // Se acorta a 260ms para que el bache casi no se note.
  private readonly duracionFundido = 260;


  /* =========================================================
     TIMERS
     ========================================================= */

  private timerCarrusel?: ReturnType<typeof setInterval>;

  private timerFundido?: ReturnType<typeof setTimeout>;
  private timerReaparicion?: ReturnType<typeof setTimeout>;


  /* =========================================================
     ESTADOS CARRUSEL
     ========================================================= */

  readonly inicio = signal(0);

  readonly atenuado = signal(false);

  readonly cambiando = signal(false);

  readonly pausado = signal(false);


  /* =========================================================
     ESTADO MODAL DE AUTENTICACIÓN
     ========================================================= */

  readonly modalAbierto = signal(false);

  readonly modoAuth = signal<ModoAuth>('login');


  /* =========================================================
     PRODUCTOS VISIBLES
     ========================================================= */

  readonly productosVisibles = computed<Producto[]>(() => {

    const lista = this.productos;

    const posicion = this.inicio();

    const resultado: Producto[] = [];

    /*
     * Siempre mostramos 4 productos. Si nos acercamos al final
     * de la lista, damos la vuelta con módulo para no dejar
     * espacios vacíos nunca.
     */

    for (let i = 0; i < this.visibles; i++) {

      resultado.push(
        lista[(posicion + i) % lista.length]
      );

    }

    return resultado;

  });


  /* =========================================================
     PUNTO ACTIVO
     ========================================================= */

  readonly puntoActivo = computed(() => {

    const posicion = this.inicio();

    /*
     * Repartimos el total de productos en `dotsCount` segmentos
     * (no en grupos de `visibles`, que es un valor distinto y
     * solo coincidía con dotsCount por casualidad). Con 15
     * productos y 4 puntos: segmento = ceil(15/4) = 4
     * → posiciones 0-3 = punto 0, 4-7 = punto 1, 8-11 = punto 2,
     *   12-14 = punto 3.
     * El Math.min evita que el índice se pase del último punto
     * si la división no es exacta.
     */

    const segmento = Math.ceil(this.productos.length / this.dotsCount);

    return Math.min(
      Math.floor(posicion / segmento),
      this.dotsCount - 1
    );

  });


  /* =========================================================
     CICLO DE VIDA
     ========================================================= */

  ngOnInit(): void {

    this.iniciarCarrusel();

  }


  ngOnDestroy(): void {

    this.detenerCarrusel();

  }


  /* =========================================================
     PAUSAR
     ========================================================= */

  pausar(): void {

    this.pausado.set(true);

  }


  reanudar(): void {

    this.pausado.set(false);

  }


  /* =========================================================
     MODAL DE AUTENTICACIÓN
     ========================================================= */

  abrirModal(modo: ModoAuth): void {

    this.modoAuth.set(modo);
    this.modalAbierto.set(true);

  }

  cerrarModal(): void {

    this.modalAbierto.set(false);

  }

  cambiarModoAuth(modo: ModoAuth): void {

    this.modoAuth.set(modo);

  }

  private readonly router = inject(Router);

  onMetodoSeleccionado(metodo: MetodoAuth): void {
    this.cerrarModal();

    // Google y Apple no están implementados: se resuelve todo por correo.
    if (this.modoAuth() === 'registro') {
      this.router.navigate(['/formulario']);
    } else {
      this.router.navigate(['/acceso']);
    }
  }


  /* =========================================================
     INICIAR
     ========================================================= */

  private iniciarCarrusel(): void {

    if (this.productos.length <= this.visibles) {
      return;
    }

    this.timerCarrusel = setInterval(() => {

      if (this.pausado() || this.cambiando()) {
        return;
      }

      this.avanzar();

    }, this.intervalo);

  }


  /* =========================================================
     AVANZAR
     ========================================================= */

  private avanzar(): void {

    if (this.cambiando()) {
      return;
    }

    this.cambiando.set(true);

    /*
     * 1. Desaparecer
     */

    this.atenuado.set(true);


    this.timerFundido = setTimeout(() => {

      /*
       * 2. Avanzar UN producto, con vuelta al inicio.
       */

      this.inicio.update(valor => (valor + 1) % this.productos.length);


      /*
       * 3. Volver a aparecer.
       *    Antes había 100ms extra de espera acá, que sumados
       *    a los 500ms del fundido daban ~600ms de tarjetas casi
       *    invisibles. Se reaparece en el frame siguiente.
       */

      this.timerReaparicion = setTimeout(() => {

        this.atenuado.set(false);

        this.cambiando.set(false);

      }, 20);


    }, this.duracionFundido);

  }


  /* =========================================================
     DETENER
     ========================================================= */

  private detenerCarrusel(): void {

    if (this.timerCarrusel) {

      clearInterval(this.timerCarrusel);

      this.timerCarrusel = undefined;

    }

    if (this.timerFundido) {

      clearTimeout(this.timerFundido);

      this.timerFundido = undefined;

    }

    if (this.timerReaparicion) {

      clearTimeout(this.timerReaparicion);

      this.timerReaparicion = undefined;

    }

  }

}