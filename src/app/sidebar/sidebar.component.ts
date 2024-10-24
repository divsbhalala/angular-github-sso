import { Component, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule, MatNavList} from '@angular/material/list';
import { RouterLink, RouterModule, RouterOutlet} from '@angular/router';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatNavList,
    RouterLink,
    MatIcon,
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  // @ViewChild('#dButton') button!: MatButton;
  @ViewChild('drawer', { static: false }) drawerRef!: MatSidenav;

  isExpanded: boolean = true; // Initial state for expanded sidebar

  leftPositionButton: string = '0px';

  // Method to toggle sidebar open/close
  onToggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    // this.drawerRef.close();
  }

  openedStart(event: any){
    console.log('openedStart: ', event);
    const w = this.drawerRef._getWidth() - 40;
    this.leftPositionButton = `${w}px`;
  }

  closedStart(event: any){
    console.log('closedStart: ', event);
    this.leftPositionButton = '0px';
  }

  onPositionChanged(){
    const w = this.drawerRef._getWidth();
    this.leftPositionButton = `${w}px`;
  }
}
