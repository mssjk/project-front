import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BrokeService } from '../../services/brokerage/broke.service';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
import { FooterComponent } from "../../shared/footer/footer.component";
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../services/config/config.service';
import { AppConstants } from '../../shared/constant/app.constant';

@Component({
  selector: 'app-b-login',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    FooterComponent,
    NavbarComponent,
    TranslateModule,
  ],
  templateUrl: './b-login.component.html',
  styleUrl: './b-login.component.css',
})
export class BLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private broke: BrokeService,
    private translate: TranslateService,
    private config: ConfigService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  getLogo(): string {
    return this.config.getLogo();
  }

  getImg(): string {
    return this.config.getDonateImg();
  }

  onSubmit(): void {
    try {
      if (this.loginForm.valid) {
        const { username, password } = this.loginForm.value;
        const logindata = { email: username, password };

        this.authService.login(logindata).subscribe({
          next: (response) => {
            try {
              const userId = response.userId;
              const userName = response.name;

              localStorage.setItem(AppConstants.LOCAL_STORAGE_USER_ID, userId);
              localStorage.setItem(AppConstants.LOCAL_STORAGE_USER_NAME, userName);

              this.broke.getBrokerAccount(userId).subscribe({
                next: () => {

                  const successMessage = AppConstants.MESSAGES.SUCCESS.LOGIN_SUCCESS.replace(
                    '{username}',
                    userName
                  );
                  Swal.fire({
                    icon: AppConstants.SWAL_SUCCESS,
                    title: AppConstants.MESSAGES.TITLES.SUCCESS,
                    html: `${AppConstants.MESSAGES.SUCCESS.LOGIN_SUCCESS} <b>${userName}</b>`,
                    width: AppConstants.DEFAULTS.SWEETALERT_WIDTH, 
                    heightAuto: false,
                    confirmButtonText: AppConstants.MESSAGES.BUTTONS.GO_TO_DASHBOARD,
                    confirmButtonColor: AppConstants.DEFAULTS.CONFIRM_BUTTON_COLOR,
                  }).then(() => this.router.navigate([AppConstants.BDASHBOARD]));
                },
                error: (err) => {
                  this.handleError(
                    err,
                    AppConstants.MESSAGES.ERROR.FETCH_BROKERAGE
                  );
                },
              });
            } catch (error) {
              this.handleError(error, AppConstants.MESSAGES.ERROR.LOGIN_ERROR);
            }
          },
          error: (err) => {
            this.handleError(err, AppConstants.MESSAGES.ERROR.INVALID_CREDENTIALS);
          },
        });
      } else {
        Swal.fire({
          icon: AppConstants.SWAL_WARNING,
          title: AppConstants.MESSAGES.TITLES.VALIDATION_ERROR,
          text: AppConstants.MESSAGES.ERROR.VALIDATION_ERROR,
          width: AppConstants.DEFAULTS.SWEETALERT_WIDTH, 
          heightAuto: false,
          confirmButtonColor: AppConstants.DEFAULTS.CONFIRM_BUTTON_COLOR,
        });
      }
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.LOGIN_ERROR);
    }
  }

  private handleError(error: any, userMessage: string): void {
    try {
      console.error(userMessage, error);
      Swal.fire({
        icon: AppConstants.SWAL_ERROR,
        title: this.translate.instant(AppConstants.MESSAGES.TITLES.ERROR),
        text: this.translate.instant(userMessage),
        width: AppConstants.DEFAULTS.SWEETALERT_WIDTH, 
        heightAuto: false,
        confirmButtonColor: AppConstants.DEFAULTS.CONFIRM_BUTTON_COLOR,
      });
    } catch (loggingError) {
      console.error(AppConstants.MESSAGES.ERROR.HANDLING_ERROR, loggingError);
    }
  }
}