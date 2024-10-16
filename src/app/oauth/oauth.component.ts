
import { Component, OnInit } from '@angular/core';
import { GitHubService } from '../services/github.service';
import { GitHubUser } from '../models/github.model';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  standalone: true,
  styleUrls: ['./oauth.component.scss'],
  imports: [
    MatButtonModule, MatIconModule, CommonModule, MatExpansionModule],  // Add CommonModule here
})
export class OAuthComponent implements OnInit {
  isConnected: boolean = false;
  connectedUser: GitHubUser | null = null;
  errorMessage: string = '';
  lastSyncedDate: string = '2023-10-07 15:11 PM'; // Example date
  syncType: string = 'full'; // Sync type (example)

  constructor(
    private githubService: GitHubService,
    private route: ActivatedRoute,
    private router: Router // Inject Router here
  ) {}


  ngOnInit(): void {

    // Extract token from the URL (if present)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.githubService.storeToken(token);  // Store token in localStorage
        this.router.navigate(['/']);
      }
    });

    // Get token from localStorage
    const token = this.githubService.getToken();

    if(token){
      // Check if the user is already connected
      this.githubService.getConnectionStatus().subscribe({
        next: (user: GitHubUser) => {
          if (user?.connected) {
            this.isConnected = true;
            this.connectedUser = user;
          }
        },
        error: (error) => {
          this.errorMessage = error;
        }
      });
    }

  }

  // Trigger GitHub OAuth process
  connect(): void {
    this.githubService.connect();
  }

  // Disconnect GitHub integration
  disconnect(): void {
    if (this.connectedUser) {
      this.githubService.disconnect().subscribe({
        next: () => {
          this.isConnected = false;
          this.connectedUser = null;
          this.githubService.removeToken();
          // Redirect the user to the home page (or any route you want)
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.errorMessage = error;
        }
      });
    }
  }
}
