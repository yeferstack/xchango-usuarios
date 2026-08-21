import { Component } from '@angular/core';
import { IconoComponent } from '../../components/icono/icono';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [IconoComponent, CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent {

  // ==============================
  // DATOS DEL USUARIO
  // ==============================

  nombreUsuario: string = 'Miguel Perez';


  // ==============================
  // IMAGEN DE PERFIL
  // ==============================

  avatarUrl: string = '/Logo-xchango/avatar-miguel.jpeg';


  // ==============================
  // LOGO DE LA APP
  // ==============================

  logoUrl: string = '/Logo-xchango/logo-xchango.png';


  // ==============================
  // CALIFICACIONES
  // ==============================

  calificacion: number = 4;

  calificacionMaxima: number = 5;

  totalCalificacionesRequeridas: number = 5;


  // ==============================
  // GENERAR ESTRELLAS
  // ==============================

  estrellas(): boolean[] {

    return Array.from(
      { length: this.calificacionMaxima },
      (_, i) => i < this.calificacion
    );

  }

}