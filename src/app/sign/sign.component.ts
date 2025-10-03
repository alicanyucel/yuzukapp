import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit, OnDestroy {
  isLoginMode: boolean = true;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit() {
    // Sign sayfasında body class ekle
    document.body.classList.add('sign-page');
  }

  ngOnDestroy() {
    // Sign sayfasından çıkarken body class'ı kaldır
    document.body.classList.remove('sign-page');
  }

  initializeForms() {
    // Login Form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Register Form
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom password validator
  passwordValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    
    const valid = hasNumber && hasUpper && hasLower;
    if (!valid) {
      return { 'passwordStrength': true };
    }
    return null;
  }

  // Custom validator for password match
  passwordMatchValidator(form: AbstractControl): {[key: string]: any} | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  switchToLogin() {
    this.isLoginMode = true;
    this.submitted = false;
  }

  switchToRegister() {
    this.isLoginMode = false;
    this.submitted = false;
  }

  onLogin() {
    this.submitted = true;
    
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      console.log('Login attempt:', loginData);
      // Burada login servisi çağrılacak
      alert('Login başarılı! (Demo)');
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onRegister() {
    this.submitted = true;
    
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      console.log('Register attempt:', registerData);
      // Burada register servisi çağrılacak
      alert('Kayıt başarılı! (Demo)');
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  // Helper method to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for easy access to form controls
  get loginControls() { return this.loginForm.controls; }
  get registerControls() { return this.registerForm.controls; }

  // Helper methods to check field errors
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched || this.submitted)) {
      if (field.errors['required']) {
        return `${fieldName} gereklidir`;
      }
      if (field.errors['email']) {
        return 'Geçerli bir email adresi giriniz';
      }
      if (field.errors['minlength']) {
        return `En az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
      }
      if (field.errors['passwordStrength']) {
        return 'Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir';
      }
      if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
        return 'Şifreler eşleşmiyor';
      }
    }
    return '';
  }
}
