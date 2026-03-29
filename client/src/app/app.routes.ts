import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login';
import { HomeComponent } from '../features/home/home';
import { ProfilePageComponent } from '../features/profile/profile';
import { RegisterComponent } from '../features/auth/register/register';
import { AboutComponent } from '../features/about/about';
import { Decks } from '../features/decks/decks';
import { DeckDetailComponent } from '../features/decks/deck-detail/deck-detail';
import { rootGuard } from '../core/guards/root.guard';
import { authGuard } from '../core/guards/auth.guard';
import { NotFoundComponent } from '../shared/errors/not-found/not-found';
import { ServerErrorComponent } from '../shared/errors/server-error/server-error';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: '', component: LoginComponent, canActivate: [rootGuard], pathMatch: 'full' },

  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'decks', component: Decks },
      { path: 'decks/:id', component: DeckDetailComponent },
      { path: 'about', component: AboutComponent },
      { path: 'profile', component: ProfilePageComponent },
    ]
  },

  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];