import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Step {
  icon: string;
  label: string;
  sub: string;
  status: 'done' | 'active' | 'pending';
  date?: string;
}

interface TimelineItem {
  icon: string;
  actor: string;
  badge: string;
  badgeType: 'system' | 'advisor' | 'waiting';
  message: string;
  detail?: string;
  time?: string;
}

interface Attachment {
  icon: string;
  name: string;
  meta: string;
  size: string;
}

@Component({
  selector: 'app-pre-t3-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pre-t3-status.html',
  styleUrl: './pre-t3-status.scss',
})
export class PreT3Status {

  request = {
    id: 'PT3-2568-001',
    studentName: 'นายสมชาย ใจดี',
    studentId: '67010515001',
    articleTitle: 'การพัฒนาระบบ AI สำหรับการตรวจสอบคุณภาพวารสารโดยใช้ Machine Learning',
    journalName: 'International Journal of Science and Research (IJSR)',
    issn: '2319-7064',
    quartile: 'Q2',
    sjr: '0.842',
    scopusStatus: 'Active',
    database: 'Scopus',
    advisor: 'ผศ.ดร.สมหมาย รักวิชา',
    submittedDate: '2 พ.ค. 68',
    overallStatus: 'กำลังดำเนินการ',
  };

  steps: Step[] = [
    { icon: '✓', label: 'ยื่นคำร้องสำเร็จ',                        sub: '2 พ.ค. 68 - 10:32',      status: 'done'    },
    { icon: '⏳', label: 'อาจารย์ที่ปรึกษาพิจารณา',                  sub: 'กำลังดำเนินการ',          status: 'active'  },
    { icon: '🏛', label: 'เจ้าหน้าที่บัณฑิตวิทยาลัยตรวจสอบ',       sub: 'รอขั้นตอนก่อนหน้า',       status: 'pending' },
    { icon: '🏛', label: 'รอผลจากที่ประชุม',                         sub: 'รอขั้นตอนก่อนหน้า',       status: 'pending' },
    { icon: '🎓', label: 'อนุมัติสำเร็จพร้อมยื่น T3',               sub: 'รอขั้นตอนก่อนหน้า',       status: 'pending' },
  ];

  timeline: TimelineItem[] = [
    {
      icon: '⚙️',
      actor: 'ระบบ Journal Watch',
      badge: 'ระบบ',
      badgeType: 'system',
      message: 'ยื่นคำร้อง PT3-2568-001 สำเร็จ',
      detail: 'วารสาร IJSR Q2 ผ่านเกณฑ์กลุ่ม ส่งต่อถึงอาจารย์ที่ปรึกษาแล้ว',
      time: '2 พ.ค. 2568 - 10:32',
    },
    {
      icon: '👨‍🏫',
      actor: 'ผศ.ดร.สมหมาย รักวิชา',
      badge: 'อาจารย์',
      badgeType: 'advisor',
      message: 'กำลังพิจารณาคำร้อง Pre-T3',
      detail: 'ระบบแจ้งเตือนทาง MSU Mail แล้ว',
      time: '2 พ.ค. 2568 - 10:35',
    },
    {
      icon: '🏛',
      actor: 'เจ้าหน้าที่บัณฑิตวิทยาลัย',
      badge: 'รออยู่',
      badgeType: 'waiting',
      message: 'รอการอนุมัติจากอาจารย์ที่ปรึกษาก่อน',
    },
    {
      icon: '🏛',
      actor: 'ที่ประชุมบัณฑิตวิทยาลัย',
      badge: 'รออยู่',
      badgeType: 'waiting',
      message: 'รอขั้นตอนก่อนหน้า',
    },
    {
      icon: '🎓',
      actor: 'อนุมัติสำเร็จ',
      badge: 'รออยู่',
      badgeType: 'waiting',
      message: 'ขั้นตอนนี้ยังไม่ดำเนินการ',
    },
  ];

  attachments: Attachment[] = [
    {
      icon: '📄',
      name: 'แบบฟอร์ม Pre-T3 (PT3-2568-001).pdf',
      meta: 'สร้างเมื่อ: 2 พ.ค. 2568',
      size: '124 KB',
    },
    {
      icon: '📊',
      name: 'ผลการตรวจสอบวารสาร IJSR Q2.pdf',
      meta: 'Scopus Metrics - SJR 0.842',
      size: '86 KB',
    },
  ];
}
