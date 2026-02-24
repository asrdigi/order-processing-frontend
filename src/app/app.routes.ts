import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Orders } from './features/orders/orders';
import { authGuard } from './core/auth-guard';
import { Signup } from './features/signup/signup';
import { roleGuard } from './core/role-guard';

// export const routes: Routes = [
//   { path: 'signup', component: Signup },
//   { path: '', redirectTo: 'login', pathMatch: 'full' },

//   { path: 'login', component: Login },

//   {
//     path: 'orders',
//     component: Orders,
//     canActivate: [authGuard],
//   },

//   { path: '**', redirectTo: 'login' },
// ];

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'signup', component: Signup },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },

  {
    path: 'user',
    canActivate: [authGuard, roleGuard('USER')],
    loadComponent: () =>
      import('./features/user-dashboard/user-dashboard').then((m) => m.UserDashboard),
  },

  { path: '**', redirectTo: 'login' },
];
