import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { HomePageComponent } from './features/home-page/home-page';
import { ProfilePageComponent } from './features/profile/profile';
import { ExplorePageComponent } from './features/explore/explore';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'home', component: HomePageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'explore', component: ExplorePageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];