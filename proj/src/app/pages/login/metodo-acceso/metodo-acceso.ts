import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

export type ModoAuth = 'login' | 'registro';

export type MetodoAuth = 'google' | 'apple' | 'correo';

@Component({
  selector: 'app-metodo-acceso',
  templateUrl: './metodo-acceso.html',
  styleUrl: './metodo-acceso.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetodoAcceso {

  /* =========================================================
     ENTRADAS
     ========================================================= */

  @Input() abierto = false;

  @Input() modo: ModoAuth = 'login';


  /* =========================================================
     SALIDAS
     ========================================================= */

  @Output() cerrar = new EventEmitter<void>();

  @Output() cambiarModo = new EventEmitter<ModoAuth>();

  @Output() seleccionarMetodo = new EventEmitter<MetodoAuth>();


  /* =========================================================
     TEXTOS SEGÚN MODO
     ========================================================= */

  get titulo(): string {

    return this.modo === 'registro'
      ? 'Crear una cuenta'
      : 'Iniciar sesión';

  }

  get subtitulo(): string {

    return this.modo === 'registro'
      ? 'Elige cómo quieres crear tu cuenta'
      : 'Elige cómo quieres continuar';

  }

  get textoCambioModo(): string {

    return this.modo === 'registro'
      ? '¿Ya tienes una cuenta?'
      : '¿No tienes una cuenta?';

  }

  get accionCambioModo(): string {

    return this.modo === 'registro'
      ? 'Iniciar sesión'
      : 'Crear cuenta';

  }


  /* =========================================================
     ACCIONES
     ========================================================= */

  cerrarModal(): void {

    this.cerrar.emit();

  }

  onOverlayClick(event: MouseEvent): void {

    // Solo cierra si el clic fue exactamente sobre el overlay,
    // no si vino de un elemento hijo (el propio modal).
    if (event.target === event.currentTarget) {

      this.cerrarModal();

    }

  }

  toggleModo(): void {

    const nuevoModo: ModoAuth =
      this.modo === 'registro' ? 'login' : 'registro';

    this.cambiarModo.emit(nuevoModo);

  }

  elegirGoogle(): void {

    this.seleccionarMetodo.emit('google');

  }

  elegirApple(): void {

    this.seleccionarMetodo.emit('apple');

  }

  elegirCorreo(): void {

    this.seleccionarMetodo.emit('correo');

  }

  @HostListener('document:keydown.escape')
  onEscape(): void {

    if (this.abierto) {

      this.cerrarModal();

    }

  }

}