import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { HomeComponent } from './pages/home/home';
import { ModalDetalleTruequeComponent } from './layout/modal-detalle-trueque/modal-detalle-trueque';
import { PerfilComponent } from './pages/perfil/perfil';
import { InformacionComponent } from './pages/informacion/informacion';
import { SeguridadComponent } from './pages/seguridad/seguridad';
import { LegalInfo } from './pages/legal-info/legal-info';
import { formulario_crear_truequesComponent } from './pages/formulario-crear-trueques/formulario-crear-trueques';
import { formulario_crear_usuarioComponent } from './pages/formulario-crear-usuario/formulario-crear-usuario';
import { LoginAdministracion } from './pages/login-administracion/login-administracion';
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { Administracion } from './pages/admin/administracion/administracion';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { Moderacion } from './pages/admin/moderacion/moderacion';
import { Ranking } from './pages/admin/ranking/ranking';    
import { Reportes } from './pages/admin/reportes/reportes';
import { Usuarios } from './pages/admin/usuarios/usuarios';
import { adminAuthGuard, adminInvitadoGuard } from './guards/admin-auth-guard';
import { FormularioEditarTruequeComponent } from './pages/formulario-editar-trueque/formulario-editar-trueque';
import { DatosCuentaComponent } from './pages/datos_cuenta/datos_cuenta';
import { UbicacionComponent } from './pages/ubicacion/ubicacion';
import { MisPublicacionesComponent } from './pages/mis_publicaciones/mis_publicaciones';
import { MisTruequesComponent } from './pages/mis_trueques/mis_trueques';
import { NotificacionesComponent } from './pages/notificaciones/notificaciones';
import { authGuard } from './guards/auth.guard';
import { AccesoComponent } from './pages/acceso/acceso';

export const routes: Routes = [

  // =========================
  // RUTA INICIAL
  // =========================
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // =========================
  // LOGIN
  // =========================
  {
    path: 'login',
    component: Login
  },
  {
    // Formulario real de correo + contraseña (la landing solo elegía método).
    path: 'acceso',
    component: AccesoComponent
  },

  // =========================
  // HOME
  // =========================
  {
    path: 'home',
    component: HomeComponent
  },

  // =========================
  // TRUEQUES
  // =========================
  {
    path: 'trueque/:id',
    component: ModalDetalleTruequeComponent
  },

  {
    path: 'trueque',
    component: formulario_crear_truequesComponent,
    canActivate: [authGuard]
  },

  // =========================
  // CREAR USUARIO
  // =========================
  {
    path: 'formulario',
    component: formulario_crear_usuarioComponent
  },
  {
    path: 'trueque/:id/editar',
    component: FormularioEditarTruequeComponent,
    canActivate: [authGuard]
  },
  {
    // Se conserva la ruta antigua para no romper enlaces existentes.
    path: 'editar',
    component: FormularioEditarTruequeComponent,
    canActivate: [authGuard]
  },

  // =========================
// PERFIL > DATOS DE TU CUENTA
// =========================
{
  path: 'perfil/cuenta',
  component: DatosCuentaComponent,
    canActivate: [authGuard]
},

// =========================
// PERFIL > UBICACIÓN
// =========================
{
  path: 'perfil/ubicacion',
  component: UbicacionComponent,
    canActivate: [authGuard]
},
// =========================
// MIS PUBLICACIONES
// =========================
{
  path: 'mis-publicaciones',
  component: MisPublicacionesComponent,
    canActivate: [authGuard]
},

  // =========================
  // INFORMACIÓN LEGAL
  // =========================
  {
    path: 'legal-info',
    component: LegalInfo
  },

  // =========================
  // PERFIL
  // =========================
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },

  // =========================
  // PERFIL > INFORMACIÓN
  // =========================
  {
    path: 'perfil/informacion',
    component: InformacionComponent,
    canActivate: [authGuard]
  },

  // =========================
  // PERFIL > SEGURIDAD
  // =========================
  {
    path: 'perfil/seguridad',
    component: SeguridadComponent,
    canActivate: [authGuard]
  },

  // =========================
  // ADMINISTRACIÓN
  // =========================
  {
    path: 'admin/login',
    component: LoginAdministracion,
    canActivate: [adminInvitadoGuard],
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'reportes', component: Reportes },
      { path: 'administracion', component: Administracion },
      { path: 'usuarios', component: Usuarios },
      { path: 'moderacion', component: Moderacion },
      { path: 'ranking', component: Ranking },
    ],
  },

  // =========================
  // TRUEQUES Y AVISOS DEL USUARIO
  // =========================
  {
    path: 'mis-trueques',
    component: MisTruequesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'notificaciones',
    component: NotificacionesComponent,
    canActivate: [authGuard]
  },

  // =========================
  // ALIAS: cierran enlaces que antes no resolvían
  // =========================
  { path: 'explorar', redirectTo: 'home', pathMatch: 'full' },
  { path: 'servicios', redirectTo: 'home', pathMatch: 'full' },
  { path: 'favoritos', redirectTo: 'home', pathMatch: 'full' },
  { path: 'publicar', redirectTo: 'trueque', pathMatch: 'full' },
  { path: 'mensajes', redirectTo: 'notificaciones', pathMatch: 'full' },
  { path: 'perfil/privacidad', redirectTo: 'perfil/seguridad', pathMatch: 'full' },

  // =========================
  // RUTA NO ENCONTRADA
  // =========================
  {
    path: '**',
    redirectTo: 'login'
  }
];