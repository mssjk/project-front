import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BrokeService } from '../../services/brokerage/broke.service';
import { TransferService } from '../../services/transfer/transfer.service';
import { DAFService } from '../../services/daf/daf.service';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { TranslateModule } from '@ngx-translate/core';
import { AppConstants } from '../../shared/constant/app.constant';

@Component({
  selector: 'app-b-dashboard',
  templateUrl: './b-dashboard.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NavbarComponent,
    FooterComponent,
    TranslateModule,
  ],
  providers: [BrokeService, TransferService, DAFService],
  styleUrls: ['./b-dashboard.component.css'],
})
export class BDashboardComponent implements OnInit {
  userId: number = 0;
  userName: string = '';
  totalBalance: number = 0;
  totalTransfers: number = 0;
  previousTransfers: any[] = [];
  transferForm: FormGroup;

  constructor(
    private brokeService: BrokeService,
    private transferService: TransferService,
    private dafService: DAFService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.transferForm = this.fb.group({
      accountNumber: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      reference: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    try {
      this.userId = Number(localStorage.getItem(AppConstants.LOCAL_STORAGE_USER_ID)) || 0;
      this.userName = localStorage.getItem(AppConstants.LOCAL_STORAGE_USER_NAME) || '';

      if (!this.userId) {
        Swal.fire({
          icon: AppConstants.SWAL_ERROR,
          title: AppConstants.MESSAGES.TITLES.ERROR,
          text: AppConstants.MESSAGES.ERROR.USER_NOT_LOGGED_IN,
        }).then(() => this.router.navigate([AppConstants.LOGIN]));
        return;
      }

      this.fetchBrokerageBalance();
      this.fetchTotalTransfers();
      this.fetchPreviousTransfers();
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.INITIALIZATION_ERROR);
    }
  }

  fetchBrokerageBalance(): void {
    try {
      this.brokeService.getBrokerAccount(this.userId).subscribe({
        next: (response) => {
          if (response && response.data.availableBalance !== undefined) {
            this.totalBalance = response.data.availableBalance;
          } else {
            console.warn(AppConstants.MESSAGES.ERROR.INVALID_BROKERAGE_RESPONSE, response);
            Swal.fire({
              icon: AppConstants.SWAL_WARNING,
              title: AppConstants.MESSAGES.TITLES.WARNING,
              text: AppConstants.MESSAGES.ERROR.FETCH_BROKERAGE,
            });
          }
        },
        error: (err) => {
          this.handleError(err, AppConstants.MESSAGES.ERROR.FETCH_BROKERAGE);
        },
      });
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.FETCH_BROKERAGE_BALANCE);
    }
  }

