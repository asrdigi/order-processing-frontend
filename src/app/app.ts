import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/auth-service';
import { inject, computed } from '@angular/core';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- NAVBAR -->
    <nav class="navbar navbar-dark bg-dark px-4">
      <div class="container-fluid position-relative">
        <span class="navbar-brand mb-0 h5"> OrderProcessingSystem </span>

        <!--
        <span class="position-absolute start-50 translate-middle-x text-white fw-bold fs-5">
          {{ dashboardTitle() }}
        </span>
        -->

        <!-- LOGOUT BUTTON -->
        <button class="btn btn-outline-light btn-sm" (click)="logout()">Logout</button>
      </div>
    </nav>

    <!-- ROUTER CONTENT -->
    <router-outlet></router-outlet>
  `,
})
export class App {
  auth = inject(AuthService);

  private router = inject(Router);

  // dashboardTitle = computed(() => {
  //   const url = this.router.url;

  //   if (url.startsWith('/admin')) return 'Administration Dashboard';
  //   if (url.startsWith('/user')) return 'User Dashboard';
  //   return '';
  // });

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
