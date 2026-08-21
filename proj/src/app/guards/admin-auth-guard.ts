import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminsAdminService } from '../services/admin/admins-admin.service';

/** Bloquea /admin si no hay sesión y recuerda a dónde quería entrar. */
export const adminAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AdminsAdminService);
  const router = inject(Router);

  if (auth.autenticado()) return true;

  return router.createUrlTree(['/admin/login'], { queryParams: { redirigir: state.url } });
};

/** Evita que un admin ya logueado vuelva a ver el login. */
export const adminInvitadoGuard: CanActivateFn = () => {
  const auth = inject(AdminsAdminService);
  const router = inject(Router);

  return auth.autenticado() ? router.createUrlTree(['/admin/dashboard']) : true;
};
