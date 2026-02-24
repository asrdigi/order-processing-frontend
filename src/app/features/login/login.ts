import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth-service';
import { RouterLink } from '@angular/router';
import { signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="card shadow-lg p-4" style="width: 400px;">
        <h4 class="text-center mb-4">Login</h4>

        <!-- Username -->
        <input [(ngModel)]="username" class="form-control mb-3" placeholder="Username" />

        <!-- Password -->
        <input
          [(ngModel)]="password"
          type="password"
          class="form-control mb-3"
          placeholder="Password"
        />

        <!-- Login Button -->
        <button class="btn btn-primary w-100 mb-3" (click)="login()">Login</button>

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="alert alert-danger text-center">
            {{ errorMessage() }}
          </div>
        }

        <!-- Divider -->
        <div class="text-center my-3">
          <hr />
        </div>

        <!-- Signup Link -->
        <div class="text-center">
          <small>
            New user?
            <a routerLink="/signup" class="fw-bold text-decoration-none"> Create Account </a>
          </small>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  username = '';
  password = '';

  errorMessage = signal('');

  private auth = inject(AuthService);
  private router = inject(Router);

  // login() {
  //   // Clear previous error first
  //   this.errorMessage.set('');

  //   this.auth.login(this.username, this.password).subscribe({
  //     next: (res) => {
  //       console.log('Login response:', res);
  //       if (res.status === 'success') {
  //         this.auth.setLoginState(true);
  //         this.auth.setToken(res.token);
  //         this.router.navigate(['/orders']);
  //       } else {
  //         this.auth.setLoginState(false);
  //         // PLACE IT HERE
  //         this.errorMessage.set('Invalid credentials');
  //       }
  //     },
  //     error: () => {
  //       this.auth.setLoginState(false);
  //       // ALSO HANDLE SERVER ERROR HERE
  //       this.errorMessage.set('Login failed. Please try again.');
  //     },
  //   });
  // }

  login() {
    this.auth.login(this.username, this.password).subscribe((res) => {
      if (res.status === 'success') {
        console.log(res);
        this.auth.setLoginState(true);
        this.auth.setTokens(res.token);

        const role = this.auth.getRole();
        console.log('In Login component: ' + role);

        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          console.log('Navigating to user dashboard');
          this.router.navigate(['/user']);
        }
      }
    });
  }
}
