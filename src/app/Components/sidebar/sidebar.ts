import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth.service';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class Sidebar {
  activeRoute = '';

  get userName()    { return `${this.authService.user?.firstName ?? ''} ${this.authService.user?.lastName ?? ''}`.trim(); }
  get userEmail()   { return this.authService.user?.msuMail ?? ''; }
  get userRole()    { return this.authService.user?.role ?? ''; }
  get userPicture()  { return this.authService.userPicture; }
  get userInitials() {
    const f = this.authService.user?.firstName?.[0] ?? '';
    const l = this.authService.user?.lastName?.[0] ?? '';
    return (f + l).toUpperCase();
  }

  

  navGroups: NavGroup[] = [
    {
      group: 'เมนูหลัก',
      items: [
        { label: 'Dashboard',            icon: '🏠', route: '/dashboard'    },
        { label: 'ค้นหาวารสาร',           icon: '🔍', route: '/search'       },
        { label: 'ตรวจสอบ MSU Unwanted', icon: '🚫', route: '/msu-unwanted' },
      ],
    },
    {
      group: 'การยื่นเรื่อง',
      items: [
        { label: 'ยื่น Pre-T3', icon: '📋', route: '/pre-t3' },
        { label: 'ยื่น T3',     icon: '🎓', route: '/t3'     },
      ],
    },
    {
      group: 'การจัดการ',
      items: [
        { label: 'ร้องขออาจารย์ที่ปรึกษา', icon: '🤝', route: '/request-advisor' },
        { label: 'ประวัติทั้งหมด',          icon: '📁', route: '/history'         },
      ],
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.activeRoute = e.url);

    this.activeRoute = this.router.url;
  }

  @Input() isOpen = true;

  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
