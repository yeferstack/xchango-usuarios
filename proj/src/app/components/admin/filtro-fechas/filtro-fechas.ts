import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type PeriodoFiltro =
  | 'hoy'
  | 'semana'
  | 'mes'
  | 'año'
  | 'personalizado';

export interface RangoFechas {
  desde: string;
  hasta: string;
  periodo: PeriodoFiltro;
}

@Component({
  selector: 'app-filtro-fechas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filtro-fechas.html',
  styleUrl: './filtro-fechas.css',
})
export class FiltroFechas {

  readonly cambio = output<RangoFechas>();

  readonly desde = signal('');
  readonly hasta = signal('');
  readonly periodo = signal<PeriodoFiltro>('mes');

  cambiarRango(r: RangoFechas): void {
    this.desde.set(r.desde);
    this.hasta.set(r.hasta);
    this.periodo.set(r.periodo);

    this.cambio.emit(r);
  }

  cambiarPeriodo(periodo: PeriodoFiltro): void {
    this.periodo.set(periodo);
    this.cambio.emit({ desde: this.desde(), hasta: this.hasta(), periodo });
  }

  emitir(): void {
    this.cambio.emit({ desde: this.desde(), hasta: this.hasta(), periodo: this.periodo() });
  }
}