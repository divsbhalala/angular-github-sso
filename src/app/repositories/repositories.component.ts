import { Component, OnInit } from '@angular/core';
import { GitHubService } from '../services/github.service';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef, GridApi} from 'ag-grid-community';
import {NgIf} from '@angular/common';  // Import ColDef for type checking
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  standalone: true,
  imports: [
    AgGridAngular,
    NgIf,
    MatProgressSpinner,
    MatButton,
  ],
  styleUrls: ['./repositories.component.scss']
})
export class RepositoriesComponent implements OnInit {
  organizations = [];
  selectedRepo: string[] = []
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
    { headerName: 'Total Issues', field: 'totalIssues', flex: 1 }
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
