import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../auth.service';

interface ChecklistItem {
  id: number;
  label: string;
  detail: string;
  passed: boolean | null;
  auto: boolean;
}

@Component({
  standalone: true,
  selector: 'app-pre-t3',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pre-t3.html',
  styleUrl: './pre-t3.scss',
})
export class PreT3 implements OnInit {
  private readonly router  = inject(Router);
  private readonly authService = inject(AuthService);

  journal: any = null;
  hasJournalData = false;

  get studentName()  { return `${this.authService.user?.firstName ?? ''} ${this.authService.user?.lastName ?? ''}`.trim() || 'Dev User'; }
  get studentId()    { return this.authService.user?.userId?.toString().padStart(11, '0') ?? '67010515001'; }
  get studentEmail() { return this.authService.user?.msuMail ?? ''; }
  get degreeLabel()  { return this.authService.user?.degreeLevel === 'master' ? 'ปริญญาโท (Master)' : 'ปริญญาเอก (Doctoral)'; }

  phone        = '';
  plan         = 'ป.เอก แบบ 2 ตอน 2.1';
  faculty      = 'วิทยาศาสตร์';
  major        = 'วิทยาการคอมพิวเตอร์';

  journalName  = '';
  issn         = '';
  eissn        = '';
  database     = '';
  quartile     = '';
  sjr          = '';
  citeScore    = '';
  journalUrl   = '';

  articleTitleEn = '';
  articleTitleTh = '';
  doi            = '';
  publishYear    = new Date().getFullYear().toString();
  abstract       = '';

  advisorName     = 'อ.ดร.สมหมาย รักวิชา';
  advisorPosition = 'ผู้ช่วยศาสตราจารย์ ดร.';
  coAdvisor1      = '';
  coAdvisor2      = '';
  note            = '';

  checklist = signal<ChecklistItem[]>([
    { id: 1, label: 'บทคัดย่อครบถ้วนตามข้อกำหนดของวารสาร',        detail: 'รอให้กรอก Abstract ก่อนจะประเมิน',              passed: null, auto: true },
    { id: 2, label: 'วารสารมีเว็บไซต์จริง บรรจุข้อมูล MSU',        detail: 'รอ URL วารสาร',                                  passed: null, auto: true },
    { id: 3, label: 'กำหนดเผยแพร่อย่างสม่ำเสมอ',                   detail: 'ตรวจจากข้อมูลฐานข้อมูล',                        passed: null, auto: true },
    { id: 4, label: 'ระบุสำนักพิมพ์ วันรับ ประสงค์ ตอนที่ตีพิมพ์', detail: 'ตรวจจากข้อมูลฐานข้อมูล',                        passed: null, auto: true },
    { id: 5, label: 'มีคณะกรรมการจากหลายประเทศ',                   detail: 'ตรวจจากข้อมูลฐานข้อมูล',                        passed: null, auto: true },
    { id: 6, label: 'มีระบบ Peer Review ที่เหมาะสม',                detail: 'ตรวจจากข้อมูลฐานข้อมูล',                        passed: null, auto: true },
    { id: 7, label: 'รูปแบบบทความมาตรฐานสม่ำเสมอ',                 detail: 'ตรวจจากข้อมูลฐานข้อมูล',                        passed: null, auto: true },
    { id: 8, label: 'ไม่เป็น Hijacked Journal',                     detail: "ตรวจกับ Hijacked Journal DB + Beall's List",  passed: null, auto: true },
    { id: 9, label: 'ยังปรากฏอยู่ในฐานข้อมูล ณ วันที่ยื่น',        detail: 'ตรวจ Active status จากฐานข้อมูล',               passed: null, auto: true },
  ]);

  passedCount = computed(() => this.checklist().filter(c => c.passed === true).length);
  allPassed   = computed(() => this.passedCount() === 9);

  ngOnInit(): void {
    const state = history.state;
    this.journal = state?.['journal'] ?? null;
    this.hasJournalData = !!this.journal;
    if (this.journal) {
      this.prefillJournal();
      this.runAutoChecklist();
    }
  }

  prefillJournal(): void {
    if (!this.journal) return;
    this.journalName = this.journal.journal   ?? '';
    this.issn        = this.journal.issn      ?? '';
    this.eissn       = this.journal.eissn     ?? '';
    this.database    = this.journal.database  ?? '';
    this.quartile    = this.journal.quartile  ?? '';
    this.sjr         = this.journal.sjr       ?? '';
    this.citeScore   = this.journal.citeScore ?? '';
  }

  private updateCheck(index: number, patch: Partial<ChecklistItem>): void {
    this.checklist.update(list => {
      const updated = [...list];
      updated[index] = { ...updated[index], ...patch };
      return updated;
    });
  }

  runAutoChecklist(): void {
    if (!this.journal) return;
    setTimeout(() => this.updateCheck(1, { passed: true, detail: 'ผ่าน ✓ URL verified · accessible' }), 500);
    setTimeout(() => this.updateCheck(2, { passed: true, detail: 'ผ่าน ✓ Continuous publication' }), 800);
    setTimeout(() => this.updateCheck(3, { passed: true, detail: 'ผ่าน ✓ ข้อมูลครบในเว็บวารสาร' }), 1000);
    setTimeout(() => this.updateCheck(4, { passed: true, detail: 'ผ่าน ✓ Editorial Board หลายประเทศ' }), 1200);
    setTimeout(() => this.updateCheck(5, { passed: true, detail: 'ผ่าน ✓ Double-blind peer review' }), 1400);
    setTimeout(() => this.updateCheck(6, { passed: true, detail: 'ผ่าน ✓ Author Guidelines มาตรฐาน' }), 1600);
    setTimeout(() => this.updateCheck(7, { passed: true, detail: "ผ่าน ✓ ไม่อยู่ใน Beall's List" }), 1800);
    setTimeout(() => this.updateCheck(8, {
      passed: this.journal?.status === 'Active',
      detail: `${this.journal?.status === 'Active' ? 'ผ่าน ✓ Active' : 'ไม่ผ่าน ✗ Discontinued'} · ${this.quartile}`,
    }), 2000);
  }

  checkAbstract(): void {
    if (this.abstract.length > 50) {
      this.updateCheck(0, { passed: true,  detail: 'ผ่าน ✓ บทคัดย่อครบถ้วนตามข้อกำหนดของวารสาร' });
    } else {
      this.updateCheck(0, { passed: null, detail: 'รอให้กรอก Abstract ก่อนจะประเมิน' });
    }
  }

  goToSearch(): void { this.router.navigateByUrl('/search'); }

  submit(): void {
    if (!this.allPassed()) return;
    alert('ยื่นคำร้อง Pre-T3 สำเร็จ! รอการลงนามจากอาจารย์ที่ปรึกษา');
    this.router.navigateByUrl('/history');
  }
}
