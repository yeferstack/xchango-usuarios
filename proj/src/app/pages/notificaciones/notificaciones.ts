import { Component, OnInit, inject } from '@angular/core';
import { IconoComponent } from '../../components/icono/icono';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { TruequesService } from '../../services/trueques';
import { Notificacion } from '../../models/notificacion.model';

/**
 * HU54-HU59: bandeja de avisos.
 *
 * NO es mensajería. Son avisos de una sola vía; la conversación real ocurre en
 * WhatsApp. Por eso no hay campo para responder.
 */
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [IconoComponent, CommonModule, RouterLink],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class NotificacionesComponent implements OnInit {
  private readonly srv = inject(TruequesService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly notificaciones = this.srv.notificaciones;
  readonly sinLeer = this.srv.notificacionesSinLeer;

  ngOnInit(): void {
    this.srv.cargar();
  }

  volver(): void {
    this.location.back();
  }

  marcarTodas(): void {
    this.srv.marcarTodasLeidas();
  }

  /** Marca como leída y navega al trueque o a la publicación referenciada. */
  abrir(n: Notificacion): void {
    this.srv.marcarNotificacionLeida(n.id);
    if (!n.referenciaId) return;
    if (n.referenciaId.startsWith('tr')) this.router.navigate(['/mis-trueques']);
    else if (n.referenciaId.startsWith('pub')) this.router.navigate(['/trueque', n.referenciaId]);
  }

  icono(tipo: Notificacion['tipo']): string {
    const mapa: Record<Notificacion['tipo'], string> = {
      solicitud: 'swap_horiz',
      aceptada: 'check_circle',
      rechazada: 'cancel',
      completada: 'verified',
      recordatorio: 'schedule',
      verificacion: 'mark_email_unread',
      moderacion: 'gavel',
    };
    return mapa[tipo];
  }
}
