import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RegistroUsuario {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: string;
  direccion: string;
  ciudad: string;
  estado: string;
  barrio: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
}

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.css'],
})
export class FormularioComponent {
  modelo: RegistroUsuario = {
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: '',
    direccion: '',
    ciudad: '',
    estado: '',
    barrio: '',
    email: '',
    telefono: '+57 ',
    tipoDocumento: '',
    numeroDocumento: '',
  };

  fotoPerfilArchivo: File | null = null;
  fotoPerfilNombre = '';
  isDragOver = false;

  private readonly tiposPermitidos = ['image/png', 'image/jpeg'];
  private readonly tamanoMaximoBytes = 5 * 1024 * 1024; // 5MB

  onFotoPerfilSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    this.asignarFotoPerfil(input.files[0]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const archivo = event.dataTransfer?.files?.[0];
    if (archivo) {
      this.asignarFotoPerfil(archivo);
    }
  }

  private asignarFotoPerfil(archivo: File): void {
    if (!this.tiposPermitidos.includes(archivo.type)) {
      console.warn('Formato no permitido. Usa JPG o PNG.');
      return;
    }
    if (archivo.size > this.tamanoMaximoBytes) {
      console.warn('El archivo supera el máximo de 5MB.');
      return;
    }
    this.fotoPerfilArchivo = archivo;
    this.fotoPerfilNombre = archivo.name;
  }

  onSubmit(): void {
    const formData = new FormData();

    Object.entries(this.modelo).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (this.fotoPerfilArchivo) {
      formData.append('fotoPerfil', this.fotoPerfilArchivo);
    }

    // TODO: reemplazar con la llamada al servicio real
    console.log('Formulario listo para enviar:', this.modelo, formData);
  }
}