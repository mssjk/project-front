import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth/auth.service';
import { FooterComponent } from "../../shared/footer/footer.component";
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../services/config/config.service';
import { RegisterDafConfig } from './register-daf.config';

@Component({
  selector: 'app-register-daf',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent, NavbarComponent, TranslateModule],
  templateUrl: './register-daf.component.html',
  styleUrls: ['./register-daf.component.css']
})
export class RegisterDafComponent {
  user = {
    name: '',
    email: '',
    password: '',
    mobile: '',
    location: '',
    registrationSource: 'DAF'
  };

  confirmPassword = '';
  emailExists = false;
  passwordsMatch = true;
  confirmTouched = false;
  showPassword = false;
  showConfirmPassword = false;
  showTooltip = false;

  passwordRules = {
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    isLongEnough: false
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private config: ConfigService
  ) {}

  getLogo(): string {
    try {
      const logo = this.config.getLogo();
      return logo || RegisterDafConfig.defaultLogo;
    } catch (error) {
      console.error('Error fetching logo:', error);
      return RegisterDafConfig.defaultLogo;
    }
  }

  getImg(): string {
    try {
      const img = this.config.getDonateImg();
      return img || RegisterDafConfig.defaultDonateImg;
    } catch (error) {
      console.error('Error fetching donate image:', error);
      return RegisterDafConfig.defaultDonateImg;
    }
  }

  togglePassword() {
    try {
      this.showPassword = !this.showPassword;
    } catch (error) {
      console.error('Error toggling password visibility:', error);
    }
  }

  toggleConfirmPassword() {
    try {
      this.showConfirmPassword = !this.showConfirmPassword;
    } catch (error) {
      console.error('Error toggling confirm password visibility:', error);
    }
  }

  checkPasswordStrength(password: string) {
    try {
      if (!password) {
        this.passwordRules = {
          hasUpper: false,
          hasLower: false,
          hasNumber: false,
          hasSpecial: false,
          isLongEnough: false
        };
        return;
      }

      this.passwordRules.hasUpper = /[A-Z]/.test(password);
      this.passwordRules.hasLower = /[a-z]/.test(password);
      this.passwordRules.hasNumber = /[0-9]/.test(password);
      this.passwordRules.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      this.passwordRules.isLongEnough = password.length >= 8;
    } catch (error) {
      console.error('Error checking password strength:', error);
    }
  }

  checkPasswordMatch() {
    try {
      this.confirmTouched = true;
      this.passwordsMatch = this.user.password === this.confirmPassword;
    } catch (error) {
      console.error('Error checking password match:', error);
      this.passwordsMatch = false;
    }
  }

  isPasswordValid(): boolean {
    try {
      return Object.values(this.passwordRules).every(rule => rule);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  registerUser() {
    try {
      this.confirmTouched = true;

      if (!this.isPasswordValid() || !this.passwordsMatch) {
        Swal.fire({
          icon: 'warning',
          title: this.translate.instant('registerDaf.form.errors.passwordInvalid'),
          text: this.translate.instant('registerDaf.form.errors.passwordMismatch'),
          width: RegisterDafConfig.swalWidth,
          heightAuto: RegisterDafConfig.swalHeightAuto,
          confirmButtonColor: RegisterDafConfig.swalButtonColor
        });
        return;
      }

      if (this.emailExists) {
        Swal.fire({
          icon: 'warning',
          title: this.translate.instant('registerDaf.form.errors.emailExists'),
          width: RegisterDafConfig.swalWidth,
          heightAuto: RegisterDafConfig.swalHeightAuto,
          confirmButtonColor: RegisterDafConfig.swalButtonColor
        });
        return;
      }

      if (!this.user.email || !this.user.name || !this.user.mobile || !this.user.location) {
        Swal.fire({
          icon: 'warning',
          title: this.translate.instant('registerDaf.form.errors.missingFields'),
          width: RegisterDafConfig.swalWidth,
          heightAuto: RegisterDafConfig.swalHeightAuto,
          confirmButtonColor: RegisterDafConfig.swalButtonColor
        });
        return;
      }

      this.authService.registerUser(this.user).subscribe({
        next: (res) => {
          console.log('Registration successful:', res);
          try {
            Swal.fire({
              icon: 'success',
              title: this.translate.instant('registerDaf.form.success.title'),
              html: this.translate.instant('registerDaf.form.success.message', { accountNumber: res.data.dafAccountNumber }),
              confirmButtonText: this.translate.instant('registerDaf.form.buttons.login'),
              confirmButtonColor: RegisterDafConfig.swalButtonColor
            }).then(() => this.router.navigate(['/login']));
          } catch (error) {
            console.error('Error handling successful registration:', error);
          }
        },
        error: (err) => {
          try {
            if (err.status === 409 && err.error === 'Email already exists.') {
              this.emailExists = true;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: this.translate.instant('registerDaf.form.errors.registrationFailed'),
                width: RegisterDafConfig.swalWidth,
                heightAuto: RegisterDafConfig.swalHeightAuto,
                confirmButtonColor: RegisterDafConfig.swalButtonColor
              });
            }
          } catch (error) {
            console.error('Error handling registration error:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error during user registration:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: this.translate.instant('registerDaf.form.errors.unexpectedError'),
        width: RegisterDafConfig.swalWidth,
        heightAuto: RegisterDafConfig.swalHeightAuto,
        confirmButtonColor: RegisterDafConfig.swalButtonColor
      });
    }
  }
}