import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TruequesService } from '../../services/trueques';

/**
 * HU05-HU07: inicio de sesión con correo y contraseña.
 *
 * La landing (`/login`) solo elegía un método; no existía un formulario real.
 * Esta página lo aporta y respeta el parámetro `volverA` que pone el guard.
 */
@Component({
  selector: 'app-acceso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css',
})
export class AccesoComponent implements OnInit {
  private readonly srv = inject(TruequesService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly error = signal('');
  private volverA = '/home';

  ngOnInit(): void {
    this.srv.cargar();
    this.volverA = this.ruta.snapshot.queryParamMap.get('volverA') ?? '/home';
  }

  entrar(): void {
    this.error.set('');
    if (!this.srv.listo()) {
      this.error.set('Los datos aún se están cargando, intenta en un segundo.');
      return;
    }
    const err = this.srv.iniciarSesion(this.email, this.password);
    if (err) {
      this.error.set(err);
      return;
    }
    this.router.navigateByUrl(this.volverA);
  }

  /** Atajo de demostración: entra como Carlos Ospina. */
  entrarDemo(): void {
    this.email = 'carlos.ospina@mail.com';
    this.password = 'Carlos123*';
    this.entrar();
  }
}
