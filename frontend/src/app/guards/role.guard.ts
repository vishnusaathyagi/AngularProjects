import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[];

  if (authService.hasRole(allowedRoles)) {
    return true;
  }

  alert(`Access Denied: Your active role (${authService.getRole()}) cannot access this page.`);
  router.navigate(['/']);
  return false;
};