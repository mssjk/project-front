import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../shared/footer/footer.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, TranslateModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomepageComponent {
  constructor(private translate: TranslateService) {
    // Set the default language
    this.translate.setDefaultLang('en-US');
  }

  // Method to change the language dynamically
  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }
}