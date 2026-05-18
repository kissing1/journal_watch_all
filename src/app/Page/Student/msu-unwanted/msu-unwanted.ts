import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface UnwantedJournal {
  id: number;
  name: string;
  abbreviation: string;
  issn: string;
  eissn: string | null;
  publisher: string;
  category: 'bealls' | 'predatory' | 'ethics' | 'msu-policy';
  categoryLabel: string;
  reason: string;
  reasonDetail: string;
  inScopus: boolean;
  inTci: boolean;
  addedDate: string;
  addedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-msu-unwanted',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './msu-unwanted.html',
  styleUrl: './msu-unwanted.scss',
})
export class MsuUnwanted {
  searchQuery = signal('');
  activeFilter = signal('all');
  currentPage = signal(1);
  readonly itemsPerPage = 8;
  selectedJournal = signal<UnwantedJournal | null>(null);

  readonly stats = [
    { icon: '📋', value: 24, label: 'รายการใน MSU Unwanted', color: 'red' },
    { icon: '🚫', value: 18, label: 'ติดรายการที่นานาชาติไม่รองรับ', color: 'orange' },
    { icon: '📘', value: 18, label: 'อยู่ใน Scopus แต่ไม่ผ่าน', color: 'blue' },
    { icon: '🗓️', value: 3,  label: 'เพิ่มใหม่เดือนนี้', color: 'green' },
  ];

  readonly filters = [
    { id: 'all',        label: 'ทั้งหมด',      count: 24, icon: '' },
    { id: 'bealls',     label: "Beall's List", count: 12, icon: '🚫' },
    { id: 'predatory',  label: 'Predatory',    count: 6,  icon: '⚡' },
    { id: 'ethics',     label: 'จริยธรรม',     count: 2,  icon: '💜' },
    { id: 'msu-policy', label: 'MSU Policy',   count: 4,  icon: '🏛️' },
  ];

