import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../services/transfer/transfer.service';
import { DAFService } from '../../services/daf/daf.service';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { TranslateModule } from '@ngx-translate/core';
import { AppConstants } from '../../shared/constant/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-viewtransfer',
  templateUrl: './viewtransfer.component.html',
  styleUrls: ['./viewtransfer.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterModule, TranslateModule, NavbarComponent, FooterComponent],
})
export class ViewTransferComponent implements OnInit {
  userName: string = '';
  totalTransfers: number = 0;
  transfers: any[] = [];
  filteredTransfers: any[] = [];
  selectedDuration: string = '';
  userId: number = 0;

  constructor(
    private transferService: TransferService,
    private dafService: DAFService,
    private router: Router
  ) {}

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

      this.fetchTransfers();
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.INITIALIZATION_ERROR);
    }
  }

  fetchTransfers(): void {
    try {
      this.transferService.getUserTransfers(this.userId).subscribe({
        next: (transfers) => {
          const dafAccountObservables = transfers.map((transfer) =>
            this.dafService.getDAFAccountById(transfer.dafAccountId)
          );

          forkJoin(dafAccountObservables).subscribe({
            next: (dafAccounts) => {
              this.transfers = transfers.map((transfer, index) => ({
                ...transfer,
                dafAccountNumber: dafAccounts[index]?.accountNumber || AppConstants.DEFAULTS.UNKNOWN_ACCOUNT,
              }));
              this.filteredTransfers = [...this.transfers];
              this.totalTransfers = this.transfers.reduce((sum, t) => sum + (t.amount || 0), 0);
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
      this.handleError(error, AppConstants.MESSAGES.ERROR.FETCH_TRANSFERS);
    }
  }

  filterTable(): void {
    try {
      const today = new Date();
  
      this.filteredTransfers = this.transfers.filter((transfer) => {
        if (!transfer.date) return false; 
        const transferDate = new Date(transfer.date);
        if (isNaN(transferDate.getTime())) return false; 
  
        const timeDifference = today.getTime() - transferDate.getTime(); 
        const monthsDifference =
          (today.getFullYear() - transferDate.getFullYear()) * 12 +
          (today.getMonth() - transferDate.getMonth());
  
        const matchesDuration =
          !this.selectedDuration ||
          (this.selectedDuration === AppConstants.TIME.DURATION_24_HOURS && 
            timeDifference <= AppConstants.TIME.MILLISECONDS_IN_A_DAY) || 
          (this.selectedDuration !== AppConstants.TIME.DURATION_24_HOURS && 
            monthsDifference <= Number(this.selectedDuration)); 
  
        return matchesDuration;
      });
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.FILTER_ERROR);
    }
  }
  
  clearFilters(): void {
    try {
      this.filteredTransfers = [...this.transfers];
      this.selectedDuration = '';
      console.log(AppConstants.MESSAGES.INFO.FILTERS_CLEARED);
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.CLEAR_FILTERS_ERROR);
    }
  }

  formatDateTime(date: string | Date): string {
    try {
      const options: Intl.DateTimeFormatOptions = {
        [AppConstants.DATE_FORMAT.KEYS.YEAR]: AppConstants.DATE_FORMAT.VALUES.YEAR,
        [AppConstants.DATE_FORMAT.KEYS.MONTH]: AppConstants.DATE_FORMAT.VALUES.MONTH,
        [AppConstants.DATE_FORMAT.KEYS.DAY]: AppConstants.DATE_FORMAT.VALUES.DAY,
        [AppConstants.DATE_FORMAT.KEYS.HOUR]: AppConstants.DATE_FORMAT.VALUES.HOUR,
        [AppConstants.DATE_FORMAT.KEYS.MINUTE]: AppConstants.DATE_FORMAT.VALUES.MINUTE,
      };
      return new Date(date).toLocaleDateString(AppConstants.LOCALE.DEFAULT, options); 
    } catch (error) {
      this.handleError(error, AppConstants.MESSAGES.ERROR.FORMAT_DATE_ERROR);
      return '';
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