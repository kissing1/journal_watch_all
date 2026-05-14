import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { Constants } from '../../../comfig/constants';
import { ScrapeScopusRes, Data } from '../../../model/res/Scrape_Scopus_res';

type FetchMethod = 'scraping' | 'api';
type DegreeLevel = 'doctoral' | 'master';

interface JournalResult {
  journal: string;
  issn: string;
  eissn: string | null;
  publisher: string;
  database: string;
  quartile: string;
  quartileYear: string;
  quartileField: string;
  status: string;
  sjr: number;
  citeScore: number;
  snip: number;
  percentile: number;
  hIndex: number | null;
  citesPerDoc2y: number | null;
  totalDocs: number | null;
  subjectAreaMain: string | null;
  subjectAreaSub: string | null;
  isUnwanted: boolean;
  isPredatory: boolean;
  coverageStart: string;
  coverageEnd: string;
  case: number;
  caseColor: string;
  caseLabel: string;
  passForDoctoral: boolean;
  passForMaster: boolean;
  checkDate: string;
}

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
})
export class Search {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private constants = inject(Constants);

  issn = '';
  degree: DegreeLevel = 'doctoral';
  method: FetchMethod = 'scraping';
  isLoading    = signal(false);
  hasSearched  = signal(false);
  result       = signal<JournalResult | null>(null);
  errorMessage = signal('');

  methods = [
    { id: 'scraping' as FetchMethod, icon: '🕷️', label: 'Web Scraping', sublabel: 'Browser automation', badge: 'Default', badgeColor: 'amber' },
    { id: 'api' as FetchMethod, icon: '⚡', label: 'API (Scopus / TCI)', sublabel: 'ต้องใช้ API Key', badge: 'ต้องมี Key', badgeColor: 'red' },
  ];

  methodInfo: Record<FetchMethod, string> = {
    scraping: 'Web Scraping — ดึงข้อมูลโดยตรงจากเว็บไซต์ Scopus และ TCI ผ่าน browser automation ไม่ต้องใช้ API Key แต่ใช้เวลา 3–8 วินาที',
    api: 'API — ดึงข้อมูลผ่าน Scopus API อย่างเป็นทางการ เร็วกว่า แต่ต้องมี API Key และมี Rate Limit 20,000 ครั้ง/สัปดาห์',
  };

  comparison = [
    { label: 'API Key',     scraping: 'ไม่ต้องใช้',  api: 'ต้องใช้',         scrapingOk: true,  apiOk: false },
    { label: 'ความเร็ว',   scraping: '3–8 วินาที',   api: '< 1 วินาที',      scrapingOk: false, apiOk: true  },
    { label: 'Rate Limit',  scraping: 'ไม่มี',        api: '20,000/สัปดาห์', scrapingOk: true,  apiOk: false },
    { label: 'ค่าใช้จ่าย', scraping: 'ฟรี',          api: 'ฟรี (สถาบัน)',   scrapingOk: true,  apiOk: true  },
  ];

  legends = [
    { color: '#1A5FAB', label: 'กรณีที่ 1: Scopus ผ่านเกณฑ์' },
    { color: '#1A7A42', label: 'กรณีที่ 2: TCI ผ่านเกณฑ์' },
    { color: '#7B1C1C', label: 'กรณีที่ 3: Blacklist / Predatory' },
    { color: '#7B4A1C', label: 'กรณีที่ 4: MSU Unwanted' },
    { color: '#C07800', label: 'กรณีที่ 5: MSU Unwanted (Scopus Active)' },
    { color: '#C0392B', label: 'กรณีที่ 6: ข้อมูลขัดแย้ง Scopus/TCI' },
  ];

