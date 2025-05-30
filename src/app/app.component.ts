import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet ,CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  showNavbar :boolean=false;
  title = 'myapp';
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        console.log('Navigated to:', currentUrl);
        if (currentUrl === '/dashboard') {
          this.showSplashScreen();
        }
      }
    });
  }

  showSplashScreen(): void {
    console.log('Showing splash screen');
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      splashScreen.style.display = 'flex';
      setTimeout(() => {
        splashScreen.style.display = 'none';
        console.log('Hiding splash screen');
      }, 1400);
    }
  }
}