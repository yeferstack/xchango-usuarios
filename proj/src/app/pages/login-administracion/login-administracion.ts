import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Icon } from '../../components/admin/icon/icon';
import { AdminsAdminService } from '../../services/admin/admins-admin.service';

@Component({
  selector: 'app-login-administracion',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './login-administracion.html',
  styleUrl: './login-administracion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginAdministracion {
  private readonly auth = inject(AdminsAdminService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly verPassword = signal(false);
  readonly cargando = signal(false);
  readonly error = signal('');

  async enviar(): Promise<void> {
    if (this.cargando()) return;

    this.error.set('');

    if (!this.email().trim() || !this.password()) {
      this.error.set('Ingresa tu correo y contraseña.');
      return;
    }

    this.cargando.set(true);
    try {
      await this.auth.login(this.email(), this.password());
      this.router.navigate(['/admin/dashboard']);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
      this.password.set('');
    } finally {
      this.cargando.set(false);
    }
  }
}
