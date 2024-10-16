import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GitHubUser } from '../models/github.model';
import { environment } from '../../environments/environment'; // Import the environment


@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private apiUrl = environment?.apiUrl;

  constructor(private http: HttpClient) { }

  // Get JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // Connect to GitHub (redirects to GitHub OAuth page)
  connect(): void {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${environment?.githubClientId}&scope=repo,user`;
  }

  // Get connection status
  getConnectionStatus(): Observable<GitHubUser> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<GitHubUser>(`${this.apiUrl}/status`, {headers})
      .pipe(catchError(this.handleError));
  }

  // Remove GitHub integration
  disconnect(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/disconnect`, { headers})
      .pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
  // Store the token
  storeToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }
  // Store the token
  removeToken(): void {
    localStorage.removeItem('jwtToken');
  }
}
