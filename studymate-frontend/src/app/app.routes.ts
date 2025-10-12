import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { OwnerLayoutComponent } from './owner/owner-layout/owner-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

/**
 * Application Routes Configuration
 *
 * Routing structure:
 * - /auth/* - Public authentication routes (with auth layout)
 * - /owner/* - Owner Portal routes (protected by authGuard + roleGuard)
 *   - Uses OwnerLayoutComponent as parent for consistent layout
 *   - All child routes lazy loaded for optimal performance
 * - /unauthorized - Access denied page (role-based)
 * - /** - 404 Not Found page (wildcard route)
 */
export const routes: Routes = [
  // Authentication Routes - Public with Auth Layout
  {
    path: 'auth',
    component: AuthLayoutComponent, // Auth layout with header/footer
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'owner/register',
        loadComponent: () =>
          import('./features/auth/owner-register/owner-register.component').then((m) => m.OwnerRegisterComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Legacy routes - redirect to /auth/* for backward compatibility
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full',
  },

  // Owner Portal Routes - Protected by Auth & Role Guards
  {
    path: 'owner',
    component: OwnerLayoutComponent, // Layout shell with header, footer, and router-outlet
    canActivate: [authGuard, roleGuard], // Auth + Role-based access control
    data: { role: 'OWNER' }, // Required role for access
    children: [
      // Dashboard - Main overview page
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/owner-dashboard/owner-dashboard').then((m) => m.OwnerDashboard),
      },
      // Seat Map Configuration
      {
        path: 'seat-map-config',
        loadComponent: () =>
          import('./features/owner/seat-map-config/seat-map-config.component').then(
            (m) => m.SeatMapConfigComponent,
          ),
      },
      // User Management
      {
        path: 'user-management',
        loadComponent: () =>
          import('./features/owner/user-management/user-management.component').then(
            (m) => m.UserManagementComponent,
          ),
      },
      // Reports & Analytics
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/owner/reports/reports.component').then((m) => m.ReportsComponent),
      },
      // Profile (Story 1.18)
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/owner/profile/profile.component').then((m) => m.ProfileComponent),
      },
      // Settings (Story 1.20)
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/owner/settings/settings.component').then((m) => m.SettingsComponent),
      },
      // Default redirect to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      // 404 within Owner Portal
      {
        path: '**',
        loadComponent: () =>
          import('./shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  // Unauthorized Access Page
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },

  // Root redirect
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  // 404 Not Found - Wildcard route (must be last)
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
