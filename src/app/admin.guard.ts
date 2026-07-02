import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  if (!token) {
    router.navigate(['/login-admin']);
    return false;
  }

  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.role === 'Admin' || user?.role === 'SuperAdmin') {
        return true;
      }
    }
  } catch {}

  router.navigate(['/login-admin']);
  return false;
};
