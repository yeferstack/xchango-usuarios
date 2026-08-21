import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IconoComponent } from '../../components/icono/icono';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TruequesService } from '../../services/trueques';
import { PublicacionVista } from '../../models/publicacion.model';


@Component({
    selector: 'app-mis-publicaciones',
    standalone: true,
    imports: [IconoComponent, CommonModule, RouterLink],
    templateUrl: './mis_publicaciones.html',
    styleUrl: './mis_publicaciones.css'
})
export class MisPublicacionesComponent implements OnInit {

    filtro = signal<'todas' | 'activa' | 'pausada' | 'finalizada'>('todas');

    filtros = [
        { id: 'todas', etiqueta: 'Todas' },
        { id: 'activa', etiqueta: 'Activas' },
        { id: 'pausada', etiqueta: 'Pausadas' },
        { id: 'finalizada', etiqueta: 'Finalizadas' }
    ] as const;

    private readonly srv = inject(TruequesService);

    /** Publicaciones reales del usuario en sesión. */
    readonly publicaciones = this.srv.misPublicaciones;

    publicacionesFiltradas = computed<PublicacionVista[]>(() => {
        const f = this.filtro();
        return f === 'todas'
            ? this.publicaciones()
            : this.publicaciones().filter(p => p.estado === f);
    });

    totalActivas = computed(() => this.publicaciones().filter(p => p.estado === 'activa').length);
    totalPropuestas = computed(() => this.publicaciones().reduce((suma, p) => suma + p.propuestas, 0));
    totalVistas = computed(() => this.publicaciones().reduce((suma, p) => suma + p.vistas, 0));

    ngOnInit(): void {
        this.srv.cargar();
    }

    constructor(private location: Location) { }

    cambiarFiltro(id: 'todas' | 'activa' | 'pausada' | 'finalizada'): void {
        this.filtro.set(id);
    }

    contarPor(estado: string): number {
        return estado === 'todas'
            ? this.publicaciones().length
            : this.publicaciones().filter(p => p.estado === estado).length;
    }

    etiquetaEstado(estado: string): string {
        const mapa: Record<string, string> = {
            activa: 'Activa',
            pausada: 'Pausada',
            finalizada: 'Finalizada'
        };
        return mapa[estado] ?? estado;
    }

    alternarPausa(id: string): void {
        this.srv.alternarEstadoPublicacion(id);
    }

    eliminar(id: string): void {
        if (confirm('¿Eliminar esta publicación? Dejará de estar visible para los demás.')) {
            this.srv.eliminarPublicacion(id);
        }
    }

    /** Total de solicitudes de trueque recibidas por mis publicaciones. */
    readonly propuestasRecibidas = computed(() =>
        this.publicaciones().reduce((s, p) => s + p.propuestas, 0)
    );

    volver(): void {
        this.location.back();
    }
}