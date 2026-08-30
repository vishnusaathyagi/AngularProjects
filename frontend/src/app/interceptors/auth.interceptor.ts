import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const activeRole = authService.getRole();

  const authReq = req.clone({
    setHeaders: {
      'X-User-Role': activeRole
    }
  });

  return next(authReq);
};