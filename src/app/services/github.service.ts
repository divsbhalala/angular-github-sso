import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GitHubUser } from '../models/github.model';
import { environment } from '../../environments/environment'; // Import the environment

@Injectable({
  providedIn: 'root',
})
export class GitHubService {
  private apiUrl = environment?.apiUrl;

  constructor(private http: HttpClient) {}

  // Get JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // Common function to set headers
  private setHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`, // Send token as Bearer token
    });
  }

  // Connect to GitHub (redirects to GitHub OAuth page)
  connect(): void {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${environment?.githubClientId}&scope=repo,user`;
  }

  // Get connection status
  getConnectionStatus(): Observable<GitHubUser> {
    const headers = this.setHeaders();
    return this.http
      .get<GitHubUser>(`${this.apiUrl}/status`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Fetch organizations for authenticated user
  getOrganizations(): Observable<any> {
    const headers = this.setHeaders();

    return this.http.get(`${this.apiUrl}/organizations`, { headers });
  }
  // Fetch organizations for authenticated user
  getOrganizationsStats(orgIds: string[]): Observable<any> {
    const headers = this.setHeaders();

    return this.http.post(`${this.apiUrl}/orgs-stats`, { orgIds }, { headers });
  }

  getOrgCommitStats(orgIds: string[], page: number = 1, pageSize: number = 10, search: string): Observable<any> {
    const headers = this.setHeaders();

    return this.http.get(`${this.apiUrl}/commit?orgIds=${orgIds}&page=${page}&pageSize=${pageSize}&search=${search}`, { headers });
  }
  
  getOrgIssuesStats(orgIds: string[], page: number = 1, pageSize: number = 10, search: string): Observable<any> {
    const headers = this.setHeaders();

    return this.http.get(`${this.apiUrl}/issue?orgIds=${orgIds}&page=${page}&pageSize=${pageSize}&search=${search}`, { headers });
  }

  getOrgPullRequestStats(orgIds: string[], page: number = 1, pageSize: number = 10, search: string): Observable<any> {
    const headers = this.setHeaders();

    return this.http.get(`${this.apiUrl}/pull-request?orgIds=${orgIds}&page=${page}&pageSize=${pageSize}&search=${search}`, { headers });
  }

  // Fetch repos for an organization
  getRepos(org: string): Observable<any> {
    const headers = this.setHeaders();
    return this.http.get(`${this.apiUrl}/repos/${org}`, { headers });
  }

  // Fetch repo data (commits, PRs, issues)
  getRepoData(owner: string, repo: string): Observable<any> {
    const headers = this.setHeaders();
    return this.http.get(`${this.apiUrl}/repo-data/${owner}/${repo}`, {
      headers,
    });
  }

  // Remove GitHub integration
  disconnect(): Observable<any> {
    const headers = this.setHeaders();
    return this.http
      .delete(`${this.apiUrl}/disconnect`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Method to get issue changelogs for a repository
  getIssueChangelogs(owner: string, repo: string): Observable<any> {
    const url = `${this.apiUrl}/repo-data/${owner}/${repo}/issues/changelog`;
    return this.http.get<any>(url);
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
