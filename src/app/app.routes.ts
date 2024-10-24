import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OAuthComponent } from './oauth/oauth.component';

export const routes: Routes = [
  { path: '', component: OAuthComponent },
  { path: 'success', component: OAuthComponent },
  { path: 'error', component: OAuthComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
