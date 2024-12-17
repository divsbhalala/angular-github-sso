import { NgIf } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-org-activity',
  standalone: true,
  imports: [AgGridAngular, NgIf, MatProgressSpinner, MatPaginator],
  templateUrl: './org-activity.component.html',
  styleUrl: './org-activity.component.scss',
})
export class OrgActivityComponent {
  rows = input<Array<any>>();
  columns = input<Array<any>>();
  loading = input<boolean>();
  length = input<number>(0);
  pageSize = input<number>(10);
  onGridReady = output();
  onPageChange = output<PageEvent>();

  onGridReadyStats(e: any) {
    this.onGridReady.emit(e);
  }
  _onPageChange(e: any) {
    this.onPageChange.emit(e);
  }

}
