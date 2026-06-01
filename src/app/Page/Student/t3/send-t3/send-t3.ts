import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-send-t3',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './send-t3.html',
  styleUrl: './send-t3.scss',
})
export class SendT3 {
  // ── Section 1: Student info ───────────────────────
  phone = '';

  // ── Section 2: Pre-T3 selection ───────────────────
  selectedPreT3 = 'PRE-T3-2567-008';

  preT3List = [
    {
      id: 'PRE-T3-2567-008',
      submittedDate: '8 ม.ค. 67',
      approvedDate: '38 ม.ค. 67',
      title: 'Deep Learning Applications in Thai Natural Language Processing: A Comprehensive Survey',
      database: 'Scopus',
      quartile: 'Q1',
      issn: '2045-2322',
    },
    {
      id: 'PRE-T3-2560-001',
      submittedDate: '5 ม.ค. 66',
      approvedDate: '20 ม.ค. 66',
      title: 'Machine Learning for Smart Agriculture Monitoring Systems in Southeast Asia',
      database: 'Scopus',
      quartile: 'Q2',
      issn: '1234-5678',
    },
  ];

  get selectedPreT3Data() {
    return this.preT3List.find(p => p.id === this.selectedPreT3);
  }

  // ── Section 3: Article info ───────────────────────
  titleTh        = 'การประยุกต์ใช้ Deep Learning ในการประมวลผลภาษาไทย';
  doi            = '';
  volume         = '';
  journalType    = 'international';
  correspondingAuthor = 'นายสมชาย ใจดี';

  // ── Section 4: Utilization ────────────────────────
  utilization = 'social';
  utilizationRemark = '';

  // ── Section 5: Publication status ────────────────
  pubStatus = 'accepted';
  acceptedDate = '';
  publishDate  = '';

  // ── Section 6: Documents ──────────────────────────
  files: Record<string, File | null> = {
    letterOfAcceptance: null,
    fullPaperPdf:       null,
    coverIndex:         null,
    scopusProof:        null,
  };

  onFileChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.files[key] = input.files[0];
    }
  }

  getFileName(key: string): string {
    return this.files[key]?.name ?? '';
  }
}
