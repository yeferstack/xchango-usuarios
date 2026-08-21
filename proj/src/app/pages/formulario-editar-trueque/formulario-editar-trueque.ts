import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IconoComponent } from '../../components/icono/icono';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DatosPublicacion, TruequesService } from '../../services/trueques';
import { TipoPublicacion } from '../../models/publicacion.model';
import { Categoria } from '../../models/categoria.model';
import { MUNICIPIOS_CASANARE } from '../../shared/municipios-casanare';

interface TipoIntercambio {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;      // nombre de material icon
  colorClase: string; // clase css para el color del icono/tarjeta
}

// Estructura de un trueque tal como vendría del backend
interface Trueque {
  id: string;
  tipoIntercambio: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  ofreces: string;
  buscas: string;
  disponibilidad: string;
  cantidad: string;
  estado: boolean;
  municipio: string;
  barrio: string;
  imagenes: string[]; // URLs ya subidas al servidor
}

// Municipios de Casanare (único departamento manejado por la plataforma)

@Component({
  selector: 'app-formulario-editar-trueque',
  standalone: true,
  imports: [IconoComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-editar-trueque.html',
  styleUrls: ['./formulario-editar-trueque.css']
})
export class FormularioEditarTruequeComponent implements OnInit {

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
  categorias: string[] = [
    'Tecnología',
    'Ropa y accesorios',
    'Hogar',
    'Libros y educación',
    'Deportes',
    'Servicios profesionales',
    'Arte y manualidades',
    'Otros'
  ];

  opcionesDisponibilidad: string[] = [
    'Inmediata',
    'Fines de semana',
    'Entre semana',
    'Horario flexible',
    'Por acordar'
  ];

  // Departamento fijo: la plataforma solo opera en Casanare
  readonly departamento = 'Casanare';
  municipiosCasanare: readonly string[] = MUNICIPIOS_CASANARE;

  // ---------------------------------------------------------
  // 3. Estado del formulario
  // ---------------------------------------------------------
  form!: FormGroup;

  // El id del trueque que se está editando (viene de la ruta)
  truequeId: string | null = null;
  cargandoTrueque = false;
  errorCarga = '';

  // Imágenes ya subidas al servidor, mostradas como URL directa
  imagenesExistentes: string[] = [];
  // Ids/URLs de imágenes existentes que el usuario marcó para eliminar
  imagenesEliminadas: string[] = [];

  // Imágenes nuevas seleccionadas en esta sesión de edición
  imagenesNuevas: File[] = [];
  imagenesNuevasPreviewUrls: string[] = [];

  indiceImagenVistaPrevia = 0;
  readonly maxImagenes = 5;
  readonly maxDescripcion = 500;
  arrastrandoArchivo = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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

  private readonly srv = inject(TruequesService);

  /** Catálogo único; referencia estable (signal del store). */
  get categoriasCatalogo(): Categoria[] {
    return this.srv.categorias();
  }

  readonly municipiosCatalogo: readonly string[] = MUNICIPIOS_CASANARE;

  ngOnInit(): void {
    this.srv.cargar();

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

    // Toma el id desde la ruta, ej: /trueque/:id/editar
    this.truequeId = this.route.snapshot.paramMap.get('id');

    if (this.truequeId) {
      this.cargarTrueque(this.truequeId);
    }
  }

  // ---------------------------------------------------------
  // Carga y precarga del trueque a editar
  // ---------------------------------------------------------
  /** Carga la publicación desde el store y precarga el formulario. */
  private cargarTrueque(id: string): void {
    this.cargandoTrueque = true;
    this.errorCarga = '';

    const p = this.srv.obtenerPorId(id);
    if (!p) {
      this.errorCarga = 'No se encontró la publicación.';
      this.cargandoTrueque = false;
      return;
    }

    const idTipo =
      p.tipo === 'servicio' ? 'servicio' : p.tipo === 'bien_digital' ? 'digital' : 'fisico';

    this.form.patchValue({
      tipoIntercambio: idTipo,
      nombre: p.titulo,
      categoria: p.categoriaId,
      descripcion: p.descripcion,
      ofreces: p.ofreces,
      buscas: p.buscas,
      estado: p.estado === 'activa',
      // Solo existen en los tipos que los manejan.
      disponibilidad: p.tipo === 'bien_digital' ? '' : p.disponibilidad,
      cantidad: p.tipo === 'bien_digital' ? '' : p.cantidadDisponible,
      municipio: p.tipo === 'bien_digital' ? '' : p.municipio,
      barrio: p.tipo === 'bien_fisico' ? p.barrio : '',
    });

    this.imagenesExistentes = [...p.imagenes];
    this.cargandoTrueque = false;
    this.cdr.markForCheck();
  }

  /**
   * Llena el formulario reactivo con los datos de un trueque existente.
   * Las imágenes ya subidas se guardan aparte (imagenesExistentes) para
   * poder diferenciarlas de las nuevas que el usuario agregue.
   */
  private precargarFormulario(trueque: Trueque): void {
    this.form.patchValue({
      tipoIntercambio: trueque.tipoIntercambio,
      nombre: trueque.nombre,
      categoria: trueque.categoria,
      descripcion: trueque.descripcion,
      ofreces: trueque.ofreces,
      buscas: trueque.buscas,
      disponibilidad: trueque.disponibilidad,
      cantidad: trueque.cantidad,
      estado: trueque.estado,
      municipio: trueque.municipio,
      barrio: trueque.barrio
    });

    this.imagenesExistentes = [...trueque.imagenes];
    this.indiceImagenVistaPrevia = 0;
    this.cdr.detectChanges();
  }

  /**
   * Stub de datos de ejemplo — simula lo que devolvería el backend.
   * Bórralo cuando conectes el servicio real de trueques.
   */
  private obtenerTruequeDeEjemplo(id: string): Trueque | null {
    return {
      id,
      tipoIntercambio: 'fisico',
      nombre: 'Bicicleta montaña',
      categoria: 'Deportes',
      descripcion: 'Bicicleta todoterreno rodado 26, poco uso, frenos de disco.',
      ofreces: 'Bicicleta completa con casco incluido',
      buscas: 'Clases de inglés o una laptop en buen estado',
      disponibilidad: 'Fines de semana',
      cantidad: '1 unidad',
      estado: true,
      municipio: 'Yopal',
      barrio: '20 de Julio',
      imagenes: [
        'https://via.placeholder.com/400x300.png?text=Bicicleta+1',
        'https://via.placeholder.com/400x300.png?text=Bicicleta+2'
      ]
    };
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

  /** Todas las imágenes a mostrar en la vista previa: existentes + nuevas */
  get imagenesPreviewUrls(): string[] {
    return [...this.imagenesExistentes, ...this.imagenesNuevasPreviewUrls];
  }

  get totalImagenes(): number {
    return this.imagenesExistentes.length + this.imagenesNuevas.length;
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
    const disponibles = this.maxImagenes - this.totalImagenes;
    Array.from(files)
      .slice(0, disponibles)
      .forEach(file => {
        if (!file.type.match(/image\/(jpeg|png)/)) return;
        if (file.size > 5 * 1024 * 1024) return; // máx 5MB

        this.imagenesNuevas = [...this.imagenesNuevas, file];

        const reader = new FileReader();
        reader.onload = () => {
          this.imagenesNuevasPreviewUrls = [...this.imagenesNuevasPreviewUrls, reader.result as string];
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
  }

  /**
   * Elimina una imagen de la vista previa combinada (existentes + nuevas).
   * Si la imagen eliminada era una que ya estaba en el servidor, se guarda
   * su URL en imagenesEliminadas para que el backend sepa que debe borrarla.
   */
  eliminarImagen(index: number): void {
    const esExistente = index < this.imagenesExistentes.length;

    if (esExistente) {
      const url = this.imagenesExistentes[index];
      this.imagenesEliminadas = [...this.imagenesEliminadas, url];
      this.imagenesExistentes = this.imagenesExistentes.filter((_, i) => i !== index);
    } else {
      const indiceNueva = index - this.imagenesExistentes.length;
      this.imagenesNuevas = this.imagenesNuevas.filter((_, i) => i !== indiceNueva);
      this.imagenesNuevasPreviewUrls = this.imagenesNuevasPreviewUrls.filter((_, i) => i !== indiceNueva);
    }

    if (this.indiceImagenVistaPrevia >= this.totalImagenes) {
      this.indiceImagenVistaPrevia = Math.max(0, this.totalImagenes - 1);
    }
  }

  imagenAnterior(): void {
    const total = this.imagenesPreviewUrls.length;
    this.indiceImagenVistaPrevia = (this.indiceImagenVistaPrevia - 1 + total) % total;
  }

  imagenSiguiente(): void {
    const total = this.imagenesPreviewUrls.length;
    this.indiceImagenVistaPrevia = (this.indiceImagenVistaPrevia + 1) % total;
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('id', this.truequeId ?? '');
    formData.append('departamento', this.departamento);
    Object.entries(this.form.getRawValue()).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    this.imagenesNuevas.forEach(img => formData.append('imagenesNuevas', img));
    formData.append('imagenesEliminadas', JSON.stringify(this.imagenesEliminadas));
    formData.append('imagenesConservadas', JSON.stringify(this.imagenesExistentes));

    const v = this.form.getRawValue();
    const idTipo = v.tipoIntercambio as string;
    const tipo: TipoPublicacion =
      idTipo === 'servicio' ? 'servicio' : idTipo === 'digital' ? 'bien_digital' : 'bien_fisico';

    const datos: DatosPublicacion = {
      tipo,
      categoriaId: v.categoria,
      titulo: v.nombre,
      descripcion: v.descripcion,
      ofreces: v.ofreces || v.nombre,
      buscas: v.buscas,
      imagenes: [...this.imagenesExistentes, ...this.imagenesNuevasPreviewUrls],
    };

    if (tipo !== 'bien_digital') {
      datos.municipio = v.municipio;
      datos.cantidadDisponible = v.cantidad;
      datos.disponibilidad = v.disponibilidad;
      if (tipo === 'bien_fisico') datos.barrio = v.barrio;
    }

    if (this.truequeId && this.srv.actualizarPublicacion(this.truequeId, datos)) {
      this.router.navigate(['/trueque', this.truequeId]);
    } else {
      this.errorCarga = 'No se pudo guardar. ¿La publicación es tuya?';
    }
  }
}