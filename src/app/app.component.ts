import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {OAuthComponent} from './oauth/oauth.component';
import {RepositoriesComponent} from './repositories/repositories.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OAuthComponent, RepositoriesComponent, FlexLayoutModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GitHub OAuth Integration';
}
