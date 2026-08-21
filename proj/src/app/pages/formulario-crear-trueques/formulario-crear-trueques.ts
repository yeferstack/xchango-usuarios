import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IconoComponent } from '../../components/icono/icono';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEPARTAMENTO, MUNICIPIOS_CASANARE } from '../../shared/municipios-casanare';
import { Categoria } from '../../models/categoria.model';
import { DatosPublicacion, TruequesService } from '../../services/trueques';
import { TipoPublicacion } from '../../models/publicacion.model';

interface TipoIntercambio {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;      // nombre de material icon
  colorClase: string; // clase css para el color del icono/tarjeta
}


@Component({
  selector: 'app-formulario-crear-trueques',
  standalone: true,
  imports: [IconoComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-crear-trueques.html',
  styleUrls: ['./formulario-crear-trueques.css']
})
export class formulario_crear_truequesComponent implements OnInit {

  // ---------------------------------------------------------
  // 1. Tipos de intercambio (tarjetas seleccionables)
  // ---------------------------------------------------------
  tiposIntercambio: TipoIntercambio[] = [
    {
      id: 'fisico',
      titulo: 'Bien físico',
      descripcion: 'Ofrece productos tangibles como ropa, libros, electrónicos y más.',
      icono: 'inventory_2',
      colorClase: 'icono-azul'
    },
    {
      id: 'servicio',
      titulo: 'Servicio',
      descripcion: 'Ofrece tus habilidades o servicios que otros puedan necesitar.',
      icono: 'handshake',
      colorClase: 'icono-verde'
    },
    {
      id: 'digital',
      titulo: 'Bien digital',
      descripcion: 'Ofrece productos digitales como archivos, cursos, plantillas y más.',
      icono: 'computer',
      colorClase: 'icono-morado'
    }
  ];

  // ---------------------------------------------------------
  // 2. Catálogos usados en los selects
  // ---------------------------------------------------------
  /** Catálogo único. Referencia estable: es un signal del servicio. */
  get categorias(): Categoria[] {
    return this.truequesService.categorias();
  }

  opcionesDisponibilidad: string[] = [
    'Inmediata',
    'Fines de semana',
    'Entre semana',
    'Horario flexible',
    'Por acordar'
  ];

  // Departamento fijo: la plataforma solo opera en Casanare
  errorGuardado = '';
  readonly departamento = DEPARTAMENTO;
  municipiosCasanare: readonly string[] = MUNICIPIOS_CASANARE;

  // ---------------------------------------------------------
  // 3. Estado del formulario
  // ---------------------------------------------------------
  form!: FormGroup;

  imagenes: File[] = [];
  imagenesPreviewUrls: string[] = [];
  indiceImagenVistaPrevia = 0;
  readonly maxImagenes = 5;
  readonly maxDescripcion = 500;
  arrastrandoArchivo = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private truequesService: TruequesService
  ) {
    this.asegurarFuenteMaterialIcons();
  }

  /**
   * Inyecta el link de Google Fonts para Material Icons si el proyecto
   * todavía no lo tiene cargado (evita que los íconos se vean como texto,
   * ej: "inventory_2" en vez del ícono real).
   */
  private asegurarFuenteMaterialIcons(): void {
    const idLink = 'material-icons-font';
    if (document.getElementById(idLink)) {
      return;
    }
    const link = document.createElement('link');
    link.id = idLink;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(link);
  }

  ngOnInit(): void {
    this.truequesService.cargar();

    this.form = this.fb.group({
      tipoIntercambio: ['fisico', Validators.required],
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(this.maxDescripcion)]],
      ofreces: [''],
      buscas: [''],
      disponibilidad: ['', Validators.required],
      cantidad: [''],
      estado: [true],
      municipio: ['', Validators.required],
      barrio: ['']
    });
  }

  // ---------------------------------------------------------
  // Helpers de plantilla
  // ---------------------------------------------------------
  seleccionarTipo(id: string): void {
    this.form.get('tipoIntercambio')?.setValue(id);
  }

  get tipoSeleccionado(): TipoIntercambio | undefined {
    return this.tiposIntercambio.find(t => t.id === this.form.get('tipoIntercambio')?.value);
  }

  get tituloVistaPrevia(): string {
    return this.tiposIntercambio.map(t => t.titulo).join(' | ');
  }

  get descripcionRestante(): number {
    const valor = this.form.get('descripcion')?.value || '';
    return this.maxDescripcion - valor.length;
  }

  // ---------------------------------------------------------
  // Manejo de imágenes (drag & drop + input)
  // ---------------------------------------------------------
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrandoArchivo = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastrandoArchivo = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrandoArchivo = false;
    if (event.dataTransfer?.files) {
      this.agregarImagenes(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.agregarImagenes(input.files);
    }
    input.value = '';
  }

  private agregarImagenes(files: FileList): void {
    const disponibles = this.maxImagenes - this.imagenes.length;
    Array.from(files)
      .slice(0, disponibles)
      .forEach(file => {
        if (!file.type.match(/image\/(jpeg|png)/)) return;
        if (file.size > 5 * 1024 * 1024) return; // máx 5MB

        // Reasigna el arreglo (en vez de mutar con push) para que Angular
        // detecte el cambio incluso con estrategias de detección estrictas.
        this.imagenes = [...this.imagenes, file];

        const reader = new FileReader();
        reader.onload = () => {
          this.imagenesPreviewUrls = [...this.imagenesPreviewUrls, reader.result as string];
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
  }

  eliminarImagen(index: number): void {
    this.imagenes = this.imagenes.filter((_, i) => i !== index);
    this.imagenesPreviewUrls = this.imagenesPreviewUrls.filter((_, i) => i !== index);

    if (this.indiceImagenVistaPrevia >= this.imagenesPreviewUrls.length) {
      this.indiceImagenVistaPrevia = Math.max(0, this.imagenesPreviewUrls.length - 1);
    }
  }

  imagenAnterior(): void {
    this.indiceImagenVistaPrevia =
      (this.indiceImagenVistaPrevia - 1 + this.imagenesPreviewUrls.length) % this.imagenesPreviewUrls.length;
  }

  imagenSiguiente(): void {
    this.indiceImagenVistaPrevia =
      (this.indiceImagenVistaPrevia + 1) % this.imagenesPreviewUrls.length;
  }

  // ---------------------------------------------------------
  // Navegación / envío
  // ---------------------------------------------------------
  seleccionarUbicacionEnMapa(): void {
    // Aquí se integraría el selector de ubicación (Google Maps / Leaflet, etc.)
    console.log('Abrir selector de ubicación en el mapa');
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  /** Mapea el id del selector visual al tipo real del modelo. */
  private tipoReal(): TipoPublicacion {
    const id = this.form.get('tipoIntercambio')?.value as string;
    if (id === 'servicio') return 'servicio';
    if (id === 'digital') return 'bien_digital';
    return 'bien_fisico';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const tipo = this.tipoReal();

    // Los campos se envían según el tipo: un bien digital no manda ubicación,
    // cantidad ni disponibilidad, y un servicio nunca manda barrio.
    const datos: DatosPublicacion = {
      tipo,
      categoriaId: v.categoria,
      titulo: v.nombre,
      descripcion: v.descripcion,
      ofreces: v.ofreces || v.nombre,
      buscas: v.buscas,
      imagenes: this.imagenesPreviewUrls,
    };

    if (tipo !== 'bien_digital') {
      datos.municipio = v.municipio;
      datos.cantidadDisponible = v.cantidad;
      datos.disponibilidad = v.disponibilidad;
      if (tipo === 'bien_fisico') datos.barrio = v.barrio;
    }

    const id = this.truequesService.crearPublicacion(datos);
    if (!id) {
      this.errorGuardado = 'Inicia sesión para publicar.';
      return;
    }
    this.router.navigate(['/trueque', id]);
  }
}