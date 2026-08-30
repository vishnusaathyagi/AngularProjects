/* Developer note: Root app component hosting global shell, RBAC role switcher, 
   and dynamic notification feedback banner. */
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  currentRole: UserRole = 'Admin';

  // Notification Banner State
  notificationMessage: string | null = null;
  notificationType: 'success' | 'info' | 'warning' = 'info';
  private notificationTimeout: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to current active role state from AuthService
    this.authService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }

  /**
   * Handles user role selection changes, updates AuthService session, 
   * and triggers visual notification feedback.
   */
  onRoleChange(event: Event): void {
    const selectedRole = (event.target as HTMLSelectElement).value as UserRole;
    const previousRole = this.currentRole;

    // Persist new role into AuthService & LocalStorage
    this.authService.setRole(selectedRole);

    // Formulate dynamic status message based on selected permission level
    let permissionInfo = '';
    switch (selectedRole) {
      case 'Admin':
        permissionInfo = 'Full Access granted (Create, Edit, Delete & View Submissions).';
        this.notificationType = 'success';
        break;
      case 'Manager':
        permissionInfo = 'Manager Access granted (Create forms & View Submissions).';
        this.notificationType = 'info';
        break;
      case 'User':
        permissionInfo = 'Restricted Access (View and Submit Forms only).';
        this.notificationType = 'warning';
        break;
    }

    // Display temporary success/status notification
    this.showNotification(`Active Role switched from ${previousRole} to ${selectedRole}. ${permissionInfo}`);
  }

  /**
   * Helper function to show notification banner with auto-dismiss timeout
   */
  private showNotification(message: string): void {
    this.notificationMessage = message;

    // Clear previous timeout if user switches quickly
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Auto-hide notification after 4 seconds
    this.notificationTimeout = setTimeout(() => {
      this.notificationMessage = null;
    }, 4000);
  }

  /**
   * Manual dismiss handler for notification banner
   */
  dismissNotification(): void {
    this.notificationMessage = null;
  }
}