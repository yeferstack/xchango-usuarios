import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [Icon],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  readonly etiqueta = input<string>('');
  readonly valor = input<string | number>(0);
  readonly icono = input<string>('');
  readonly variacion = input<number | null>(null);
  readonly detalle = input<string>('');
  readonly tono = input<string>('');
}