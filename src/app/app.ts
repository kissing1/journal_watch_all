import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './Components/header/header';
import { Footer } from './Components/footer/footer';
import { Sidebar } from './Components/sidebar/sidebar';
import { AuthService } from './auth.service';
import { filter } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  isLoginPage = false;
  sidebarOpen = true;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  constructor(public authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isLoginPage = e.url.includes('/login');
      });
  }
}
