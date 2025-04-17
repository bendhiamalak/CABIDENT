import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showAuthError = false;
  authErrorMsg = '';
  
  validCredentials = {
    email: "admin@admin.com",
    password: "admin"
  };

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  navigateToPatients() {
    this.showAuthError = false;
    
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    
    if (email !== this.validCredentials.email || password !== this.validCredentials.password) {
      this.showAuthError = true;
      this.authErrorMsg = 'Email ou mot de passe incorrect. Veuillez vérifier vos coordonnées.';
      
      
      if (email !== this.validCredentials.email) {
        this.email?.setErrors({ invalid: true });
      }
      if (password !== this.validCredentials.password) {
        this.password?.setErrors({ invalid: true });
      }
      return;
    }

    this.router.navigate(['/admin/accueil']);
  }
  
  navigateToHome() {
    this.router.navigate(['/']);
  }
}