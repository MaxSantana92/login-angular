import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isLoading = signal(false);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { username, password } = this.loginForm.value;
      this.authService
        .login({ username: username!, password: password! })
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              console.log('Login successful');
              this.router.navigate(['/dashboard']);
            } else {
              console.error('Login failed: Invalid credentials');
              // Here you would show an error to the user
            }
          },
          error: (err) => {
            // This will now likely only catch network errors,
            // as auth errors are handled by the service and returned as `false`
            console.error('An unexpected error occurred', err);
          },
        });
    }
  }
}
