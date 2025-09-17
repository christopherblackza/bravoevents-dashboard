// Functional interceptor
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor = (req: any, next: any) => {
  const tokenService = inject(TokenStorageService);
  const token = tokenService.getAccessToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { 
        'Authorization': `Bearer ${token}` 
      }
    });
  }
  
  return next(req);
};