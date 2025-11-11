import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user-management/user-management.routes').then(m => m.routes)
      },
      {
        path: 'services',
        loadChildren: () => import('./features/services-management/services-management.routes').then(m => m.routes)
      },
      {
        path: 'events',
        loadChildren: () => import('./features/event-management/event-management.routes').then(m => m.routes)
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payment-management/payment-management.routes').then(m => m.PAYMENT_MANAGEMENT_ROUTES)
      },
      {
        path: 'bids',
        loadChildren: () => import('./features/bids-management/bids-management.routes').then(m => m.BIDS_MANAGEMENT_ROUTES)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