  search(): void {
    if (!this.issn.trim()) return;
    this.isLoading.set(true);
    this.hasSearched.set(false);
    this.result.set(null);
    this.errorMessage.set('');

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
    const url = `${this.constants.API_ENDPOINT}/journal/scopus/scrape?issn=${encodeURIComponent(this.issn.trim())}`;

    this.http.get<ScrapeScopusRes>(url, { headers }).subscribe({
      next: (res) => {
        console.log('[Search] Raw API response:', res);
        if (res.success && res.data) {
          console.log('[Search] data:', res.data);
          const mapped = this.mapResult(res.data);
          console.log('[Search] mapped result:', mapped);
          this.result.set(mapped);
        } else {
          console.warn('[Search] success=false or no data:', res);
          this.errorMessage.set('ไม่พบข้อมูลวารสารในฐานข้อมูล');
        }
        this.hasSearched.set(true);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('[Search] HTTP error:', err);
        this.errorMessage.set(err?.error?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        this.hasSearched.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private mapResult(data: Data): JournalResult {
    const quartile = data.scopus_best_quartile ?? '';
    const isActive = !data.scopus_discontinued;
    const isUnwanted = false;
    const isPredatory = false;

    const qEntry = data.scopus_quartile_data?.[0];
    const quartileField = qEntry?.field ?? '';
    const quartileYear = qEntry?.year ?? '';

    const qNum = parseInt(quartile.replace('Q', '')) || 99;
    const passForDoctoral = qNum <= 2 && isActive && !isUnwanted && !isPredatory;
    const passForMaster   = qNum <= 3 && isActive && !isUnwanted && !isPredatory;

    let caseNum = 1, caseColor = '#1A5FAB', caseLabel = 'พบในฐานข้อมูล Scopus — วารสารผ่านเกณฑ์';
    if (isPredatory) {
      caseNum = 3; caseColor = '#7B1C1C'; caseLabel = 'Blacklist / Predatory';
    } else if (isUnwanted && isActive) {
      caseNum = 5; caseColor = '#C07800'; caseLabel = 'MSU Unwanted (Scopus Active)';
    } else if (isUnwanted) {
      caseNum = 4; caseColor = '#1C1C1C'; caseLabel = 'MSU Unwanted';
    } else if (!isActive) {
      caseColor = '#888888'; caseLabel = 'วารสาร Scopus หยุดตีพิมพ์แล้ว (Discontinued)';
    }

    const extra = data as any;
    const now = new Date();

    return {
      journal: data.journal_name,
      issn: data.issn,
      eissn: data.eissn,
      publisher: data.publisher,
      database: data.database_source,
      quartile,
      quartileYear,
      quartileField,
      status: isActive ? 'Active' : 'Discontinued',
      sjr: data.scopus_sjr,
      citeScore: data.scopus_citescore,
      snip: data.scopus_snip,
      percentile: data.scopus_best_percentile,
      hIndex: data.scopus_h_index,
      citesPerDoc2y: extra.scopus_cites_per_doc ?? null,
      totalDocs: extra.scopus_total_docs ?? null,
      subjectAreaMain: data.main_area,
      subjectAreaSub: data.major_area,
      isUnwanted,
      isPredatory,
      coverageStart: data.coverage_start_year,
      coverageEnd: data.coverage_end_year,
      case: caseNum,
      caseColor,
      caseLabel,
      passForDoctoral,
      passForMaster,
      checkDate: now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  }

  get passForCurrentDegree(): boolean {
    const r = this.result();
    if (!r) return false;
    return this.degree === 'doctoral' ? r.passForDoctoral : r.passForMaster;
  }

  get criteriaQuartileOk(): boolean {
    const r = this.result();
    if (!r) return false;
    const qNum = parseInt(r.quartile.replace('Q', '')) || 99;
    return this.degree === 'doctoral' ? qNum <= 2 : qNum <= 3;
  }

  get requiredQuartile(): string {
    return this.degree === 'doctoral' ? 'Q2' : 'Q3';
  }

  get degreeLabel(): string {
    return this.degree === 'doctoral' ? 'ป.เอก แผน 2 แบบ 2.1' : 'ป.โท แผน 2';
  }
}
