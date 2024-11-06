import { Component, OnInit, ViewChild } from '@angular/core';
import { GitHubService } from '../services/github.service';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef, GridApi} from 'ag-grid-community';
import {NgIf} from '@angular/common';  // Import ColDef for type checking
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  standalone: true,
  imports: [
    AgGridAngular,
    NgIf,
    MatProgressSpinner,
    MatButton,
    MatPaginator,
  ],
  styleUrls: ['./repositories.component.scss']
})
export class RepositoriesComponent implements OnInit {
  organizations = [];
  selectedRepo: string[] = []

  // Pagination settings
  pageSize: number = 10; // Default items per page
  totalItems: number = 0;
  currentPage: number = 0;
  displayedUserStats: any[] = []; // Displayed data for the current page

  displayedColumns: string[] = ['user', 'commits', 'pullRequests', 'issues'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Define the columns with ColDef type
  columnDefs: ColDef[] = [
    { headerName: 'Id', field: 'id', flex: 1 },  // No checkbox
    { headerName: 'Name', field: 'login', flex: 1 },  // No checkbox
    { headerName: 'Link', field: 'url', flex: 1, valueGetter: obj => obj?.data?.url?.replace("api.github.com", "github.com").toLocaleString() },
    { headerName: 'Repo Name', field: 'url', flex: 1, valueGetter: obj => obj?.data?.url?.split('/').pop().toLocaleString() },
    { headerName: 'Included', field: 'included', checkboxSelection: true }
  ];

  userStats = [];
  stateColumnDefs: ColDef[] = [
    { headerName: 'UserID', field: 'userId', flex: 1},
    { headerName: 'User', field: 'user', flex: 1},
    { headerName: 'Total Commits', field: 'totalCommits', flex: 1 },
    { headerName: 'Total Pull Requests', field: 'totalPRs', flex: 1 },
    { headerName: 'Total Issues', field: 'totalIssues', flex: 1 },
    { headerName: 'Issues Changelogs', field: 'changelogs', flex: 1 }
  ];

  // Loading states for both grids
  isLoadingOrgs: boolean = false;
  isLoadingStats: boolean = false;

  gridApiRepos!: GridApi;
  gridApiStats!: GridApi;


  constructor(private githubService: GitHubService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.githubService.getOrganizations().subscribe({
      next: (data: any) => {
        this.gridApiRepos.hideOverlay();
        this.isLoadingOrgs = false;
        this.organizations = data;
      },
      error: (error) => {
        this.gridApiRepos.hideOverlay();
        this.isLoadingOrgs = false;
        this.showError(error?.error?.error);
      }
    });
  }

  showError(error?: string): void {
    this.snackBar.open(error || 'An error has occurred!', 'Close');
  }
  onGridReadyStats(params: any): void {
    this.gridApiStats = params.api;
    this.isLoadingStats = true;
  }
  onGridReadyRepos(params: any): void {
    this.gridApiRepos = params.api;

    // Set loading state for repos grid
    this.isLoadingOrgs = true;

  }
  // Called when page changes in the paginator
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updateDisplayedUserStats();
  }

  // Update the displayedUserStats based on pagination settings
  updateDisplayedUserStats(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedUserStats = this.userStats.slice(startIndex, endIndex);
  }




  /**
   * This method is called when the selection changes in the first grid.
   * It hides the loader for the second grid and fetches the repository data
   * for the selected organizations.
   * If no organizations are selected, it hides the loader and clears the data.
   * @param event The selection changed event
   */
  selectionChanged(event: any): void {
    // Get the selected rows
    const rows = event.api.getSelectedRows();

    // Extract the slugs from the selected rows
    const slugs = rows.map((r: { login: string; }) => r.login);
    this.selectedRepo = slugs;

    // If there are selected organizations, fetch the repository data
    if (slugs.length > 0) {
      this.isLoadingStats = true;
      this.githubService.getOrganizationsStats(this.selectedRepo)
        .subscribe({
          next: data => {
            this.isLoadingStats = false; // Hide loader for stats grid
            this.userStats = data;
            this.totalItems = this.userStats.length; // Set the total item count for pagination
            this.updateDisplayedUserStats(); // Update displayed data for the first page
          },
          error: (error) => {
            this.isLoadingStats = false; // Hide loader for stats grid
            this.showError(error?.error?.error);
          }
        });
    } else {
      // If no organizations are selected, hide the loader and clear the data
      this.isLoadingStats = false; // Hide loader for stats grid
      this.userStats = [];
    }
  }
}
