import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/event-management.component').then(m => m.EventManagementComponent)
  }
];