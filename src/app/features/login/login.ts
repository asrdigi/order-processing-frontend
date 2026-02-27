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
        <div class="position-relative mb-3">
          <input
            [(ngModel)]="password"
            [type]="showPassword() ? 'text' : 'password'"
            class="form-control"
            placeholder="Password"
          />
          <button
            type="button"
            class="btn btn-link position-absolute end-0 top-50 translate-middle-y"
            (click)="togglePassword()"
            style="text-decoration: none; color: #6c757d;"
          >
            {{ showPassword() ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>

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
  showPassword = signal(false);

  private auth = inject(AuthService);
  private router = inject(Router);

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

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
    this.errorMessage.set('');
    
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.auth.setLoginState(true);
          this.auth.setTokens(res.token);

          const role = this.auth.getRole();

          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/user']);
          }
        } else {
          this.errorMessage.set(res.message || 'Invalid credentials');
        }
      },
      error: () => {
        this.errorMessage.set('Login failed. Please try again.');
      }
    });
  }
}
