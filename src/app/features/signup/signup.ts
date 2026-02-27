import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth-service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
})
export class Signup {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  successMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  signupForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required],

      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  passwordMatchValidator(form: any) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  register() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { confirmPassword, ...payload } = this.signupForm.value;
    console.log('Sending registration payload:', payload);

    this.auth.register(payload).subscribe({
      next: (res: any) => {
        console.log('Registration response:', res);
        if (res.status === 1 || res.status === 'success') {
          this.successMessage.set('Registered successfully!');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.errorMessage.set(res.message || 'Registration failed');
          this.isSubmitting.set(false);
        }
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.errorMessage.set(err?.error?.message || 'Registration failed');
        this.isSubmitting.set(false);
      },
    });
  }
}