  fetchTotalTransfers(): void {
    try {
      this.transferService.getUserTransfers(this.userId).subscribe({
        next: (transfers) => {
          if (Array.isArray(transfers)) {
            this.previousTransfers = transfers;
            this.totalTransfers = transfers.reduce((sum, transfer) => sum + (transfer.amount || 0), 0);
          } else {
            console.warn(AppConstants.MESSAGES.ERROR.INVALID_TRANSFER_RESPONSE, transfers);
            Swal.fire({
              icon: AppConstants.SWAL_WARNING,
              title: AppConstants.MESSAGES.TITLES.WARNING,
              text: AppConstants.MESSAGES.ERROR.FETCH_TRANSFERS,
            });
          }
        },
        error: (err) => {
          this.handleError(err, AppConstants.MESSAGES.ERROR.FETCH_TRANSFERS);
        },
      });
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.FETCH_TOTAL_TRANSFERS);
    }
  }

  fetchPreviousTransfers(): void {
    try {
      this.transferService.getUserTransfers(this.userId).subscribe({
        next: (transfers) => {
          if (!Array.isArray(transfers)) {
            console.warn(AppConstants.MESSAGES.ERROR.INVALID_TRANSFER_RESPONSE, transfers);
            return;
          }

          const dafAccountObservables = transfers.map((transfer) =>
            this.dafService.getDAFAccountById(transfer.dafAccountId)
          );

          forkJoin(dafAccountObservables).subscribe({
            next: (dafAccounts) => {
              this.previousTransfers = transfers.slice(0, 3).map((transfer, index) => ({
                ...transfer,
                dafAccountNumber: dafAccounts[index]?.accountNumber || AppConstants.DEFAULTS.UNKNOWN_ACCOUNT,
              }));
            },
            error: (err) => {
              this.handleError(err, AppConstants.MESSAGES.ERROR.FETCH_DAF_ACCOUNT);
            },
          });
        },
        error: (err) => {
          this.handleError(err, AppConstants.MESSAGES.ERROR.FETCH_TRANSFERS);
        },
      });
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.FETCH_PREVIOUS_TRANSFERS);
    }
  }

  openTransferModal(): void {
    try {
      const modalElement = document.getElementById(AppConstants.MODAL_TRANSFER_ID);
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.warn(AppConstants.MESSAGES.ERROR.MODAL_NOT_FOUND);
        Swal.fire({
          icon: AppConstants.SWAL_WARNING,
          title: AppConstants.MESSAGES.TITLES.WARNING,
          text: AppConstants.MESSAGES.ERROR.MODAL_NOT_FOUND,
        });
      }
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.OPEN_TRANSFER_MODAL);
    }
  }

  validateTransfer(): boolean {
    try {
      const { accountNumber, amount } = this.transferForm.value;

      if (!this.transferForm.valid) {
        Swal.fire({
          icon: AppConstants.SWAL_ERROR,
          title: AppConstants.MESSAGES.TITLES.VALIDATION_ERROR,
          text: AppConstants.MESSAGES.ERROR.VALIDATION_ERROR,
        });
        return false;
      }

      if (!accountNumber || amount <= 0) {
        Swal.fire({
          icon: AppConstants.SWAL_ERROR,
          title: AppConstants.MESSAGES.TITLES.VALIDATION_ERROR,
          text: AppConstants.MESSAGES.ERROR.INVALID_TRANSFER_DETAILS,
        });
        return false;
      }

      if (amount > this.totalBalance) {
        Swal.fire({
          icon: AppConstants.SWAL_ERROR,
          title: AppConstants.MESSAGES.TITLES.INSUFFICIENT_BALANCE,
          text: AppConstants.MESSAGES.ERROR.INSUFFICIENT_BALANCE,
        });
        return false;
      }

      return true;
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.VALIDATION_ERROR);
      return false;
    }
  }

  initiateTransfer(): void {
    try {
      if (!this.validateTransfer()) {
        return;
      }
 
      const { accountNumber, amount, reference } = this.transferForm.value;
 
      this.dafService.getDAFAccountByNumber(accountNumber).subscribe({
        next: (dafAccount) => {
          if (!dafAccount?.dafAccountId) {
            Swal.fire({
              icon: AppConstants.SWAL_ERROR,
              title: AppConstants.MESSAGES.ERROR.INVALID_ACCOUNT_TITLE,
              text: AppConstants.MESSAGES.ERROR.INVALID_ACCOUNT_MESSAGE,
            });
            return;
          }
 
          const transferData = {
            UserId: this.userId,
            BrokerageAccountId: this.userId,
            DAFAccountId: dafAccount.dafAccountId,
            Amount: amount,
            ReferenceNote: reference,
          };
 
          this.transferService.addTransfer(transferData).subscribe({
            next: () => {
              Swal.fire({
                icon: AppConstants.SWAL_SUCCESS,
                title: AppConstants.MESSAGES.SUCCESS.TRANSFER_SUCCESS_TITLE,
                text: AppConstants.MESSAGES.SUCCESS.TRANSFER_SUCCESS_MESSAGE,
              }).then(() => {
                const modalElement = document.getElementById(AppConstants.MODAL.TRANSFER_MODAL_ID);
                if (modalElement) {
                  const modal = bootstrap.Modal.getInstance(modalElement);
                  modal?.hide();
                }
 
                this.ngOnInit();
                this.transferForm.reset();
              });
            },
            error: (err) => {
              console.error(AppConstants.MESSAGES.ERROR.TRANSFER_FAILED, err);
              Swal.fire({
                icon: AppConstants.SWAL_ERROR, // Correct usage
                title: AppConstants.MESSAGES.ERROR.TRANSFER_FAILED_TITLE,
                text: AppConstants.MESSAGES.ERROR.TRANSFER_FAILED_MESSAGE,
            });
            },
          });
        },
        error: (err) => {
          console.error(AppConstants.MESSAGES.ERROR.FETCH_DAF_ACCOUNT, err);
          Swal.fire({
            icon: AppConstants.SWAL_ERROR,
            title: AppConstants.MESSAGES.ERROR.INVALID_ACCOUNT_TITLE,
            text: AppConstants.MESSAGES.ERROR.INVALID_ACCOUNT_MESSAGE,
          });
        },
      });
    } catch (error) {
      this.handleError(String(error), AppConstants.MESSAGES.ERROR.INITIATE_TRANSFER);
    }
  }

  logout(): void {
    try {
      localStorage.clear();
      this.router.navigate([AppConstants.LOGIN]);
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.LOGOUT_ERROR);
    }
  }

  private handleError(error: any, userMessage: string): void {
    try {
      console.error(userMessage, error);
      Swal.fire({
        icon: AppConstants.SWAL_ERROR,
        title: AppConstants.MESSAGES.TITLES.ERROR,
        text: userMessage,
      });
    } catch (loggingError) {
      console.error(AppConstants.MESSAGES.ERROR.HANDLING_ERROR, loggingError);
    }
  }
}