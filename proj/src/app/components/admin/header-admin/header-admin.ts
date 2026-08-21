import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [Icon],
  templateUrl: './header-admin.html',
  styleUrl: './header-admin.css',
})
export class HeaderAdmin {

  readonly titulo = input<string>('');
  readonly subtitulo = input<string>('');

  readonly abrirMenu = output<void>();
  readonly salir = output<void>();
}