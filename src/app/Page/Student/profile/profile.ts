import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  constructor(private authService: AuthService) {}

  get user()        { return this.authService.user; }
  get userName()    { return `${this.user?.firstName ?? ''} ${this.user?.lastName ?? ''}`.trim(); }
  get userEmail()   { return this.user?.msuMail ?? ''; }
  get userRole()    { return this.user?.role ?? ''; }
  get userId()      { return this.user?.userId ?? ''; }
  get userPicture() { return this.authService.userPicture; }
  get userInitial() { return (this.user?.firstName?.[0] ?? '').toUpperCase(); }

  infoItems = [
    { icon: '🪪', label: 'รหัสนิสิต',       key: 'userId'    },
    { icon: '✉️', label: 'MSU Mail',         key: 'msuMail'   },
    { icon: '🔑', label: 'วิธีเข้าสู่ระบบ', key: 'authMethod'},
  ];

  get studentId(): string {
    return this.userEmail.split('@')[0] || String(this.userId);
  }

  getInfoValue(key: string): string {
    if (key === 'userId')     return this.studentId;
    if (key === 'msuMail')    return this.userEmail;
    if (key === 'authMethod') return 'Google OAuth 2.0 (MSU SSO)';
    return '-';
  }

  stats = [
    { value: 0, label: 'ค้นหา',     color: '#1A7A42' },
    { value: 0, label: 'Pre-T3',    color: '#C07800'  },
    { value: 0, label: 'บันทึกไว้', color: '#1A5FAB'  },
  ];
}
