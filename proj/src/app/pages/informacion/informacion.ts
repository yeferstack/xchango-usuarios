import { Component } from '@angular/core';
import { IconoComponent } from '../../components/icono/icono';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-informacion',
    standalone: true,
    imports: [IconoComponent, CommonModule, FormsModule, RouterLink],
    templateUrl: './informacion.html',
    styleUrl: './informacion.css'
})
export class InformacionComponent {
    // Datos generales del perfil (mismo header lateral que en /perfil)
    nombreUsuario: string = 'Miguel Perez';
    avatarUrl: string = 'assets/avatar-miguel.jpeg';
    logoUrl: string = 'assets/logo-xchango.jpeg';

    calificacion: number = 4;
    calificacionMaxima: number = 5;
    totalCalificacionesRequeridas: number = 5;

    // Campos editables del formulario
    nombreElegido: string = 'Miguel Perez';
    numeroTelefono: string = '';

    // Foto nueva seleccionada (preview antes de guardar)
    fotoPreviewUrl: string | null = null;
    private archivoSeleccionado: File | null = null;

    estrellas(): boolean[] {
        return Array.from(
            { length: this.calificacionMaxima },
            (_, i) => i < this.calificacion
        );
    }

    onArchivoSeleccionado(event: Event): void {
        const input = event.target as HTMLInputElement;
        const archivo = input.files?.[0];
        if (!archivo) {
            return;
        }

        this.archivoSeleccionado = archivo;

        const lector = new FileReader();
        lector.onload = () => {
            this.fotoPreviewUrl = lector.result as string;
        };
        lector.readAsDataURL(archivo);
    }

    guardarCambios(): void {
        // TODO: conectar con el servicio/API real de XchanGo
        console.log('Guardando cambios:', {
            nombreElegido: this.nombreElegido,
            numeroTelefono: this.numeroTelefono,
            archivo: this.archivoSeleccionado
        });

        alert('Cambios guardados correctamente.');
    }
}