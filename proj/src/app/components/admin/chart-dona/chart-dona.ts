import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-dona',
  standalone: true,
  imports: [],
  templateUrl: './chart-dona.html',
  styleUrl: './chart-dona.css',
})
export class ChartDona {

  readonly datos = input<any[]>([]);
  readonly unidad = input<string>('');

  total(): number { return this.datos().reduce((s, d) => s + d.valor, 0); }

}