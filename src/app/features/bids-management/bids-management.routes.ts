import { Routes } from '@angular/router';

export const BIDS_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./bids-management.component').then(m => m.BidsManagementComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./edit/bids-management-edit.component').then(m => m.BidsManagementEditComponent)
  }
];