  readonly journals: UnwantedJournal[] = [
    { id: 1,  name: 'Journal of Emerging Technologies and Innovative Research', abbreviation: 'JETIR',   issn: '2349-5162', eissn: null,        publisher: 'JETIR Publications, India',              category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '15 ม.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '15 ม.ค. 2568' },
    { id: 2,  name: 'International Journal of Engineering Research and Technology', abbreviation: 'IJERT', issn: '1995-7645', eissn: '2352-4146', publisher: 'JETIR Publications, India',              category: 'msu-policy', categoryLabel: 'MSU Policy',   reason: 'MSU Policy',           reasonDetail: 'ปรากฏในรายการ ไม่ยอมรับในนานาชาติฉบับปรับปรุง 2025',         inScopus: false, inTci: false, addedDate: '15 ม.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '15 ม.ค. 2568' },
    { id: 3,  name: 'International Journal of Advanced Research',                   abbreviation: 'IJAR',  issn: '2320-5407', eissn: null,        publisher: 'IJAR, India',                           category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '15 ม.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '15 ม.ค. 2568' },
    { id: 4,  name: 'Global Journal of Computer Science and Technology',             abbreviation: 'GJCST', issn: '0975-4172', eissn: '0975-4350', publisher: 'Global Journals, USA',                  category: 'predatory',  categoryLabel: 'Predatory',   reason: 'Predatory Journal',    reasonDetail: 'ได้รับการยืนยันว่าเป็น Predatory Journal โดย COPE',          inScopus: false, inTci: false, addedDate: '20 ก.พ. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '20 ก.พ. 2568' },
    { id: 5,  name: 'International Journal of Scientific and Research Publications',  abbreviation: 'IJSRP', issn: '2250-3153', eissn: null,        publisher: 'IJSRP, India',                          category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '20 ก.พ. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '20 ก.พ. 2568' },
    { id: 6,  name: 'Asian Journal of Information Technology',                       abbreviation: 'AJIT',  issn: '1682-3915', eissn: null,        publisher: 'Medwell Journals, Pakistan',             category: 'predatory',  categoryLabel: 'Predatory',   reason: 'Predatory Journal',    reasonDetail: 'ได้รับการยืนยันว่าเป็น Predatory Journal โดย COPE',          inScopus: true,  inTci: false, addedDate: '01 มี.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '01 มี.ค. 2568' },
    { id: 7,  name: 'International Journal of Pharmacy and Pharmaceutical Sciences',  abbreviation: 'IJPPS', issn: '0975-1491', eissn: '0975-1491', publisher: 'Innovare Academic Sciences, India',      category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: true,  inTci: false, addedDate: '01 มี.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '01 มี.ค. 2568' },
    { id: 8,  name: 'Journal of Chemical and Pharmaceutical Research',               abbreviation: 'JCPR',  issn: '0975-7384', eissn: null,        publisher: 'Journal of Chemical, India',             category: 'ethics',     categoryLabel: 'จริยธรรม',   reason: 'จริยธรรมวิจัย',       reasonDetail: 'วารสารมีปัญหาด้านจริยธรรมการวิจัยและการตรวจสอบบทความ',      inScopus: true,  inTci: false, addedDate: '10 มี.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '10 มี.ค. 2568' },
    { id: 9,  name: 'Journal of Pharmaceutical Sciences and Research',               abbreviation: 'JPSR',  issn: '0975-1459', eissn: null,        publisher: 'Pelagia Research Library, India',        category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '10 มี.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '10 มี.ค. 2568' },
    { id: 10, name: 'International Journal of Research in Engineering and Technology', abbreviation: 'IJRET', issn: '2319-1163', eissn: '2321-7308', publisher: 'ESATJOURNALS, India',                  category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '15 เม.ย. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '15 เม.ย. 2568' },
    { id: 11, name: 'IOSR Journal of Engineering',                                   abbreviation: 'IOSRJEN',issn: '2250-3021', eissn: '2278-8719', publisher: 'IOSR Journals, India',                  category: 'predatory',  categoryLabel: 'Predatory',   reason: 'Predatory Journal',    reasonDetail: 'ได้รับการยืนยันว่าเป็น Predatory Journal โดย COPE',          inScopus: false, inTci: false, addedDate: '15 เม.ย. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '15 เม.ย. 2568' },
    { id: 12, name: 'World Journal of Engineering and Technology',                   abbreviation: 'WJET',  issn: '2331-4222', eissn: '2331-4249', publisher: 'Scientific Research Publishing, USA',   category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '01 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '01 พ.ค. 2568' },
    { id: 13, name: 'Journal of Engineering Research and Applications',              abbreviation: 'IJERA', issn: '2248-9622', eissn: null,        publisher: 'IJERA, India',                          category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '01 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '01 พ.ค. 2568' },
    { id: 14, name: 'International Journal of Innovative Research in Science and Technology', abbreviation: 'IJIRST', issn: '2349-6010', eissn: null, publisher: 'IJIRST, India',                category: 'predatory',  categoryLabel: 'Predatory',   reason: 'Predatory Journal',    reasonDetail: 'ได้รับการยืนยันว่าเป็น Predatory Journal โดย COPE',          inScopus: false, inTci: false, addedDate: '05 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '05 พ.ค. 2568' },
    { id: 15, name: 'International Journal of Multidisciplinary Research',           abbreviation: 'IJMR',  issn: '2231-5780', eissn: null,        publisher: 'IJMR, India',                           category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '05 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '05 พ.ค. 2568' },
    { id: 16, name: 'Global Journal of Science Frontier Research',                   abbreviation: 'GJSFR', issn: '0975-5896', eissn: '2249-4626', publisher: 'Global Journals, USA',                  category: 'msu-policy', categoryLabel: 'MSU Policy',   reason: 'MSU Policy',           reasonDetail: 'มหาวิทยาลัยมหาสารคามประกาศไม่รับรองวารสารนี้',               inScopus: false, inTci: false, addedDate: '08 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '08 พ.ค. 2568' },
    { id: 17, name: 'Indian Journal of Science and Technology',                      abbreviation: 'IJST',  issn: '0974-6846', eissn: '0974-5645', publisher: 'Indian Society for Education and Environment', category: 'bealls', categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: true,  inTci: false, addedDate: '08 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '08 พ.ค. 2568' },
    { id: 18, name: 'International Journal of Applied Engineering Research',         abbreviation: 'IJAER', issn: '0973-4562', eissn: null,        publisher: 'Research India Publications',            category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: true,  inTci: false, addedDate: '10 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '10 พ.ค. 2568' },
    { id: 19, name: 'Journal of Theoretical and Applied Information Technology',     abbreviation: 'JATIT', issn: '1992-8645', eissn: '1817-3195', publisher: 'JATIT & LLS, Malaysia',                 category: 'predatory',  categoryLabel: 'Predatory',   reason: 'Predatory Journal',    reasonDetail: 'ได้รับการยืนยันว่าเป็น Predatory Journal โดย COPE',          inScopus: true,  inTci: false, addedDate: '12 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '12 พ.ค. 2568' },
    { id: 20, name: 'International Journal of Computer Applications',                abbreviation: 'IJCA',  issn: '0975-8887', eissn: null,        publisher: 'Foundation of Computer Science, USA',   category: 'msu-policy', categoryLabel: 'MSU Policy',   reason: 'MSU Policy',           reasonDetail: 'มหาวิทยาลัยมหาสารคามประกาศไม่รับรองวารสารนี้',               inScopus: false, inTci: false, addedDate: '12 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '12 พ.ค. 2568' },
    { id: 21, name: 'Research Journal of Applied Sciences Engineering and Technology', abbreviation: 'RJASET', issn: '2040-7459', eissn: '2040-7467', publisher: 'Maxwell Scientific, Pakistan',       category: 'bealls',     categoryLabel: "Beall's List", reason: 'ไม่ยอมรับในนานาชาติ', reasonDetail: "ปรากฏในรายการ Beall's List ฉบับปรับปรุง 2025",             inScopus: false, inTci: false, addedDate: '14 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '14 พ.ค. 2568' },
    { id: 22, name: 'International Journal of Recent Technology and Engineering',    abbreviation: 'IJRTE', issn: '2277-3878', eissn: null,        publisher: 'Blue Eyes Intelligence Engineering, India', category: 'predatory', categoryLabel: 'Predatory',  reason: 'Predatory Journal',    reasonDetail: 'ได้รับการยืนยันว่าเป็น Predatory Journal โดย COPE',          inScopus: false, inTci: false, addedDate: '14 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '14 พ.ค. 2568' },
    { id: 23, name: 'Journal of Materials Science and Chemical Engineering',         abbreviation: 'MSCE',  issn: '2327-6045', eissn: '2327-6053', publisher: 'Scientific Research Publishing, USA',   category: 'ethics',     categoryLabel: 'จริยธรรม',   reason: 'จริยธรรมวิจัย',       reasonDetail: 'วารสารมีปัญหาด้านจริยธรรมการวิจัยและการตรวจสอบบทความ',      inScopus: false, inTci: false, addedDate: '15 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '15 พ.ค. 2568' },
    { id: 24, name: 'European Journal of Scientific Research',                       abbreviation: 'EJSR',  issn: '1450-216X', eissn: '1450-202X', publisher: 'EuroJournals, UK',                     category: 'msu-policy', categoryLabel: 'MSU Policy',   reason: 'MSU Policy',           reasonDetail: 'มหาวิทยาลัยมหาสารคามประกาศไม่รับรองวารสารนี้',               inScopus: false, inTci: false, addedDate: '15 พ.ค. 2568', addedBy: 'เจ้าหน้าที่บณ.', updatedDate: '15 พ.ค. 2568' },
  ];

  filteredJournals = computed(() => {
    let list = this.journals;
    const q = this.searchQuery().toLowerCase().trim();
    const f = this.activeFilter();
    if (f !== 'all') list = list.filter(j => j.category === f);
    if (q) list = list.filter(j =>
      j.name.toLowerCase().includes(q) ||
      j.issn.includes(q) ||
      (j.eissn ?? '').includes(q) ||
      j.publisher.toLowerCase().includes(q)
    );
    return list;
  });

  pagedJournals = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredJournals().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredJournals().length / this.itemsPerPage))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  setFilter(id: string) {
    this.activeFilter.set(id);
    this.currentPage.set(1);
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
  }

  openDetail(j: UnwantedJournal) { this.selectedJournal.set(j); }
  closeDetail() { this.selectedJournal.set(null); }

  categoryClass(cat: string): string {
    const map: Record<string, string> = {
      bealls: 'cat-bealls',
      predatory: 'cat-predatory',
      ethics: 'cat-ethics',
      'msu-policy': 'cat-msu',
    };
    return map[cat] ?? '';
  }
}
