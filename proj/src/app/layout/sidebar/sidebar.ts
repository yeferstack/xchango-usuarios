import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface CategoriaTrueque {
  id: string;
  nombre: string;
  icono: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  /** Lista de categorías a mostrar; la define el componente padre (home) */
  @Input() categorias: CategoriaTrueque[] = [];

  /** Id de la categoría actualmente seleccionada, controlado desde el padre */
  @Input() categoriaSeleccionada = 'todos';

  /** Se emite cuando el usuario hace clic en una categoría */
  @Output() categoriaCambiada = new EventEmitter<string>();

  /** Se emite cuando el usuario hace clic en "Publicar un trueque" */
  @Output() publicar = new EventEmitter<void>();

  seleccionar(id: string): void {
    this.categoriaCambiada.emit(id);
  }

  onPublicar(): void {
    this.publicar.emit();
  }
}
