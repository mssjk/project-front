import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DAFService } from '../../services/daf/daf.service';
import { DonationService } from '../../services/donation/donation.service';
import { CharityService } from '../../services/charity/charity.service';
import { UserstoreService } from '../../services/userstore/userstore.service';
import { AuthService } from '../../services/auth/auth.service';
import { Charities } from '../../shared/interfaces/charities';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userId: number = 0;
  userName: string = '';
  dafBalance: number = 0;
  totalDonations: number = 0;
  charitiesDonatedTo: Charities[] = [];

  allCharities: Charities[] = [] as Charities[];
  filteredCharities: Charities[] = [] as Charities[];
  uniqueCategories: string[] = [];
  uniqueLocations: string[] = [];

  selectedCategory: string = '';
  selectedLocation: string = '';
  searchQuery: string = '';
  router: any;

  currentPage: number = 1; // Current page number
  itemsPerPage: number = 10; // Number of items per page

  showAll:boolean=false;

  constructor(
    private dafService: DAFService,
    private donationService: DonationService,
    private charityService: CharityService,
    private userStore: UserstoreService,
    private auth : AuthService,
    private translate: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId'));
    this.fetchUserName();
    this.loadCharities();
    this.fetchDAFData();
    this.fetchDonations();
    this.dataService.setData('username', this.userName);

    
  }

  get visibleCharities():Charities[]{
    return this.showAll?this.charitiesDonatedTo:this.charitiesDonatedTo.slice(0,5);
  }
  
  toggleShowAll():void{
    this.showAll=!this.showAll
  }

  fetchUserName(){
    // this.userStore.getFullName().subscribe(val => {
    //   let fullNameFromToken = this.auth.getFullNameFromToken();
    //   this.userName = val || fullNameFromToken;
    // })
    this.userName = localStorage.getItem('userName') || '';
  }

  fetchDAFData() {
    try {
      this.dafService.getDAFAccount(this.userId).subscribe({
        next: (daf) => {
          try {
            if (daf) {
              this.dafBalance = daf.dafBalance ?? 0;
              this.totalDonations = daf.totalDonated ?? 0;
              console.log(daf);
              console.log('DAF Balance:', this.dafBalance);
              this.dataService.setData('dafBalance', this.dafBalance);    
              this.dataService.setData('totalDonations', this.totalDonations);
              console.log('Data STored',this.dataService.displayData());
              
            } else {
              console.warn('DAF account data is null or undefined.');
            }
          } catch (innerError) {
            console.error('Error processing DAF account data:', innerError);
          }
        },
        error: (err) => {
          console.error('Error fetching DAF account from service:', err);
        }
      });
    } catch (outerError) {
      console.error('Unexpected error in fetchDAFData:', outerError);
    }
  }

  logout() {
    localStorage.clear();
  }

  fetchDonations() {
    try {
      if (!this.userId) {
        console.warn('User ID is not available. Cannot fetch donations.');
        return;
      }

      this.donationService.getUserDonations(this.userId).subscribe({
        next: (donations) => {
          try {
            console.log('User Donations:', donations);

            if (!Array.isArray(donations)) {
              console.warn('Donations data is not an array. Skipping processing.');
              return;
            }

            const donatedCharityIds = new Set<number>();
            donations.forEach(d => {
              try {
                if (d && d.charityId !== null && d.charityId !== undefined) {
                  donatedCharityIds.add(d.charityId);
                }
              } catch (innerError) {
                console.error('Error processing individual donation:', innerError);
              }
            });

            this.charitiesDonatedTo = Array.from(donatedCharityIds)
              .map(charityId => {
                try {
                  const charity = this.allCharities.find(c => c.charityId === charityId);
                  if (!charity) {
                    console.warn(`Charity with ID ${charityId} not found in allCharities.`);
                  }
                  return charity;
                } catch (innerError) {
                  console.error(`Error finding charity with ID ${charityId}:`, innerError);
                  return undefined;
                }
              })
              .filter((charity): charity is Charities => charity !== undefined);

            console.log('Charities Donated To:', this.charitiesDonatedTo);
            this.dataService.setData('charities', this.charitiesDonatedTo);
          } catch (error) {
            console.error('Error processing donations data:', error);
          }
        },
        error: (err) => {
          console.error('Error fetching user donations:', err);
        }
      });
    } catch (outerError) {
      console.error('Unexpected error in fetchDonations:', outerError);
    }
  }

  loadCharities() {
    this.charityService.getAllCharities().subscribe({
      next: (charities) => {
        try {
          if (!Array.isArray(charities)) {
            console.warn('Charities data is not an array. Skipping processing.');
            return;
          }

          this.allCharities = charities.filter(c => c && c.category && c.location && c.name);
          this.filteredCharities = [...this.allCharities];
          this.uniqueCategories = [...new Set(this.allCharities.map(c => c.category))];
          this.uniqueLocations = [...new Set(this.allCharities.map(c => c.location))];
        } catch (error) {
          console.error('Error processing charities data:', error);
        }
      },
      error: (err) => {
        console.error('Error loading charities:', err);
      }
    });
  }

  get paginatedCharities(): Charities[] {
    try {
      if (!Array.isArray(this.filteredCharities)) {
        console.warn('Filtered charities is not an array. Returning an empty array.');
        return [];
      }

      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;

      if (startIndex < 0 || startIndex >= this.filteredCharities.length) {
        console.warn('Start index is out of bounds. Returning an empty array.');
        return [];
      }

      return this.filteredCharities.slice(startIndex, Math.min(endIndex, this.filteredCharities.length));
    } catch (error) {
      console.error('Error in paginatedCharities getter:', error);
      return [];
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCharities.length / this.itemsPerPage);
  }

  applyFilters() {
    try {
      this.filteredCharities = this.allCharities.filter(charity => {
        try {
          return charity &&
            (!this.selectedCategory || charity.category === this.selectedCategory) &&
            (!this.selectedLocation || charity.location === this.selectedLocation) &&
            (!this.searchQuery || (charity.name && charity.name.toLowerCase().includes(this.searchQuery.toLowerCase())));
        } catch (innerError) {
          console.error('Error processing individual charity during filtering:', innerError);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in applyFilters method:', error);
      this.filteredCharities = [];
    }
  }

  filterCharities() {
    try {
      this.applyFilters();
    } catch (error) {
      console.error('Error in filterCharities method:', error);
    }
  }

  resetFilters() {
    try {
      this.selectedCategory = '';
      this.selectedLocation = '';
      this.searchQuery = '';
      this.filteredCharities = Array.isArray(this.allCharities) ? [...this.allCharities] : [];
    } catch (error) {
      console.error('Error in resetFilters method:', error);
      this.filteredCharities = [];
    }
  }
}