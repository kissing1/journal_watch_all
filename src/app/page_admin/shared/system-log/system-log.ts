import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { Constants } from '../../../comfig/constants';
import { SystemLogsRes, Log } from '../../../model_admin/res/System_Logs_res';

type Level = 'INFO' | 'WARN' | 'ERROR';

@Component({
  selector: 'app-system-log',
  imports: [CommonModule, FormsModule],
  templateUrl: './system-log.html',
  styleUrl: './system-log.scss',
})
export class SystemLog implements OnInit {
  private http      = inject(HttpClient);
  private auth      = inject(AuthService);
  private constants = inject(Constants);

  isLoading   = signal(true);
  logs        = signal<Log[]>([]);
  loadError   = signal<string | null>(null);
  currentPage = signal(1);
  totalPages  = signal(1);
  totalItems  = signal(0);

  searchText  = signal('');
  levelFilter = signal('all');
  dateFrom    = signal('');
  dateTo      = signal('');
  detailLog   = signal<Log | null>(null);

  readonly LIMIT = 50;

  // ── Level จาก action ──────────────────────────────────────────────
  levelOf(action: string): Level {
    const a = action.toLowerCase();
    if (a.includes('error')) return 'ERROR';
    if (a.includes('failed') || a.includes('warn')) return 'WARN';
    return 'INFO';
  }

  actionLabel(action: string): string {
    const map: Record<string, string> = {
      login_success:           'Login สำเร็จ',
      login_failed:            'Login ล้มเหลว',
      login_password_verified: 'ตรวจสอบรหัสผ่านสำเร็จ',
      otp_failed:              'OTP ล้มเหลว',
    };
    return map[action] ?? action;
  }

  fullName(log: Log): string {
    return `${log.first_name} ${log.last_name}`.trim();
  }

  formatDate(d: Date | string): string {
    return new Date(d).toLocaleString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  // ── Filter (client-side ภายใน page ที่โหลด) ─────────────────────
  filteredLogs = computed(() => {
    const s    = this.searchText().toLowerCase();
    const lvl  = this.levelFilter();
    const from = this.dateFrom() ? new Date(this.dateFrom()).getTime() : 0;
    const to   = this.dateTo()   ? new Date(this.dateTo()).getTime() + 86_400_000 : Infinity;

    return this.logs().filter(l => {
      const matchSearch = !s ||
        `${l.first_name} ${l.last_name} ${l.msu_mail} ${l.action} ${l.ip_address} ${l.target_id}`
          .toLowerCase().includes(s);
      const matchLevel = lvl === 'all' || this.levelOf(l.action) === lvl;
      const ts = new Date(l.created_at).getTime();
      const matchDate = ts >= from && ts <= to;
      return matchSearch && matchLevel && matchDate;
    });
  });

  // ── Summary counts ────────────────────────────────────────────────
  infoCount  = computed(() => this.logs().filter(l => this.levelOf(l.action) === 'INFO').length);
  warnCount  = computed(() => this.logs().filter(l => this.levelOf(l.action) === 'WARN').length);
  errorCount = computed(() => this.logs().filter(l => this.levelOf(l.action) === 'ERROR').length);

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  ngOnInit() { this.loadLogs(1); }

  loadLogs(page: number) {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.currentPage.set(page);

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
    const url     = `${this.constants.API_ENDPOINT}/admin/logs?page=${page}&limit=${this.LIMIT}`;

    this.http.get<SystemLogsRes>(url, { headers }).subscribe({
      next: res => {
        if (res.success) {
          this.logs.set(res.data.logs);
          this.totalPages.set(res.data.pagination.totalPages);
          this.totalItems.set(res.data.pagination.total);
        } else {
          this.loadError.set('ไม่สามารถโหลดข้อมูลได้');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        this.isLoading.set(false);
      },
    });
  }
}
