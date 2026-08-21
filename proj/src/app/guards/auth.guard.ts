import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TruequesService } from '../services/trueques';

/**
 * Protege las rutas que exigen sesión. Si nadie inició sesión, manda al login
 * guardando a dónde quería ir para volver después.
 */
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const srv = inject(TruequesService);
  const router = inject(Router);

  srv.cargar();
  if (srv.autenticado()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { volverA: estado.url },
  });
};
