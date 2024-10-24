import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import {SidebarComponent} from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FlexLayoutModule,
    SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GitHub OAuth Integration';
}
