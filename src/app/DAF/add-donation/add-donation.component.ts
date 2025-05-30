import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SwalUtil } from '../../shared/util/swal/swal.util';
import { CharityService } from '../../services/charity/charity.service';
import { DAFService } from '../../services/daf/daf.service';
import { DonationService } from '../../services/donation/donation.service';
import { AuthService } from '../../services/auth/auth.service';
import { Charities } from '../../shared/interfaces/charities';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppConstants } from '../../shared/constant/app.constant';
import { ErrorMessages } from '../../shared/messages/error-messages';
import { SuccessMessages } from '../../shared/messages/success-messages';
import { ValidationMessages } from '../../shared/messages/validation-messages';
import { SwalMessages } from '../../shared/messages/swal-messages';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-donation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    
    FooterComponent,
    TranslateModule,
    NavbarComponent
  ],
  templateUrl: './add-donation.component.html',
  styleUrls: ['./add-donation.component.css'],
})
export class AddDonationComponent implements OnInit {
  dafBalance = 0;
  totalDonated = 0;
  charities: Charities[] = [];
  charitiesDonatedTo: Charities[] = [];
  recommendationAmount: number | null = null;
  recommendationCategory: string | null = null;
  recommendedCharity: any = null;
  categories: string[] = [];
  selectedCharities: {
    charityId: number;
    name: string;
    donationAmount: number;
    percentage: number;
  }[] = [];
  showCharityList: boolean = false;
  isEditing = false;

  totalDonationAmount: number = 0;
  agreedToTerms = false;
  donationDesc = '';
  searchTerm = '';
  email = '';
  userName = '';
  userId: number = 0;
  showPercentageWarning: boolean = false;
  warningMessage: string = '';
  showAll:boolean=false;

  constructor(
    private charityService: CharityService,
    private dafService: DAFService,
    private donationService: DonationService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId'));
    this.userName = localStorage.getItem('userName') || '';
    this.fetchDAFData();
    this.loadCharities();
    this.fetchDonations();
  }



  getRecommendation(): void {
    const payload = {
      amount: this.recommendationAmount,
      category: this.recommendationCategory,
    };

    this.http.post('http://localhost:5269/api/Recommendation/predict', payload).subscribe({
      next: (response: any) => {
        this.recommendedCharity = response;

        // Display SweetAlert2 pop-up with the recommended charity details
        Swal.fire({
          
          title: 'Charity Recommended!',
          html: `
            <p><strong>Name:</strong> ${this.recommendedCharity.name}</p>
            <p><strong>Category:</strong> ${this.recommendedCharity.category}</p>
            <p><strong>Location:</strong> ${this.recommendedCharity.location}</p>
            <p><strong>Description:</strong> ${this.recommendedCharity.description}</p>
          `,
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        console.error('Error fetching recommendation:', err);

        // Display an error message using SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while fetching the recommendation!',
        });
      },
    });
  }

