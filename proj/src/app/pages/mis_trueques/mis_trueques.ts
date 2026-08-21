import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TruequesService } from '../../services/trueques';
import { TruequeVista, ETIQUETA_ESTADO_TRUEQUE } from '../../models/trueque.model';

type Pestana = 'recibidos' | 'enviados';

/**
 * HU45-HU53: bandeja de solicitudes de trueque.
 * Aceptar, rechazar, confirmar, calificar y contactar por WhatsApp.
 */
@Component({
  selector: 'app-mis-trueques',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis_trueques.html',
  styleUrl: './mis_trueques.css',
})
export class MisTruequesComponent implements OnInit {
  private readonly srv = inject(TruequesService);
  private readonly location = inject(Location);

  readonly pestana = signal<Pestana>('recibidos');
  readonly etiquetas = ETIQUETA_ESTADO_TRUEQUE;
  readonly notas = [1, 2, 3, 4, 5];

  readonly recibidos = this.srv.truequesRecibidos;
  readonly enviados = this.srv.truequesEnviados;

  readonly listado = computed<TruequeVista[]>(() =>
    this.pestana() === 'recibidos' ? this.recibidos() : this.enviados(),
  );

  readonly pendientes = this.srv.solicitudesPendientes;

  ngOnInit(): void {
    this.srv.cargar();
  }

  volver(): void {
    this.location.back();
  }

  cambiarPestana(p: Pestana): void {
    this.pestana.set(p);
  }

  aceptar(t: TruequeVista): void {
    this.srv.aceptarTrueque(t.id);
  }

  rechazar(t: TruequeVista): void {
    this.srv.rechazarTrueque(t.id);
  }

  confirmar(t: TruequeVista): void {
    this.srv.confirmarTrueque(t.id);
  }

  calificar(t: TruequeVista, nota: number): void {
    this.srv.calificarTrueque(t.id, nota);
  }

  miCalificacion(t: TruequeVista): number {
    return this.srv.miCalificacion(t);
  }

  /** true si ya confirmé mi parte y falta la contraparte. */
  esperandoContraparte(t: TruequeVista): boolean {
    const yo = this.srv.usuarioActualId();
    if (t.estado !== 'aceptado') return false;
    return t.solicitanteId === yo ? t.confirmadoSolicitante : t.confirmadoPropietario;
  }

  contactar(t: TruequeVista): void {
    this.srv.abrirWhatsApp(this.srv.enlaceWhatsAppTrueque(t));
  }

  claseEstado(estado: TruequeVista['estado']): string {
    const mapa: Record<TruequeVista['estado'], string> = {
      pendiente: 'chip chip--pendiente',
      aceptado: 'chip chip--aceptado',
      rechazado: 'chip chip--rechazado',
      completado: 'chip chip--completado',
    };
    return mapa[estado];
  }
}
