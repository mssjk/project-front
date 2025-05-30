import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { DAFService } from '../../services/daf/daf.service';
import Swal from 'sweetalert2';
import { UserstoreService } from '../../services/userstore/userstore.service';
import * as bootstrap from 'bootstrap';
import { Login } from '../../shared/interfaces/login';
import { FooterComponent } from "../../shared/footer/footer.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { ConfigService } from '../../services/config/config.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent, TranslateModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData: Login = {} as Login;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private dafService: DAFService,
    private router: Router,
    private userStore: UserstoreService,
    private translate: TranslateService,
    private config: ConfigService
  ) {}

  togglePassword() {
    try {
      this.showPassword = !this.showPassword;
    } catch (error) {
      console.error('An error occurred while toggling the password visibility:', error);
    }
  }

  getLogo(): string {
    try {
      return this.config.getLogo();
    } catch (error) {
      console.error('An error occurred while fetching the logo:', error);
      return ''; // Return a fallback value in case of an error
    }
  }

  getImg(): string {
    try {
      return this.config.getDonateImg();
    } catch (error) {
      console.error('An error occurred while fetching the donate image:', error);
      return ''; // Return a fallback value in case of an error
    }
  }

  loginUser() {
    try {
      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          try {
            const userId = response.userId;
            const userName = response.name;
            let tokenPayload = this.authService.decodeToken();
            this.userStore.setFullName(tokenPayload.name);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', userName);

            this.dafService.getDAFAccount(userId).subscribe({
              next: () => {
                try {
                  Swal.fire({
                    icon: 'success',
                    title: this.translate.instant('login.alerts.loginSuccess.title'),
                    html: this.translate.instant('login.alerts.loginSuccess.message', { userName }),
                    confirmButtonText: this.translate.instant('login.alerts.loginSuccess.button'),
                    confirmButtonColor: '#005f83', 
                  }).then(() => this.router.navigate(['/dashboard']));
                } catch (error) {
                  console.error('An error occurred while showing success alert:', error);
                }
              },
              error: () => {
                try {
                  const modalElement = document.getElementById('dafErrorModal');
                  if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                  }
                } catch (error) {
                  console.error('An error occurred while showing the error modal:', error);
                }
              },
            });
          } catch (error) {
            console.error('An error occurred while processing the login response:', error);
          }
        },
        error: () => {
          try {
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('login.alerts.loginFailed.title'),
              text: this.translate.instant('login.alerts.loginFailed.message'),
              confirmButtonColor: this.translate.instant('common.colors.primary'),
            });
          } catch (error) {
            console.error('An error occurred while showing the login failed alert:', error);
          }
        },
      });
    } catch (error) {
      console.error('An error occurred during the login process:', error);
    }
  }
}