  fetchDonations() {
    try {
      this.donationService.getUserDonations(this.userId).subscribe({
        next: (donations) => {
          console.log(SuccessMessages.USER_DONATIONS, donations);
          if (!donations || donations.length === 0) {
            console.warn(ErrorMessages.NO_DONATIONS_FOUND);
            this.charitiesDonatedTo = [];
            return;
          }

          console.log(SuccessMessages.USER_DONATIONS, donations);

          const donatedCharityIds = new Set<number>(
            donations
              .filter((d) => d.charityId !== null)
              .map((d) => d.charityId as number)
          );

          console.log("donatedCharityIds", donatedCharityIds);

          if (!this.charities || this.charities.length === 0) {
            console.warn(ErrorMessages.NO_CHARITIES_SELECTED);
            this.charitiesDonatedTo = [];
            return;
          }

          this.charitiesDonatedTo = Array.from(donatedCharityIds)
            .map((charityId) =>
              this.charities.find((c) => c.charityId === charityId)
            )
            .filter((charity): charity is Charities => charity !== undefined);
          console.log("charitiesDonatedTo", this.charitiesDonatedTo);
        },
        error: (err) => {
          console.error(ErrorMessages.FETCH_USER_DONATIONS, err);
          SwalUtil.showAlert(
            AppConstants.SWAL_ERROR,
            AppConstants.SWAL_ERROR_TITLE,
            ErrorMessages.FETCH_USER_DONATIONS
          );
        },
      });
    } catch (error) {
      console.error(ErrorMessages.UNEXPECTED_ERROR, error);
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        ErrorMessages.UNEXPECTED_ERROR
      );
    }
  }

  fetchDAFData() {
    try {
      this.dafService.getDAFAccount(this.userId).subscribe({
        next: (daf) => {
          this.dafBalance = daf.dafBalance;
          this.totalDonated = daf.totalDonated;
        },
        error: (err) => {
          console.error(ErrorMessages.FETCH_DAF_ACCOUNT, err);
          SwalUtil.showAlert(
            AppConstants.SWAL_ERROR,
            AppConstants.SWAL_ERROR_TITLE,
            ErrorMessages.FETCH_DAF_ACCOUNT
          );
        },
      });

      this.authService.getUsers().subscribe({
        next: (users) => {
          console.log(SuccessMessages.USER_DONATIONS, users);
          const user = Array.isArray(users) 
            ? users.find((u: { userId: number; email: string }) => u.userId === this.userId) 
            : undefined;
          if (user) {
            this.email = user.email;
          }
        },
        error: (err) => {
          console.error(ErrorMessages.FETCH_USER_DATA, err);
          SwalUtil.showAlert(
            AppConstants.SWAL_ERROR,
            AppConstants.SWAL_ERROR_TITLE,
            ErrorMessages.FETCH_USER_DATA
          );
        },
      });
    } catch (error) {
      console.error(ErrorMessages.UNEXPECTED_ERROR, error);
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        ErrorMessages.UNEXPECTED_ERROR
      );
    }
  }

  loadCharities() {
  try {
    this.charityService.getAllCharities().subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length > 0) {
          this.charities = res.filter(c => c && c.category && c.name); // Ensure valid charities
          this.categories = [...new Set(this.charities.map(c => c.category))]; // Extract unique categories
        } else {
          console.warn('No charities found.');
          this.charities = [];
          this.categories = [];
        }
      },
      error: (err) => {
        console.error('Error loading charities:', err);
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_ERROR_TITLE,
          'Error loading charities'
        );
        this.charities = [];
        this.categories = [];
      },
    });
  } catch (error) {
    console.error('Unexpected error in loadCharities:', error);
    SwalUtil.showAlert(
      AppConstants.SWAL_ERROR,
      AppConstants.SWAL_ERROR_TITLE,
      'Unexpected error occurred'
    );
    this.charities = [];
    this.categories = [];
  }
}

  hideCharityList() {
    try {
      setTimeout(() => {
        if (this.showCharityList !== undefined) {
          this.showCharityList = false;
        }
      }, AppConstants.HIDE_CHARITY_LIST_TIMEOUT); // Replace hardcoded timeout
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error); // Replace hardcoded error message
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        SwalMessages.UNEXPECTED_ERROR
      );
    }
  }

  get visibleCharities(): Charities[] {
    return this.showAll ? this.charitiesDonatedTo : this.charitiesDonatedTo.slice(0, 5);
  }

  selectCharity(charity: Charities) {
    try {
      if (!charity || !charity.charityId || !charity.name) {
        console.error(SwalMessages.INVALID_CHARITY_OBJECT, charity); // Replace hardcoded error message
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_ERROR_TITLE,
          SwalMessages.INVALID_CHARITY_OBJECT
        );
        return;
      }

      if (
        !this.selectedCharities.some((c) => c.charityId === charity.charityId)
      ) {
        const count = this.selectedCharities.length + 1; // Include the new charity in the count
        if (count === 0) {
          console.error(ValidationMessages.NO_CHARITIES_SELECTED);
          SwalUtil.showAlert(
            AppConstants.SWAL_ERROR,
            AppConstants.SWAL_ERROR_TITLE,
            ValidationMessages.NO_CHARITIES_SELECTED
          );
          return;
        }

        const equalPercentage = Math.floor(AppConstants.TOTAL_PERCENTAGE / count);

        // Update existing charities' percentages
        this.selectedCharities.forEach((c) => {
          c.percentage = equalPercentage;
          c.donationAmount = Math.floor(
            (this.totalDonationAmount * equalPercentage) / AppConstants.TOTAL_PERCENTAGE
          );
        });

        // Add the new charity with the calculated percentage
        this.selectedCharities.push({
          charityId: charity.charityId,
          name: charity.name,
          donationAmount: Math.floor(
            (this.totalDonationAmount * equalPercentage) / AppConstants.TOTAL_PERCENTAGE
          ),
          percentage: equalPercentage,
        });
      } else {
        console.warn(SwalMessages.INVALID_CHARITY_OBJECT, charity);
      }

      this.searchTerm = '';
      this.showCharityList = false;
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error); // Replace hardcoded error message
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        SwalMessages.UNEXPECTED_ERROR
      );
    }
  }

  removeCharity(index: number) {
    try {
      if (!this.selectedCharities || this.selectedCharities.length === 0) {
        console.warn(SwalMessages.NO_CHARITIES_TO_REMOVE);
        return;
      }

      if (index < 0 || index >= this.selectedCharities.length) {
        console.error(SwalMessages.INVALID_INDEX, index);
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_ERROR_TITLE,
          ValidationMessages.INVALID_CHARITY_INDEX
        );
        return;
      }

      this.selectedCharities.splice(index, 1);

      const count = this.selectedCharities.length;
      if (count > 0) {
        const equalPercentage = Math.floor(AppConstants.TOTAL_PERCENTAGE / count);
        this.selectedCharities.forEach((charity) => {
          charity.percentage = equalPercentage;
          charity.donationAmount = Math.floor(
            (this.totalDonationAmount * equalPercentage) / AppConstants.TOTAL_PERCENTAGE
          );
        });
      }
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error);
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        SwalMessages.UNEXPECTED_ERROR
      );
    }
  }

  toggleEditPartition() {
    try {
      if (this.isEditing) {
        // Validate total percentage when exiting edit mode
        if (!this.selectedCharities || this.selectedCharities.length === 0) {
          this.showPercentageWarning = true;
          this.warningMessage = ValidationMessages.NO_CHARITIES_SELECTED; // Replace hardcoded message
          return;
        }
  
        if (this.totalPercentage !== AppConstants.TOTAL_PERCENTAGE) { // Replace hardcoded percentage
          this.showPercentageWarning = true;
          this.warningMessage = ValidationMessages.INVALID_PERCENTAGE; // Replace hardcoded message
          return; // Prevent exiting edit mode if validation fails
        }
  
        // Clear the warning if validation passes
        this.showPercentageWarning = false;
        this.warningMessage = '';
      }
  
      this.isEditing = !this.isEditing;
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error); // Replace hardcoded error message
    }
  }

  toggleShowAll():void{
    this.showAll=!this.showAll
  }

  splitDonationEqually() {
    try {
      if (!this.selectedCharities || this.selectedCharities.length === 0) {
        console.warn(ValidationMessages.NO_CHARITIES_SELECTED);
        return;
      }
  
      if (this.isEditing) {
        console.warn(ValidationMessages.INVALID_PERCENTAGE);
        return;
      }
  
      const count = this.selectedCharities.length;
      const equalPercentage = Math.floor(AppConstants.TOTAL_PERCENTAGE / count); // Calculate equal percentage
      let totalAssignedPercentage = equalPercentage * count;
  
      // Distribute the remaining percentage to the first charity
      const remainingPercentage = AppConstants.TOTAL_PERCENTAGE - totalAssignedPercentage;
  
      this.selectedCharities.forEach((charity, index) => {
        charity.percentage = equalPercentage;
        if (index === 0) {
          charity.percentage += remainingPercentage; // Add the remaining percentage to the first charity
        }
        charity.donationAmount = Math.floor(
          (this.totalDonationAmount * charity.percentage) / AppConstants.TOTAL_PERCENTAGE
        );
      });
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error);
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        SwalMessages.UNEXPECTED_ERROR
      );
    }
  }

  updateAmountsFromPercentage() {
    try {
      const totalPercentage = this.selectedCharities.reduce(
        (sum, charity) => sum + charity.percentage,
        0
      );
  
      if (totalPercentage > AppConstants.TOTAL_PERCENTAGE) { // Replace hardcoded percentage
        this.showPercentageWarning = true;
        this.warningMessage = ValidationMessages.INVALID_PERCENTAGE; // Replace hardcoded message
        return;
      }
  
      // Clear the warning if validation passes
      this.showPercentageWarning = false;
      this.warningMessage = '';
  
      // Calculate the remaining percentage to distribute
      const remainingPercentage = AppConstants.TOTAL_PERCENTAGE - totalPercentage; // Replace hardcoded percentage
  
      // Distribute the remaining percentage equally among charities with zero percentage
      const remainingCharities = this.selectedCharities.filter(
        (charity) => charity.percentage === 0
      );
  
      if (remainingCharities.length > 0) {
        const equalShare = Math.floor(
          remainingPercentage / remainingCharities.length
        );
  
        remainingCharities.forEach((charity) => {
          charity.percentage = equalShare;
          charity.donationAmount = Math.floor(
            (this.totalDonationAmount * charity.percentage) / AppConstants.TOTAL_PERCENTAGE // Replace hardcoded percentage
          );
        });
      }
  
      // Update donation amounts for all charities
      this.selectedCharities.forEach((charity) => {
        charity.donationAmount = Math.floor(
          (this.totalDonationAmount * charity.percentage) / AppConstants.TOTAL_PERCENTAGE // Replace hardcoded percentage
        );
      });
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error); // Replace hardcoded error message
    }
  }

  updateTotalAmount() {
    try {
      if (!this.selectedCharities || this.selectedCharities.length === 0) {
        console.warn(ValidationMessages.NO_CHARITIES_SELECTED);
        this.totalDonationAmount = 0;
        return;
      }

      this.totalDonationAmount = this.selectedCharities.reduce((sum, charity) => {
        if (!charity || typeof charity.donationAmount !== 'number' || charity.donationAmount < 0) {
          console.warn(ValidationMessages.INVALID_AMOUNT, charity);
          return sum;
        }
        return sum + charity.donationAmount;
      }, 0);
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error);
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        ValidationMessages.INVALID_TOTAL_AMOUNT
      );
      this.totalDonationAmount = 0;
    }
  }

  donate() {
    try {
      if (isNaN(this.totalDonationAmount) || this.totalDonationAmount <= 0) {
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_VALIDATION_ERROR,
          ValidationMessages.INVALID_AMOUNT // Replace hardcoded validation message
        );
        return;
      }

      if (this.totalDonationAmount > this.dafBalance) {
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_INSUFFICIENT_BALANCE,
          ValidationMessages.INSUFFICIENT_BALANCE // Replace hardcoded validation message
        );
        return;
      }

      if (!this.agreedToTerms) {
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_VALIDATION_ERROR,
          ValidationMessages.TERMS_NOT_AGREED // Replace hardcoded validation message
        );
        return;
      }

      if (!this.selectedCharities || this.selectedCharities.length === 0) {
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_VALIDATION_ERROR,
          ValidationMessages.NO_CHARITIES_SELECTED // Replace hardcoded validation message
        );
        return;
      }

      const totalPercentage = this.selectedCharities.reduce(
        (sum, charity) => sum + (charity.percentage || 0),
        0
      );

      if (totalPercentage !== 100) {
        console.error(ValidationMessages.INVALID_PERCENTAGE, totalPercentage);
        SwalUtil.showAlert(
          AppConstants.SWAL_ERROR,
          AppConstants.SWAL_VALIDATION_ERROR,
          ValidationMessages.INVALID_PERCENTAGE // Replace hardcoded validation message
        );
        return;
      }

      this.processDonationsSequentially();
    } catch (error) {
      console.error(SwalMessages.UNEXPECTED_ERROR, error); // Replace hardcoded error message
      SwalUtil.showAlert(
        AppConstants.SWAL_ERROR,
        AppConstants.SWAL_ERROR_TITLE,
        SwalMessages.UNEXPECTED_ERROR
      );
    }
  }

  processDonationsSequentially() {
    try {
      if (!this.selectedCharities || this.selectedCharities.length === 0) {
        console.error(ErrorMessages.NO_CHARITIES_SELECTED);
        SwalUtil.showAlert(
          'error',
          'Validation Error',
          this.translate.instant('addDonation.form.noCharitiesSelected')
        );
        return;
      }

      const donations = this.selectedCharities.map((charity) => {
        if (!charity || !charity.charityId || !charity.name) {
          console.error(ErrorMessages.INVALID_CHARITY_DATA, charity);
          SwalUtil.showAlert(
            'error',
            'Error',
            ErrorMessages.INVALID_CHARITY_DATA
          );
          throw new Error(ErrorMessages.INVALID_CHARITY_DATA);
        }
        return {
          userId: this.userId,
          charityId: charity.charityId,
          amount: charity.donationAmount,
          description: this.donationDesc,
          Email: this.email,
          CharityName: charity.name,
        };
      });

      const processDonation = (index: number) => {
        if (index >= donations.length) {
          SwalUtil.showAlert(
            'success',
            this.translate.instant('addDonation.form.success'),
            AppConstants.GRT_SWAL,
            this.router,
            AppConstants.DASHBOARD
          );
          return;
        }

        this.donationService.addDonation(donations[index]).subscribe({
          next: () => {
            processDonation(index + 1); // Process the next donation
          },
          error: (err) => {
            console.error(ErrorMessages.PROCESS_DONATION, err);
            SwalUtil.showAlert(
              'error',
              'Error',
              this.translate.instant('addDonation.form.error')
            );
          },
        });
      };

      processDonation(0); // Start processing donations
    } catch (error) {
      console.error(ErrorMessages.UNEXPECTED_ERROR, error);
      SwalUtil.showAlert('error', 'Error', ErrorMessages.UNEXPECTED_ERROR);
    }
  }

  containsHtmlTags(value: string): boolean {
    try {
      if (!value || typeof value !== 'string') return false;
      const hasTags = value.includes('<') && value.includes('>');
      return hasTags;
    } catch (error) {
      console.error('Error in containsHtmlTags:', error);
      return false;
    }
  }

  get filteredCharities() {
    try {
      if (!this.charities || !Array.isArray(this.charities)) {
        console.warn('Charities list is not valid.');
        return [];
      }
      return this.charities.filter((c) =>
        c.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error in filteredCharities:', error);
      return [];
    }
  }
  get totalPercentage(): number {
    return Math.round(
      this.selectedCharities.reduce(
        (sum, charity) => sum + (charity.percentage || 0),
        0
      )
    );
  }
}

