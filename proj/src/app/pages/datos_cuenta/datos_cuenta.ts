import { Component, signal } from '@angular/core';
import { IconoComponent } from '../../components/icono/icono';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-datos-cuenta',
    standalone: true,
    imports: [IconoComponent, CommonModule, FormsModule, RouterLink],
    templateUrl: './datos_cuenta.html',
    styleUrl: './datos_cuenta.css'
})
export class DatosCuentaComponent {

    /* --- Datos de la cuenta --- */
    correo = signal('miguel.perez@gmail.com');
    usuario = signal('@miguelperez');
    idCuenta = signal('XCH-2026-0418');
    fechaRegistro = signal('18 de marzo de 2026');
    tipoCuenta = signal('Personal');
    correoVerificado = signal(true);

    /* --- Campo que se está editando (null = ninguno) --- */
    editando = signal<string | null>(null);
    valorTemporal = signal('');

    /* --- Preferencias --- */
    preferencias = signal([
        { id: 'correos', titulo: 'Correos de novedades', detalle: 'Recibe noticias y actualizaciones de XchanGo.', activo: true },
        { id: 'resumen', titulo: 'Resumen semanal', detalle: 'Un correo con el movimiento de tus trueques.', activo: false },
        { id: 'sesion', titulo: 'Mantener sesión iniciada', detalle: 'No cerrar sesión automáticamente en este navegador.', activo: true }
    ]);

    constructor(private location: Location) { }

    /* --- Edición en línea --- */
    iniciarEdicion(campo: string, valorActual: string): void {
        this.editando.set(campo);
        this.valorTemporal.set(valorActual);
    }

    cancelarEdicion(): void {
        this.editando.set(null);
        this.valorTemporal.set('');
    }

    guardarEdicion(campo: string): void {
        const nuevo = this.valorTemporal().trim();
        if (!nuevo) return;

        if (campo === 'correo') {
            this.correo.set(nuevo);
            this.correoVerificado.set(false);
        }
        if (campo === 'usuario') {
            this.usuario.set(nuevo.startsWith('@') ? nuevo : '@' + nuevo);
        }

        this.cancelarEdicion();
    }

    togglePreferencia(id: string): void {
        this.preferencias.update(lista =>
            lista.map(p => (p.id === id ? { ...p, activo: !p.activo } : p))
        );
    }

    volver(): void {
        this.location.back();
    }
}