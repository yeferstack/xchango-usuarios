import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-barras',
  standalone: true,
  imports: [],
  templateUrl: './chart-barras.html',
  styleUrl: './chart-barras.css',
})
export class ChartBarras {
  readonly datos = input<any[]>([]);
  readonly color = input<string>('');
  readonly modoCrecimiento = input<boolean>(false);

  maximo(): number { return Math.max(...this.datos().map(d => Math.abs(d.valor)), 1); }
  magnitud(valor: number): number { return Math.abs(valor); }
}