import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [],
  templateUrl: './paginacion.html',
  styleUrl: './paginacion.css',
})
export class Paginacion {

  readonly total = input<number>(0);
  readonly porPagina = input<number>(10);
  readonly pagina = input<number>(1);

  readonly cambio = output<number>();
}