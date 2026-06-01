import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth.service';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  standalone: true,
  selector: 'app-sidebar-staff',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-staff.html',
  styleUrls: ['./sidebar-staff.scss'],
})
export class SidebarStaff implements OnInit {
  @Input() isOpen = true;

  activeRoute = '';
  expandedItems = new Set<string>();
  imgError = false;

  ngOnInit(): void {
    console.log('[sidebar-staff] auth_picture in localStorage:', localStorage.getItem('auth_picture'));
  }

  onImgError(): void { this.imgError = true; }

  get userName() {
    return `${this.authService.user?.firstName ?? ''} ${this.authService.user?.lastName ?? ''}`.trim();
  }
  get userEmail()    { return this.authService.user?.msuMail ?? ''; }
  get userPicture()  { return this.authService.userPicture; }
  get userInitials() {
    const f = this.authService.user?.firstName?.[0] ?? '';
    const l = this.authService.user?.lastName?.[0] ?? '';
    return (f + l).toUpperCase();
  }

  navItems: NavItem[] = [
    { label: 'ค้นหาวารสาร',           icon: '🔍', route: '/search'              },
    { label: 'จัดการ MSU Unwanted',   icon: '🚫', route: '/msu-unwanted'        },
    {
      label: 'คำร้อง Pre-T3 / T3',
      icon: '📋',
      children: [
        { label: 'คำร้อง Pre-T3', icon: '📋', route: '/staff/pre-t3-request' },
        { label: 'คำร้อง T3',     icon: '📊', route: '/staff/t3-request'     },
        { label: 'ประวัติ',        icon: '📁', route: '/staff/history'         },
      ],
    },
    { label: 'จัดการผู้ใช้งาน', icon: '👥', route: '/staff/user-management' },
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.activeRoute = e.url;
        this.autoExpand();
      });
    this.activeRoute = this.router.url;
    this.autoExpand();
  }

  private autoExpand(): void {
    for (const item of this.navItems) {
      if (item.children?.some(c => c.route && this.activeRoute.startsWith(c.route))) {
        this.expandedItems.add(item.label);
      }
    }
  }

  toggleExpand(label: string): void {
    this.expandedItems.has(label)
      ? this.expandedItems.delete(label)
      : this.expandedItems.add(label);
  }

  isExpanded(label: string): boolean {
    return this.expandedItems.has(label);
  }

  hasActiveChild(item: NavItem): boolean {
    return item.children?.some(c => c.route && this.isActive(c.route)) ?? false;
  }

  isActive(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
