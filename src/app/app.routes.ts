import { Routes } from '@angular/router';
import { OAuthComponent } from './oauth/oauth.component';

export const routes: Routes = [
  { path: '', component: OAuthComponent },
  { path: 'success', component: OAuthComponent },
  { path: 'error', component: OAuthComponent }
];
