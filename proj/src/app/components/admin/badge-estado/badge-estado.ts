import { Component, input } from '@angular/core';

@Component({
  selector: 'app-badge-estado',
  standalone: true,
  imports: [],
  templateUrl: './badge-estado.html',
  styleUrl: './badge-estado.css',
})
export class BadgeEstado {
  readonly estado = input<string>('');
  readonly etiqueta = input<string>('');
  readonly punto = input<boolean>(true);
}