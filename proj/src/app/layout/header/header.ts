import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  /** Texto de búsqueda, controlado desde el padre (soporta [(busqueda)]) */
  @Input() busqueda = '';
  @Output() busquedaChange = new EventEmitter<string>();

  /** Cantidad de notificaciones sin leer */
  @Input() notificaciones = 0;

  /** Cantidad de trueques marcados como favoritos */
  @Input() cantidadFavoritos = 0;

  /** Si la vista actual está mostrando solo favoritos */
  @Input() mostrarSoloFavoritos = false;

  /** URL del avatar del usuario logueado */
  @Input() avatarUrl = 'https://i.pravatar.cc/40?img=68';

  /** Se emite al hacer clic en "Inicio" */
  @Output() irAInicio = new EventEmitter<void>();

  /** Se emite al hacer clic en "Favoritos" */
  @Output() verSoloFavoritos = new EventEmitter<void>();

  /** Se emite al hacer clic en "Servicios": el home filtra por ese tipo */
  @Output() verServicios = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBusquedaChange(valor: string): void {
    this.busqueda = valor;
    this.busquedaChange.emit(valor);
  }

  onInicio(): void {
    this.irAInicio.emit();
  }

  onFavoritos(): void {
    this.verSoloFavoritos.emit();
  }

  onServicios(): void {
    this.verServicios.emit();
  }

  /** La foto de la derecha lleva al perfil del usuario. */
  irAPerfil(): void {
    this.router.navigate(['/perfil']);
  }
}
