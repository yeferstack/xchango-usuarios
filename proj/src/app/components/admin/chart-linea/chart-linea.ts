import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-linea',
  standalone: true,
  imports: [],
  templateUrl: './chart-linea.html',
  styleUrl: './chart-linea.css',
})
export class ChartLinea {

  readonly datos = input<any[]>([]);
  readonly color = input<string>('#a1785a');

  maximo(): number { return Math.max(...this.datos().map(d => d.valor), 1); }

}