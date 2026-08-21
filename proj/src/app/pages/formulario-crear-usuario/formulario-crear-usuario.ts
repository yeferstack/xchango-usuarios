import { Component } from "@angular/core";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { TruequesService } from "../../services/trueques";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

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

interface Opcion {
  value: string;
  label: string;
}

@Component({
  selector: "formulario-crear-usuario",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./formulario-crear-usuario.html",
  styleUrls: ["./formulario-crear-usuario.css"],
})
export class formulario_crear_usuarioComponent {
  modelo: RegistroUsuario = {
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    sexo: "",
    direccion: "",
    ciudad: "",
    estado: "",
    barrio: "",
    email: "",
    telefono: "+57 ",
    tipoDocumento: "",
    numeroDocumento: "",
  };

  /** HU02: la contraseña es obligatoria para poder iniciar sesión luego. */
  password = "";
  errorRegistro = "";

  private readonly srv = inject(TruequesService);
  private readonly router = inject(Router);

  fotoPerfilArchivo: File | null = null;
  fotoPerfilNombre = "";
  isDragOver = false;

  /** Datos de los <select>: cada uno se recorre en el HTML con *ngFor. */
  readonly opcionesSexo: Opcion[] = [
    { value: "femenino", label: "Femenino" },
    { value: "masculino", label: "Masculino" },
    { value: "otro", label: "Otro" },
  ];

  readonly tiposDocumento: Opcion[] = [
    { value: "cc", label: "Cédula de ciudadanía" },
    { value: "ce", label: "Cédula de extranjería" },
    { value: "ti", label: "Tarjeta de identidad" },
    { value: "pasaporte", label: "Pasaporte" },
  ];

  private readonly tiposPermitidos = ["image/png", "image/jpeg"];
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
      console.warn("Formato no permitido. Usa JPG o PNG.");
      return;
    }
    if (archivo.size > this.tamanoMaximoBytes) {
      console.warn("El archivo supera el máximo de 5MB.");
      return;
    }
    this.fotoPerfilArchivo = archivo;
    this.fotoPerfilNombre = archivo.name;
  }

  onSubmit(): void {
    this.errorRegistro = "";

    const nombre = `${this.modelo.nombres} ${this.modelo.apellidos}`.trim();
    const error = this.srv.registrar({
      nombre,
      email: this.modelo.email,
      password: this.password,
      telefono: this.modelo.telefono,
      ubicacion: this.modelo.ciudad || "Yopal",
    });

    if (error) {
      this.errorRegistro = error;
      return;
    }

    // Registro correcto: queda con sesión iniciada.
    this.router.navigate(["/home"]);
  }
}