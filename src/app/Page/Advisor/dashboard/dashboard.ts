import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { Constants } from '../../../comfig/constants';

interface PendingRequest {
  id: string;
  studentName: string;
  studentId: string;
  journalName: string;
  database: string;
  quartile: string;
  submittedDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private auth      = inject(AuthService);
  private router    = inject(Router);
  private http      = inject(HttpClient);
  private constants = inject(Constants);

  advisorName  = '';
  advisorEmail = '';
  today        = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  stats = { pending: 0, approved: 0, rejected: 0, students: 0 };

  pendingRequests: PendingRequest[] = [];

  ngOnInit(): void {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });

    this.http
      .get<any>(`${this.constants.API_ENDPOINT}/user/profile`, { headers })
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        if (!res?.success) return;
        const d = res.data;
        this.advisorName  = `${d.prefix ?? ''} ${d.firstName} ${d.lastName}`.trim();
        this.advisorEmail = d.msuMail ?? '';
      });

    this.http
      .get<any>(`${this.constants.API_ENDPOINT}/advisor/dashboard`, { headers })
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        if (!res?.success) return;
        this.stats           = res.data.stats ?? this.stats;
        this.pendingRequests = res.data.pendingRequests ?? [];
      });
  }

  reviewRequest(id: string): void {
    this.router.navigate(['/advisor/pre-t3-review', id]);
  }
}
