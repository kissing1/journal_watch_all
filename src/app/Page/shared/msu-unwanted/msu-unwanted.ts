import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { Constants } from '../../../comfig/constants';
import { MSUUnwantedRes, Journal } from '../../../model/res/MSU_Unwanted_res';

@Component({
  selector: 'app-msu-unwanted',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './msu-unwanted.html',
  styleUrl: './msu-unwanted.scss',
})
export class MsuUnwanted implements OnInit {
  private http      = inject(HttpClient);
  private auth      = inject(AuthService);
  private constants = inject(Constants);

  isLoading       = signal(true);
  errorMessage    = signal('');
  journals        = signal<Journal[]>([]);
  totalItems      = signal(0);
  totalPagesCount = signal(1);

  searchQuery = signal('');
  currentPage = signal(1);
  readonly itemsPerPage = 10;

  selectedJournal = signal<Journal | null>(null);

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPagesCount() }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
    let params = new HttpParams()
      .set('page',  String(this.currentPage()))
      .set('limit', String(this.itemsPerPage));

    const q = this.normalizeSearch(this.searchQuery().trim());
    if (q) params = params.set('search', q);

    this.http
      .get<MSUUnwantedRes>(`${this.constants.API_ENDPOINT}/unwanted-journals`, { headers, params })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.journals.set(res.data.journals);
            this.totalItems.set(res.data.pagination.total);
            this.totalPagesCount.set(res.data.pagination.totalPages);
          } else {
            this.errorMessage.set('ไม่สามารถโหลดข้อมูลได้');
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
          this.isLoading.set(false);
        },
      });
  }

  search(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  refresh(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPagesCount()) return;
    this.currentPage.set(p);
    this.loadData();
  }

  openDetail(j: Journal): void { this.selectedJournal.set(j); }
  closeDetail(): void          { this.selectedJournal.set(null); }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '—';
    return new Date(date as string).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  private normalizeSearch(q: string): string {
    const digits = q.replace(/-/g, '');
    if (/^\d{8}$/.test(digits)) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return q;
  }

  addedBy(j: Journal): string {
    const name = `${j.first_name ?? ''} ${j.last_name ?? ''}`.trim();
    return name || j.msu_mail || '—';
  }
}
