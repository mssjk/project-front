import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonationService } from '../../services/donation/donation.service';
import { CharityService } from '../../services/charity/charity.service';
import { DAFService } from '../../services/daf/daf.service';
import { RouterModule } from '@angular/router';
import { Donation } from '../../shared/interfaces/donation';
import { Charities } from '../../shared/interfaces/charities';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CONSTANTS } from '../../shared/constants/constants';
import { PdfService } from '../../services/pdf/pdf.service';

@Component({
  selector: 'app-viewdonation',
  templateUrl: './viewdonation.component.html',
  styleUrls: ['./viewdonation.component.css'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    TranslateModule,
  ],
})
export class ViewDonationComponent implements OnInit {
  userId: number = 0;
  userName: string = '';
  dafBalance: number = 0;
  totalDonations: number = 0;
  donations: Donation[] = [];
  allCharities: Charities[] = [];
  filteredDonations: Donation[] = [];
  charitiesDonatedTo: Charities[] = [];
  uniqueSectors: string[] = [];
  selectedSector: string = '';
  selectedDuration: string = '';
  currentPage: number = 1; // Current page number
  itemsPerPage: number = 10; // Number of items per page

  showAll:boolean=false;
  

  constructor(
    private donationService: DonationService,
    private charityService: CharityService,
    private dafService: DAFService,
    private translate: TranslateService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_USER_ID));
    this.userName = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_USER_NAME) || '';
    this.fetchDAFData();
    this.fetchCharities();
    this.fetchDonations();
    console.log(this.donations);
  }

  fetchDAFData() {
    try {
      if (!this.userId || isNaN(this.userId)) {
        console.error('Invalid userId:', this.userId);
        return;
      }

      this.dafService.getDAFAccount(this.userId).subscribe({
        next: (daf) => {
          try {
            if (daf && typeof daf === 'object') {
              this.dafBalance = typeof daf.dafBalance === 'number' ? daf.dafBalance : 0;
              this.totalDonations = typeof daf.totalDonated === 'number' ? daf.totalDonated : 0;
              console.log('DAF Data:', daf);
              console.log('DAF Balance:', this.dafBalance);
            } else {
              console.error('Unexpected DAF account response:', daf);
              this.dafBalance = 0;
              this.totalDonations = 0;
            }
          } catch (innerError) {
            console.error('Error processing DAF account response:', innerError);
            this.dafBalance = 0;
            this.totalDonations = 0;
          }
        },
        error: (err) => {
          console.error('Error fetching DAF account:', err);
          this.dafBalance = 0;
          this.totalDonations = 0;
        },
        complete: () => {
          console.log('DAF account fetch operation completed.');
        },
      });
    } catch (error) {
      console.error('Error in fetchDAFData method:', error);
      this.dafBalance = 0;
      this.totalDonations = 0;
    }
  }

  fetchCharities(): void {
    try {
      this.charityService.getAllCharities().subscribe({
        next: (charities) => {
          try {
            if (Array.isArray(charities) && charities.length > 0) {
              this.allCharities = charities.filter(
                (charity) => charity && typeof charity.category === 'string'
              );
              this.uniqueSectors = [
                ...new Set(
                  this.allCharities
                    .map((charity) => charity.category)
                    .filter((category) => typeof category === 'string' && category.trim() !== '')
                ),
              ];
            } else {
              console.warn('No charities found or invalid response:', charities);
              this.allCharities = [];
              this.uniqueSectors = [];
            }
          } catch (innerError) {
            console.error('Error processing charities response:', innerError);
            this.allCharities = [];
            this.uniqueSectors = [];
          }
        },
        error: (err) => {
          console.error('Error loading charities:', err);
          this.allCharities = [];
          this.uniqueSectors = [];
        },
        complete: () => {
          console.log('Charities fetch operation completed.');
        },
      });
    } catch (error) {
      console.error('Error in fetchCharities method:', error);
      this.allCharities = [];
      this.uniqueSectors = [];
    }
  }

  fetchDonations(): void {
    try {
      if (!this.userId || isNaN(this.userId)) {
        console.error('Invalid userId:', this.userId);
        this.donations = [];
        this.filteredDonations = [];
        this.charitiesDonatedTo = [];
        return;
      }

      this.donationService.getUserDonations(this.userId).subscribe({
        next: (donations) => {
          try {
            if (!Array.isArray(donations) || donations.length === 0) {
              console.warn('No donations found or invalid response:', donations);
              this.donations = [];
              this.filteredDonations = [];
              this.charitiesDonatedTo = [];
              return;
            }

            this.donations = donations.map((donation) => {
              if (!donation || typeof donation !== 'object') {
                console.warn('Invalid donation object:', donation);
                return { charityName: 'Unknown', sector: 'Unknown' };
              }
              const charity = this.allCharities?.find(
                (c) => c.charityId === donation?.charityId
              );
              return {
                ...donation,
                charityName: charity?.name || 'Unknown',
                sector: charity?.category || 'Unknown',
              };
            });

            const donatedCharityIds = new Set<number>();
            donations.forEach((donation) => {
              if (donation?.charityId) {
                donatedCharityIds.add(donation.charityId);
              }
            });

            this.charitiesDonatedTo = Array.from(donatedCharityIds)
              .map((id) => this.allCharities?.find((c) => c.charityId === id))
              .filter((charity): charity is Charities => charity !== undefined);
            this.filteredDonations = [...this.donations];
            console.log('User Donations:', this.donations);
            console.log('Charities Donated To:', this.charitiesDonatedTo);
          } catch (error) {
            console.error('Error processing donations:', error);
            this.donations = [];
            this.filteredDonations = [];
            this.charitiesDonatedTo = [];
          }
        },
        error: (err) => {
          console.error('Error fetching donations:', err);
          this.donations = [];
          this.filteredDonations = [];
          this.charitiesDonatedTo = [];
        },
        complete: () => {
          console.log('Donations fetch operation completed.');
        },
      });
    } catch (error) {
      console.error('Error in fetchDonations method:', error);
      this.donations = [];
      this.filteredDonations = [];
      this.charitiesDonatedTo = [];
    }
  }

  formatDateTime(date: string | Date | null | undefined): string {
    try {
      try {
        if (!date) {
          console.warn('Invalid date provided:', date);
          return 'Invalid Date';
        }

        const parsedDate = date instanceof Date ? date : new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.warn('Unable to parse date:', date);
          return 'Invalid Date';
        }

        const options: Intl.DateTimeFormatOptions = CONSTANTS.DATE_FORMAT_OPTIONS;
        return parsedDate.toLocaleDateString(CONSTANTS.LOCALE, options);
      } catch (innerError) {
        console.error('Inner error while formatting date:', innerError);
        return 'Invalid Date';
      }
    } catch (error) {
      console.error(CONSTANTS.ERROR_FORMATTING_DATE, error);
      return CONSTANTS.INVALID_DATE;
    }
  }

  filterTable(): void {
    try {
      const today = new Date();

      this.filteredDonations = this.donations.filter((donation) => {
        try {
          if (!donation || typeof donation !== 'object' || !donation.date) {
            console.warn('Invalid donation object:', donation);
            return false;
          }

          const donationDate = new Date(donation.date);
          if (!(donationDate instanceof Date) || isNaN(donationDate.getTime())) {
            console.warn('Invalid donation date:', donation.date);
            return false;
          }

          const timeDifference = today.getTime() - donationDate.getTime();
          const monthsDifference =
            (today.getFullYear() - donationDate.getFullYear()) * 12 +
            (today.getMonth() - donationDate.getMonth());

          const matchesSector =
            !this.selectedSector || donation.sector === this.selectedSector;

          const matchesDuration =
            !this.selectedDuration ||
            (this.selectedDuration === CONSTANTS.DURATION_24HOURS &&
              timeDifference <= CONSTANTS.MILLISECONDS_IN_24HOURS) ||
            (this.selectedDuration !== CONSTANTS.DURATION_24HOURS &&
              !isNaN(Number(this.selectedDuration)) &&
              monthsDifference <= Number(this.selectedDuration));

          return matchesSector && matchesDuration;
        } catch (error) {
          console.error(CONSTANTS.ERROR_FILTERING_DONATION, donation, error);
          return false;
        }
      });
    } catch (error) {
      console.error(CONSTANTS.ERROR_FILTER_TABLE, error);
      this.filteredDonations = [];
    }
  }

  clearFilters(): void {
    this.selectedSector = '';
    this.selectedDuration = '';
    this.filteredDonations = [...this.donations];
  }

  logout(): void {
    localStorage.clear();
  }

  get visibleCharities(): Charities[] {
    return this.showAll ? this.charitiesDonatedTo : this.charitiesDonatedTo.slice(0, 5);
  }
  toggleShowAll():void{
    this.showAll=!this.showAll
  }

  get paginatedDonations(): Donation[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDonations.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDonations.length / this.itemsPerPage);
  }

  downloadPDF(): void{
    this.pdfService.downloadPDF(this.userName,this.userId,this.dafBalance,this.filteredDonations,this.formatDateTime.bind(this));
  }
}
