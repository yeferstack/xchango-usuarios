import { CommonModule } from '@angular/common';
import { IconoComponent } from '../../components/icono/icono';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type SeccionSeguridad = 'alertas' | null;

interface OpcionToggle {
    id: string;
    titulo: string;
    descripcion: string;
    activo: boolean;
}

@Component({
    selector: 'app-seguridad',
    standalone: true,
    imports: [IconoComponent, CommonModule, RouterLink],
    templateUrl: './seguridad.html',
    styleUrls: ['./seguridad.css'],
})
export class SeguridadComponent {
    seccionAbierta: SeccionSeguridad = null;
    mensaje = '';

    alertas: OpcionToggle[] = [
        {
            id: 'inicio-nuevo',
            titulo: 'Inicio de sesión desde un dispositivo nuevo',
            descripcion: 'Te avisamos apenas alguien entre desde un equipo desconocido.',
            activo: true,
        },
        {
            id: 'cambio-datos',
            titulo: 'Cambios en tus datos',
            descripcion: 'Notificación cuando cambie tu correo o contraseña.',
            activo: true,
        },
        {
            id: 'intercambios',
            titulo: 'Actividad sospechosa en intercambios',
            descripcion: 'Alerta si detectamos movimientos raros en tus publicaciones.',
            activo: false,
        },
    ];

    alternarSeccion(seccion: Exclude<SeccionSeguridad, null>): void {
        this.seccionAbierta = this.seccionAbierta === seccion ? null : seccion;
        this.mensaje = '';
    }

    alternarOpcion(opcion: OpcionToggle): void {
        opcion.activo = !opcion.activo;
        this.mensaje = `${opcion.titulo}: ${opcion.activo ? 'activado' : 'desactivado'}`;
        // TODO: llamar al servicio -> this.seguridadService.actualizar(opcion.id, opcion.activo)
    }

    trackPorId = (_: number, item: { id: string | number }) => item.id;
}