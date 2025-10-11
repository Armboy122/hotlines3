import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

/**
 * THSarabunNew Font Setup
 *
 * IMPORTANT: เพื่อให้ภาษาไทยแสดงผลถูกต้องใน PDF คุณต้องทำตามขั้นตอนนี้:
 *
 * 1. ไปที่ jsPDF Font Converter:
 *    https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html
 *
 * 2. Upload ไฟล์ฟอนต์: public/fonts/THSarabunNew.ttf
 *
 * 3. ไม่ต้องกรอก Font Name, Style, หรือ Module Format
 *    (ให้เครื่องมือสร้างให้อัตโนมัติ)
 *
 * 4. คลิก "Create" เพื่อ download ไฟล์ JavaScript
 *
 * 5. สร้างไฟล์ใหม่: src/lib/fonts/THSarabunNew.ts
 *
 * 6. Copy เนื้อหาจากไฟล์ที่ download มาใส่ในไฟล์ที่สร้าง
 *    แล้วเพิ่ม export ด้านหน้าตัวแปร font
 *    ตัวอย่าง: export const THSarabunNew = "AAEAAAASAQAABAAgRkZUTF6..."
 *
 * 7. Import font ในไฟล์นี้:
 *    import { THSarabunNew } from './fonts/THSarabunNew';
 *
 * 8. Uncomment โค้ดใน setupThaiFont() function ด้านล่าง
 *
 * หมายเหตุ: ไฟล์ font ที่แปลงแล้วจะมีขนาดประมาณ 130KB (base64 string)
 */

export interface TaskReportData {
  id: bigint;
  workDate: Date;
  team: {
    name: string;
  };
  jobType: {
    name: string;
  };
  jobDetail: {
    name: string;
  };
  feeder?: {
    code: string;
    station?: {
      name: string;
    };
  } | null;
  numPole?: string | null;
  deviceCode?: string | null;
  detail?: string | null;
}

export interface ReportOptions {
  month: number;
  year: number;
  teamName?: string;
}

/**
 * ตั้งค่าฟอนต์ไทยสำหรับ PDF
 *
 * TODO: Uncomment โค้ดด้านล่างหลังจากที่สร้างไฟล์ font แล้ว
 */
function setupThaiFont(doc: jsPDF) {
  // STEP 1: Import font ที่ด้านบนของไฟล์
  // import { THSarabunNew } from './fonts/THSarabunNew';

  // STEP 2: Uncomment โค้ดด้านล่างนี้
  /*
  doc.addFileToVFS('THSarabunNew.ttf', THSarabunNew);
  doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
  doc.setFont('THSarabunNew');
  */

  // ชั่วคราว: ใช้ฟอนต์ default (ภาษาไทยจะแสดงเป็นกล่องสี่เหลี่ยม)
  doc.setFont('helvetica');
}

export function generateMonthlyReport(
  tasks: TaskReportData[],
  options: ReportOptions
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  setupThaiFont(doc);

  // ชื่อเดือนภาษาไทย
  const monthNamesTh = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const pageWidth = doc.internal.pageSize.getWidth();

  // หัวเรื่องหลัก - ภาษาไทย
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const title = `รายงานงานประจำเดือน ${monthNamesTh[options.month - 1]} ${options.year + 543}`;
  let textWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - textWidth) / 2, 15);

  let currentY = 23;

  // ทีมงาน (ถ้ามี)
  if (options.teamName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`ทีม: ${options.teamName}`, 15, currentY);
    currentY += 6;
  }

  // วันที่สร้างรายงาน
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const today = new Date();
  const thaiDate = today.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`วันที่พิมพ์รายงาน: ${thaiDate}`, 15, currentY);
  doc.setTextColor(0, 0, 0); // Reset to black
  currentY += 8;

  // Prepare table data
  const tableData = tasks.map((task, index) => [
    index + 1,
    new Date(task.workDate).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    task.jobType.name,
    task.jobDetail.name,
    task.feeder ? `${task.feeder.code}\n${task.feeder.station?.name || ''}` : '-',
    task.numPole || '-',
    task.deviceCode || '-',
    task.detail || '-',
  ]);

  // Generate table
  autoTable(doc, {
    startY: currentY,
    head: [[
      '#',
      'วันที่',
      'ประเภทงาน',
      'รายละเอียดงาน',
      'ฟีดเดอร์',
      'เบอร์เสา',
      'รหัสอุปกรณ์',
      'รายละเอียด',
    ]],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue-600
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // #
      1: { cellWidth: 22, halign: 'center' }, // Date
      2: { cellWidth: 32 }, // Job Type
      3: { cellWidth: 42 }, // Job Detail
      4: { cellWidth: 38 }, // Feeder
      5: { cellWidth: 18, halign: 'center' }, // Pole
      6: { cellWidth: 22, halign: 'center' }, // Device
      7: { cellWidth: 38 }, // Detail
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;

      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );

      doc.text(
        `Generated by HotlineS3 System`,
        pageWidth - 15,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY || currentY;

  if (finalY + 20 < doc.internal.pageSize.getHeight()) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`Summary / สรุป: Total ${tasks.length} tasks | งานทั้งหมด ${tasks.length} รายการ`, 15, finalY + 12);
  }

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}

export function generateAndDownloadReport(
  tasks: TaskReportData[],
  options: ReportOptions
) {
  const doc = generateMonthlyReport(tasks, options);
  const monthStr = String(options.month).padStart(2, '0');
  const filename = `WorkReport_${options.year}-${monthStr}${options.teamName ? '_' + options.teamName : ''}.pdf`;
  downloadPDF(doc, filename);
}
