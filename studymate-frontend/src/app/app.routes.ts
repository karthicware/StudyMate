import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'owner/dashboard/:hallId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/owner-dashboard/owner-dashboard').then(
        (m) => m.OwnerDashboard
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent), // Placeholder - replace with actual dashboard
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
