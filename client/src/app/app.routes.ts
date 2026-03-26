import { Routes } from '@angular/router';
import { LoginComponent } from '../login/login';
import { HomeComponent } from '../home/home';
import { ProfilePageComponent } from '../profile/profile';
import { RegisterComponent } from '../account/register/register';
import { AboutComponent } from '../about/about';
import { Decks } from '../decks/decks';
import { DeckDetailComponent } from '../decks/deck-detail/deck-detail';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'decks', component: Decks },
  { path: 'decks/:id', component: DeckDetailComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'about', component: AboutComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
