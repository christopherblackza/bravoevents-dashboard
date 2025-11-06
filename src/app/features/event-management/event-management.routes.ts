import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/event-management.component').then(m => m.EventManagementComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./components/add-edit-event/add-edit-event.component').then(m => m.AddEditEventComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/add-edit-event/add-edit-event.component').then(m => m.AddEditEventComponent)
  }
];