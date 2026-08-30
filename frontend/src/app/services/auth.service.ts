import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'Admin' | 'Manager' | 'User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentRoleSubject = new BehaviorSubject<UserRole>(
    (localStorage.getItem('user_role') as UserRole) || 'Admin'
  );

  public currentRole$: Observable<UserRole> = this.currentRoleSubject.asObservable();

  setRole(role: UserRole): void {
    localStorage.setItem('user_role', role);
    this.currentRoleSubject.next(role);
  }

  getRole(): UserRole {
    return this.currentRoleSubject.value;
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(this.getRole());
  }
}