import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

/**
 * Icono de XchanGo.
 *
 * Antes había dos estilos mezclados: la fuente Material Icons en unas páginas
 * y SVG de línea en otras. Se dejó el estilo del login (SVG con trazo de 2 y
 * puntas redondeadas) porque es el que mejor se ve, y este componente lo aplica
 * en toda la app.
 *
 * Uso:  <app-icono nombre="home"></app-icono>
 *       <app-icono nombre="search" [tamano]="20"></app-icono>
 *
 * El color se hereda del texto (currentColor), así que se cambia con CSS.
 */
@Component({
  selector: 'app-icono',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icono.html',
  styleUrl: './icono.css',
})
export class IconoComponent {
  // Angular borra las etiquetas SVG cuando se pintan con innerHTML, por eso hay
  // que marcarlas como seguras. Aquí no hay riesgo: los trazos son textos fijos
  // escritos por nosotros, nunca vienen del usuario.
  constructor(private sanitizer: DomSanitizer) {}

  /** Nombre del icono. Si no existe, se muestra un punto. */
  @Input() nombre = '';

  /** Tamaño en píxeles. */
  @Input() tamano = 20;

  /**
   * Dibujo de cada icono. Son trazos SVG sobre una caja de 24x24.
   * Para agregar uno nuevo, se pone su nombre y su trazo en esta lista.
   */
  private dibujos: Record<string, string> = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    apps: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    swap_horiz: '<path d="M4 8h13"/><path d="m14 5 3 3-3 3"/><path d="M20 16H7"/><path d="m10 19-3-3 3-3"/>',
    favorite_border: '<path d="M12 20s-7-4.4-7-9.4A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.6c0 5-7 9.4-7 9.4z"/>',
    notifications_none: '<path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 21h4"/>',
    account_circle: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18.5a6.5 6.5 0 0 1 11 0"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    add: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14 6 4 4"/>',
    delete_outline: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7v13h12V7"/><path d="M10 11v6M14 11v6"/>',
    visibility: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/>',
    arrow_back: '<path d="M20 12H4"/><path d="m10 6-6 6 6 6"/>',
    chevron_left: '<path d="m15 5-7 7 7 7"/>',
    chevron_right: '<path d="m9 5 7 7-7 7"/>',
    location_on: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    place: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    apartment: '<rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 9h6v12h-6"/><path d="M7 7h1M11 7h1M7 11h1M11 11h1M7 15h1M11 15h1"/>',
    account_balance: '<path d="M3 10 12 4l9 6"/><path d="M5 10v9M10 10v9M14 10v9M19 10v9"/><path d="M3 21h18"/>',
    inventory_2: '<path d="M3 7h18v13H3z"/><path d="M3 7 5 3h14l2 4"/><path d="M10 11h4"/>',
    check_circle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><path d="M12 16.5h.01"/>',
    warning_amber: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4"/><path d="M12 17.5h.01"/>',
    description: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    key: '<circle cx="8" cy="14" r="4"/><path d="m11 11 9-9"/><path d="m17 5 2 2"/><path d="m14 8 2 2"/>',
    lightbulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V15h7v-1.1A6 6 0 0 0 12 3z"/>',
    event: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/>',
    tag: '<path d="M9 3 7 21M17 3l-2 18"/><path d="M4 9h17M3 15h17"/>',
    tune: '<path d="M4 7h10M18 7h2"/><path d="M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    chat_bubble_outline: '<path d="M21 11.5A8.4 8.4 0 0 1 12.5 20c-1.5 0-3-.4-4.3-1.1L3 20l1.1-5.2A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/>',
    schedule: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    verified: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
    cancel: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    gavel: '<path d="m4 20 7-7"/><path d="m9 9 6 6"/><path d="m12 6 6 6"/><path d="m15 3 6 6"/>',
    mark_email_unread: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    play_arrow: '<path d="M7 4.5v15l12-7.5z"/>',
    verified_user: '<path d="M12 3 5 6v6c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    expand_more: '<path d="m6 9 6 6 6-6"/>',
    devices: '<rect x="3" y="6" width="12" height="9" rx="1"/><path d="M2 19h14"/><rect x="17" y="10" width="5" height="9" rx="1"/>',
    notifications_active: '<path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 21h4"/><path d="M3 6a7 7 0 0 1 3-3M21 6a7 7 0 0 0-3-3"/>',
    photo_camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    shield: '<path d="M12 3 5 6v6c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    help_outline: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.7.6-.7 1.1v.5"/><path d="M12 17h.01"/>',
    star: '<path d="m12 4 2.4 5 5.6.8-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.6-.8z"/>',
    badge: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 4h6v2H9z"/><circle cx="9" cy="12" r="2"/><path d="M14 11h4M14 15h4M6 17a3.5 3.5 0 0 1 6 0"/>',
    explore: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/>',
    grid_view: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    handshake: '<path d="m11 17 2 2 3-3 3 3 2-2-6-6-2 2"/><path d="M13 8 9 4 3 10l3 3 2-2"/><path d="m8 14 3 3"/>',
    lock_outline: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    alternate_email: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 5-2 9 9 0 1 0-4 7.5"/>',
    cloud_upload: '<path d="M7 18a4 4 0 0 1 .6-8 6 6 0 0 1 11.2 2A3.5 3.5 0 0 1 18 18"/><path d="M12 12v8"/><path d="m9 15 3-3 3 3"/>',
    directions: '<path d="m12 3 9 9-9 9-9-9z"/><path d="M10 14v-2.5a1.5 1.5 0 0 1 1.5-1.5H15"/><path d="m13 8 2 2-2 2"/>',
    my_location: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    person_pin_circle: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="8.5" r="2.2"/><path d="M8.5 13.5a4 4 0 0 1 7 0"/>',
    pin_drop: '<path d="M12 20s6-5.2 6-9.5a6 6 0 1 0-12 0C6 14.8 12 20 12 20z"/><circle cx="12" cy="10" r="2.2"/>',
    open_in_new: '<path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    progress_activity: '<path d="M12 3a9 9 0 1 0 9 9"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><rect x="8" y="13" width="8" height="7"/>',
    south: '<path d="M12 4v15"/><path d="m6 13 6 6 6-6"/>',
    workspace_premium: '<circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/>',
    logout: '<path d="M14 4H6v16h8"/><path d="M18 12H10"/><path d="m15 9 3 3-3 3"/>',
  };

  /** Devuelve el trazo del icono pedido, o un punto si no existe. */
  get trazo(): string {
    return this.dibujos[this.nombre] || '<circle cx="12" cy="12" r="2"/>';
  }
}
