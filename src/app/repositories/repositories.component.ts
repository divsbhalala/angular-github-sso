import { Component, model, OnInit, ViewChild } from '@angular/core';
import { GitHubService } from '../services/github.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi } from 'ag-grid-community';
import { NgIf } from '@angular/common'; // Import ColDef for type checking
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Organization } from '../models/organization.model';
import { MatIcon } from '@angular/material/icon';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import moment from 'moment';
import { OrgActivityComponent } from './org-activity/org-activity.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  standalone: true,
  imports: [
    AgGridAngular,
    NgIf,
    MatProgressSpinner,
    MatPaginator,
    MatFormFieldModule,
    MatSelectModule,
    MatIcon,
    MatInputModule,
    OrgActivityComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  styleUrls: ['./repositories.component.scss'],
})
export class RepositoriesComponent implements OnInit {
  organizations: Array<Organization> = [];
  commits: Array<Organization> = [];
  prs: Array<Organization> = [];
  issues: Array<Organization> = [];
  selectedOrganization: string = '';
  selectedEntity: string = '';
  search = new FormControl('');

  // Pagination settings
  pageSize: number = 10; // Default items per page
  totalItems: number = 0;
  page: number = 1;
  displayedUserStats: any[] = []; // Displayed data for the current page

  displayedColumns: string[] = ['user', 'commits', 'pullRequests', 'issues'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Define the columns with ColDef type
  columnDefs: ColDef[] = [
    { headerName: 'Id', field: 'id', flex: 1 }, // No checkbox
    { headerName: 'Name', field: 'login', flex: 1 }, // No checkbox
    {
      headerName: 'Link',
      field: 'url',
      flex: 1,
      valueGetter: (obj) =>
        obj?.data?.url
          ?.replace('api.github.com', 'github.com')
          .toLocaleString(),
    },
    {
      headerName: 'Repo Name',
      field: 'url',
      flex: 1,
      valueGetter: (obj) => obj?.data?.url?.split('/').pop().toLocaleString(),
    },
    { headerName: 'Included', field: 'included', checkboxSelection: true },
  ];

  userStats = [];
  commitsDefs: ColDef[] = [
    {
      headerName: 'Commit',
      field: 'sha',
      valueGetter: (obj) => obj?.data?.sha?.substr(0, 5),
      flex: 1,
    },
    { headerName: 'Author', field: 'commitAuthor.name', flex: 1 },
    { headerName: 'Message', field: 'message', flex: 1 },
    {
      headerName: 'Date',
      field: 'commitAuthor.date',
      valueGetter: (obj) =>
        moment(obj?.data?.commitAuthor.date).format('Do MMM, YYYY'),
      flex: 1,
    },
  ];
  prDefs: ColDef[] = [
    {
      headerName: 'Merge Commit',
      field: 'mergeCommitSha',
      valueGetter: (obj) => obj?.data?.mergeCommitSha?.substr(0, 5),
      flex: 1,
    },
    { headerName: 'Author', field: 'user.name', flex: 1 },
    { headerName: 'Title', field: 'title', flex: 1 },
    { headerName: 'Status', field: 'state', flex: 1 },
    {
      headerName: 'Merged On',
      field: 'mergedOn',
      valueGetter: (obj) => moment(obj?.data?.mergedOn).format('Do MMM, YYYY'),
      flex: 1,
    },
  ];
  issueDefs: ColDef[] = [
    { headerName: 'Title', field: 'title', flex: 1 },
    { headerName: 'Author', field: 'user.name', flex: 1 },
    { headerName: 'Status', field: 'state', flex: 1 },
    {
      headerName: 'Created On',
      field: 'createdOn',
      valueGetter: (obj) => moment(obj?.data?.createdOn).format('Do MMM, YYYY'),
      flex: 1,
    },
  ];

  // Loading states for both grids
  isLoadingOrgs: boolean = false;
  isLoadingStats: boolean = false;

  gridApiRepos!: GridApi;
  gridApiStats!: GridApi;

  constructor(
    private githubService: GitHubService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('data ===>', this.search);
    this.githubService.getOrganizations().subscribe({
      next: (data: any) => {
        this.isLoadingOrgs = false;
        this.organizations = data;
      },
      error: (error) => {
        this.isLoadingOrgs = false;
        this.showError(error?.error?.error);
      },
    });
    this.onSearch();
  }

  onSearch() {
    this.page = 1;
    this.search.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
    ).subscribe((res) => this.loadStats());
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
    this.page = event.pageIndex + 1;
    console.log(this.page, this.pageSize);
    this.loadStats();
  }

  // Update the displayedUserStats based on pagination settings
  updateDisplayedUserStats(): void {
    const startIndex = this.page * this.pageSize;
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
    // Extract the slugs from the selected rows
    this.selectedOrganization = event.value;
    this.selectedEntity = 'commits';

    // If there are selected organizations, fetch the repository data
    if (this.selectedOrganization) {
      this.isLoadingStats = true;
      this.githubService
        .getOrganizationsStats([this.selectedOrganization])
        .subscribe({
          next: (data) => {
            this.githubService
              .getOrgCommitStats(
                [this.selectedOrganization],
                this.page,
                this.pageSize,
                this.search.value!
              )
              .subscribe({
                next: (data) => {
                  this.isLoadingStats = false; // Hide loader for stats grid
                  this.commits = data.data;
                  this.totalItems = data.totalCount; // Set the total item count for pagination
                },
                error: (error) => {
                  this.isLoadingStats = false; // Hide loader for stats grid
                  this.showError(error?.error?.error);
                },
              });
          },
          error: (error) => {
            this.isLoadingStats = false; // Hide loader for stats grid
            this.showError(error?.error?.error);
          },
        });
    } else {
      // If no organizations are selected, hide the loader and clear the data
      this.isLoadingStats = false; // Hide loader for stats grid
      this.userStats = [];
    }
  }

  onEntityChange(event: any): void {
    this.isLoadingStats = true;
    this.page = 1;
    this.selectedEntity = event?.value;
    this.loadStats();
  }

  loadStats(): void {
    this.loadOrgStats()?.subscribe({
      next: (data) => {
        this.isLoadingStats = false; // Hide loader for stats grid
        this.totalItems = data.totalCount; // Set the total item count for pagination
        switch (this.selectedEntity) {
          case 'pull-requests':
            this.prs = data.data;
            return;
          case 'issues':
            this.issues = data.data;
            return;
          default:
            this.commits = data.data;
            return;
        }
      },
      error: (error) => {
        this.isLoadingStats = false; // Hide loader for stats grid
        this.showError(error?.error?.error);
      },
    });
  }

  loadOrgStats(): Observable<any> | undefined {
    switch (this.selectedEntity) {
      case 'pull-requests':
        if (!this.selectedOrganization && !this.selectedEntity) {
          return;
        }
        return this.githubService.getOrgPullRequestStats(
          [this.selectedOrganization],
          this.page,
          this.pageSize,
          this.search.value!
        );
      case 'issues':
        if (!this.selectedOrganization && !this.selectedEntity) {
          return;
        }
        return this.githubService.getOrgIssuesStats(
          [this.selectedOrganization],
          this.page,
          this.pageSize,
          this.search.value!
        );
      default:
        if (!this.selectedOrganization) {
          return;
        }
        return this.githubService.getOrgCommitStats(
          [this.selectedOrganization],
          this.page,
          this.pageSize,
          this.search.value!
        );
    }
  }
}
