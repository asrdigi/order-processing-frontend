import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const roleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.getRole();

    console.log('Required:', requiredRole);
    console.log('Token role:', role);

    if (role === requiredRole) {
      console.log('Role match → granted');
      return true;
    }

    console.log('Role mismatch → blocked');
    router.navigate(['/login']);
    return false;
  };
};
