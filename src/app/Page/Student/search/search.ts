import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../auth.service';
import { Constants } from '../../../comfig/constants';
import { ScrapeScopusRes, Data } from '../../../model/res/Scrape_Scopus_res';
import { ScrapeTCIRes, Data as TciData } from '../../../model/res/Scrape_TCI_res';

type FetchMethod = 'scraping' | 'api';
type DegreeLevel = 'doctoral' | 'master';
type ActiveDb = 'scopus' | 'tci';

interface TciJournalResult {
  journal: string;
  journalTh: string | null;
  issn: string;
  eissn: string | null;
  publisher: string;
  publisherTh: string;
  abbrev: string;
  tier: number;
  status: string;
  inactive: boolean;
  majorArea: string;
  website: string;
  issuePerVolume: string;
  passForDoctoral: boolean;
  passForMaster: boolean;
  checkDate: string;
  fromCache: boolean;
}

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
  country: string | null;
  openAccess: string | null;
  openAccessType: string | null;
  isUnwanted: boolean;
  isPredatory: boolean;
  coverageStart: string;
  coverageEnd: string;
  case: number;
  caseColor: string;
  caseLabel: string;
  bannerIcon: string;
  bannerDesc: string;
  blacklistReasons: string[];
  passForDoctoral: boolean;
  passForMaster: boolean;
  checkDate: string;
  fromCache: boolean;
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
  tciResult    = signal<TciJournalResult | null>(null);
  errorMessage = signal('');
  tciError     = signal('');
  activeDb     = signal<ActiveDb>('scopus');

  methods = [
    { id: 'scraping' as FetchMethod, icon: '', label: 'Web Scraping', sublabel: 'Browser automation', badge: 'Default', badgeColor: 'amber' },
    { id: 'api' as FetchMethod, icon: '', label: 'API (Scopus / TCI)', sublabel: 'ต้องใช้ API Key', badge: 'ต้องมี Key', badgeColor: 'red' },
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
    this.tciResult.set(null);
    this.errorMessage.set('');
    this.tciError.set('');

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
    const issn = encodeURIComponent(this.issn.trim());

    const scopusUrl = this.method === 'api'
      ? `${this.constants.API_ENDPOINT}/journal/scopus?issn=${issn}`
      : `${this.constants.API_ENDPOINT}/journal/scopus/scrape?issn=${issn}`;

    const tciUrl = this.method === 'api'
      ? `${this.constants.API_ENDPOINT}/journal/tci?issn=${issn}`
      : `${this.constants.API_ENDPOINT}/journal/tci/scrape?issn=${issn}`;

    forkJoin({
      scopus: this.http.get<ScrapeScopusRes>(scopusUrl, { headers }).pipe(catchError(() => of(null))),
      tci:    this.http.get<ScrapeTCIRes>(tciUrl, { headers }).pipe(catchError(() => of(null))),
    }).subscribe(({ scopus, tci }) => {
      if (scopus?.success && scopus.data) {
        this.result.set(this.mapResult(scopus.data as unknown as Data));
      } else {
        this.errorMessage.set('ไม่พบข้อมูลวารสารใน Scopus');
      }

      if (tci?.success && tci.data) {
        this.tciResult.set(this.mapTciResult(tci.data as unknown as TciData));
      } else {
        this.tciError.set('ไม่พบข้อมูลวารสารใน TCI');
      }

      if (!scopus?.success && tci?.success) this.activeDb.set('tci');
      else this.activeDb.set('scopus');

      this.hasSearched.set(true);
      this.isLoading.set(false);
    });
  }

  private mapResult(data: Data): JournalResult {
    const extra     = data as any;
    const quartile  = data.scopus_best_quartile ?? '';
    const isActive  = !data.scopus_discontinued;
    const isUnwanted  = false;
    const isPredatory: boolean =
      extra.is_predatory ?? extra.is_blacklisted ?? extra.predatory ?? false;

    const qEntry = data.scopus_quartile_data?.[0];
    const quartileField = qEntry?.field ?? '';
    const quartileYear  = qEntry?.year  ?? '';

    const qNum = parseInt(quartile.replace('Q', '')) || 99;
    const passForDoctoral = qNum <= 2 && isActive && !isUnwanted && !isPredatory;
    const passForMaster   = qNum <= 3 && isActive && !isUnwanted && !isPredatory;

    let caseNum    = 1;
    let caseColor  = '#1A5FAB';
    let caseLabel  = '';
    let bannerIcon = '✓';
    let bannerDesc = '';
    let blacklistReasons: string[] =
      extra.blacklist_reasons ?? extra.predatory_reasons ?? [];

    if (isPredatory) {
      caseNum   = 3;
      caseColor = '#FF0000';
      caseLabel = 'คำเตือน: วารสารนี้เป็นหนึ่งวารสารที่สากลไม่รองรับ';
      bannerIcon = '⛔';
      bannerDesc = 'วารสารนี้ถูกระบุว่าเป็น Predatory Journal ห้ามนำไปใช้ยื่นเอกสาร Pre-T3 / T3 โดยเด็ดขาด และอาจส่งผลต่อการพิจารณาการสำเร็จการศึกษา';
      if (blacklistReasons.length === 0) {
        blacklistReasons = [
          'ปรากฏใน Beall\'s List of Predatory Journals (ฉบับปรับปรุง 2025)',
          'ไม่มีกระบวนการ Peer Review ที่ถูกต้องและโปร่งใส',
          'มีพฤติกรรมเรียกเก็บค่าตีพิมพ์ (APC) โดยไม่มีมาตรฐาน',
          'ไม่ปรากฏใน Scopus, Web of Science หรือ TCI',
          'ข้อมูล Impact Factor ที่แสดงเป็นการกล่าวอ้างที่ไม่มีหลักฐาน',
        ];
      }
    } else if (isUnwanted && isActive) {
      caseNum   = 5;
      caseColor = '#C07800';
      caseLabel = 'MSU Unwanted (Scopus Active)';
      bannerIcon = '⚠️';
      bannerDesc = `วารสารนี้ได้รับการจัดอยู่ใน Scopus Quartile ${quartile} มีสถานะ Active แต่ปรากฏในรายการ MSU Unwanted Journals ไม่สามารถนำไปยื่น Pre-T3 / T3 ได้`;
    } else if (isUnwanted) {
      caseNum   = 4;
      caseColor = '#1C1C1C';
      caseLabel = 'MSU Unwanted';
      bannerIcon = '⚠️';
      bannerDesc = 'วารสารนี้ปรากฏในรายการ MSU Unwanted Journals ไม่สามารถนำไปยื่น Pre-T3 / T3 ได้';
    } else if (!isActive) {
      caseColor = '#888888';
      caseLabel = 'วารสาร Scopus หยุดตีพิมพ์แล้ว (Discontinued)';
      bannerIcon = '⚠️';
      bannerDesc = `วารสารนี้ได้รับการจัดอยู่ใน Scopus Quartile ${quartile} แต่มีสถานะ Discontinued ณ ปีปัจจุบัน ไม่สามารถนำไปยื่น Pre-T3 / T3 ได้`;
    } else if (passForDoctoral || passForMaster) {
      caseLabel  = 'พบในฐานข้อมูล Scopus — วารสารผ่านเกณฑ์';
      bannerIcon = '✓';
      bannerDesc = `วารสารนี้ได้รับการจัดอยู่ใน Scopus Quartile ${quartile} มีสถานะ Active ณ ปีปัจจุบัน และไม่ปรากฏในรายการ MSU Unwanted Journals สามารถนำไปยื่น Pre-T3 / T3 ได้`;
    } else {
      caseLabel  = 'พบในฐานข้อมูล Scopus — ไม่ผ่านเกณฑ์';
      bannerIcon = '⚠️';
      bannerDesc = `วารสารนี้ได้รับการจัดอยู่ใน Scopus Quartile ${quartile} มีสถานะ Active แต่ไม่ผ่านเกณฑ์ Quartile ที่กำหนด`;
    }

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
      country: extra.country ?? null,
      openAccess: extra.open_access ?? extra.openAccess ?? null,
      openAccessType: extra.open_access_type ?? extra.openAccessType ?? null,
      isUnwanted,
      isPredatory,
      coverageStart: data.coverage_start_year,
      coverageEnd: data.coverage_end_year,
      case: caseNum,
      caseColor,
      caseLabel,
      bannerIcon,
      bannerDesc,
      blacklistReasons,
      passForDoctoral,
      passForMaster,
      checkDate: now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
      fromCache: extra.fromCache ?? false,
    };
  }

  private mapTciResult(data: TciData): TciJournalResult {
    const tier     = data.tci_tier ?? 99;
    const inactive = data.tci_inactive ?? false;
    const passForDoctoral = tier === 1 && !inactive;
    const passForMaster   = tier <= 2 && !inactive;
    const now = new Date();
    return {
      journal:        data.journal_name,
      journalTh:      data.journal_name_th,
      issn:           data.issn,
      eissn:          data.eissn,
      publisher:      data.publisher,
      publisherTh:    data.publisher_th,
      abbrev:         data.abbrev_name,
      tier,
      status:         data.tci_status,
      inactive,
      majorArea:      data.major_area,
      website:        data.website,
      issuePerVolume: data.issue_per_volume,
      passForDoctoral,
      passForMaster,
      checkDate: now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
      fromCache: data.fromCache ?? false,
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

  formatIssn(issn: string | null): string {
    if (!issn) return '—';
    const clean = issn.replace(/[^0-9Xx]/g, '');
    return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : issn;
  }
}
