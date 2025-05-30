import { provideRouter, Route, Routes } from '@angular/router';
import { RegisterDafComponent } from './DAF/register-daf/register-daf.component';
import { LoginComponent } from './DAF/login/login.component';
import { DashboardComponent } from './DAF/dashboard/dashboard.component';
import { HomepageComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { AddDonationComponent } from './DAF/add-donation/add-donation.component';
import { ViewDonationComponent } from './DAF/viewdonation/viewdonation.component';
import { BLoginComponent } from './brokerage/b-login/b-login.component';
import { BDashboardComponent } from './brokerage/b-dashboard/b-dashboard.component';
import { ViewTransferComponent } from './brokerage/viewtransfer/viewtransfer.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register-daf', component: RegisterDafComponent, canActivate: [GuestGuard] },
  { path: 'home', component: HomepageComponent },
  { path: 'add-donation', component: AddDonationComponent, canActivate: [AuthGuard] },
  { path: 'view-donation', component: ViewDonationComponent, canActivate: [AuthGuard] },
  { path: 'brokerage', component: BLoginComponent, canActivate: [GuestGuard] },
  { path: 'bdashboard', component: BDashboardComponent, canActivate: [AuthGuard] },
  { path: 'viewtransfer', component: ViewTransferComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

export const appRouter = provideRouter(routes);