import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-sidebar-admin',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css',
})
export class SidebarAdmin {
  readonly navegar = output<void>();
  readonly salir = output<void>();
}
