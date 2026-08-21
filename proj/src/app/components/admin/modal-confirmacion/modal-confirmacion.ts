import { Component, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [Icon],
  templateUrl: './modal-confirmacion.html',
  styleUrl: './modal-confirmacion.css',
})
export class ModalConfirmacion {
  readonly abierto = input<boolean>(false);
  readonly titulo = input<string>('');
  readonly mensaje = input<string>('');
  readonly textoConfirmar = input<string>('Confirmar');
  readonly icono = input<string>('alert');
  readonly tono = input<string>('warn');
  readonly pideMotivo = input<boolean>(false);
  readonly etiquetaMotivo = input<string>('Motivo');

  readonly confirmar = output<string>();
  readonly cancelar = output<void>();
  readonly motivo = signal('');
}