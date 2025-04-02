import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() toggle = new EventEmitter<boolean>();

  isCollapsed = false;
  activeItem = '';
  isMobile = false;
  sidebarVisible = false;

  constructor(private router: Router) {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarVisible = !this.sidebarVisible;
    } else {
      this.isCollapsed = !this.isCollapsed;
      this.toggle.emit(this.isCollapsed); 
    }
  }

  setActiveAndNavigate(item: string, route: string) {
    this.activeItem = item;
    if (this.isMobile) {
      this.sidebarVisible = false;
    }
    this.router.navigate(['/admin', route]);
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 992;
    if (!this.isMobile) {
      this.sidebarVisible = true;
    }
  }

  logout() {
    this.router.navigate(['/']);
  }
}
