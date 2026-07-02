import { Component, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './Components/header/header';
import { Header as HeaderAdmin } from './Components/header_admin/header';
import { Footer } from './Components/footer/footer';
import { Sidebar } from './Components/sidebar_user/sidebar';
import { Sidebar as SidebarAdmin } from './Components/sidebar_admin/sidebar';
import { SidebarAdvisor } from './Components/sidebar-advisor/sidebar-advisor';
import { SidebarStaff } from './Components/sidebar-staff/sidebar-staff';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, Header, HeaderAdmin, Footer, Sidebar, SidebarAdmin, SidebarAdvisor, SidebarStaff, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  sidebarOpen = true;

  get isLoginPage(): boolean {
    const url = this.router.url;
    return url === '/' || url === ''
      || url.startsWith('/login')
      || url.startsWith('/register');
  }

  get isAdmin(): boolean {
    try {
      const role = JSON.parse(localStorage.getItem('user') ?? '{}')?.role;
      return role === 'Admin' || role === 'SuperAdmin';
    } catch { return false; }
  }

  get isAdvisor(): boolean {
    return this.authService.user?.role?.toLowerCase() === 'supervisor';
  }

  get isStaff(): boolean {
    return this.authService.user?.role?.toLowerCase() === 'staff';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  constructor(public authService: AuthService, private router: Router) {}

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.altKey && event.shiftKey && event.code === 'KeyL' && !this.authService.isLoggedIn) {
      event.preventDefault();
      this.router.navigate(['/login-admin']);
    }
  }
}
