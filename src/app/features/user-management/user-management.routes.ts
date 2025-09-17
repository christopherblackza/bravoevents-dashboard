import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'documents',
    loadComponent: () => import('./user-documents/user-documents.component').then(m => m.UserDocumentsComponent)
  }
];