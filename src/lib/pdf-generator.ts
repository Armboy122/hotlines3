import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { THSarabunNew } from './fonts/THSarabunNew';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

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
 */
function setupThaiFont(doc: jsPDF) {
  // เพิ่มฟอนต์ไทย THSarabunNew เข้า PDF
  doc.addFileToVFS('THSarabunNew.ttf', THSarabunNew);
  doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
  doc.setFont('THSarabunNew');
}

export function generateMonthlyReport(
  tasks: TaskReportData[],
  options: ReportOptions
) {
  // กรองและเรียงลำดับข้อมูล
  const filteredTasks = tasks
    .filter((task) => {
      const taskDate = new Date(task.workDate);
      return (
        taskDate.getMonth() + 1 === options.month &&
        taskDate.getFullYear() === options.year
      );
    })
    .sort((a, b) => {
      // เรียงจากวันที่น้อยไปมาก
      return new Date(a.workDate).getTime() - new Date(b.workDate).getTime();
    });

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
  doc.setFont('THSarabunNew', 'normal');
  doc.setFontSize(22);
  const title = `รายงานงานประจำเดือน ${monthNamesTh[options.month - 1]} ${options.year + 543}`;
  const textWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - textWidth) / 2, 15);

  let currentY = 23;

  // ทีมงาน (ถ้ามี)
  if (options.teamName) {
    doc.setFontSize(16);
    doc.setFont('THSarabunNew', 'normal');
    doc.text(`ฮอทไลน์ ${options.teamName}`, 15, currentY);
    currentY += 6;
  }

  // Prepare table data
  const tableData = filteredTasks.map((task, index) => [
    index + 1,
    new Date(task.workDate).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    task.jobDetail.name,
    task.feeder?.code || '-',
    task.numPole || '-',
    task.deviceCode || '-',
    task.detail || '-',
  ]);

  // สร้างตาราง
  autoTable(doc, {
    startY: currentY,
    tableWidth: 'auto', // ปรับความกว้างตารางอัตโนมัติ
    head: [[
      '#',
      'วันที่',
      'รายละเอียดงาน',
      'ฟีดเดอร์',
      'เบอร์เสา',
      'รหัสอุปกรณ์',
      'เพิ่มเติม',
    ]],
    body: tableData,
    styles: {
      font: 'THSarabunNew',
      fontSize: 8, // ขนาดฟอนต์
      cellPadding: 4, // padding ทุกด้าน
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      overflow: 'linebreak', // ตัดบรรทัดอัตโนมัติเมื่อยาวเกินความกว้างคอลัมน์
      cellWidth: 'wrap', // ปรับความกว้างตามเนื้อหา
      minCellHeight: 10, // ความสูงขั้นต่ำ
      valign: 'top', // จัดชิดด้านบน
    },
    headStyles: {
      fillColor: [37, 99, 235], // สีน้ำเงิน (blue-600)
      textColor: 255,
      fontStyle: 'normal', // THSarabunNew ไม่มี bold
      halign: 'center',
      valign: 'middle',
      fontSize: 12, // ขนาดใหญ่ขึ้นสำหรับ header
      minCellHeight: 10,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', valign: 'middle' }, // #
      1: { cellWidth: 25, halign: 'center', valign: 'middle' }, // วันที่
      2: { cellWidth: 75, overflow: 'linebreak' }, // รายละเอียดงาน - ตัดบรรทัดเมื่อยาวเกิน 50mm
      3: { cellWidth: 25, halign: 'center', valign: 'middle' }, // ฟีดเดอร์
      4: { cellWidth: 25, halign: 'center', valign: 'middle' }, // เบอร์เสา
      5: { cellWidth: 30, halign: 'center', valign: 'middle' }, // รหัสอุปกรณ์
      6: { cellWidth: 75, overflow: 'linebreak' }, // เพิ่มเติม - ตัดบรรทัดเมื่อยาวเกิน 50mm
    },
    margin: { left: 10, right: 10 },
    didDrawPage: () => {
      // Footer ทุกหน้า
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);

      // หมายเลขหน้า
      doc.text(
        `หน้า ${currentPage} จาก ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );

      // ระบบที่สร้าง
      doc.text(
        `สร้างโดยระบบ HotlineS3`,
        pageWidth - 15,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );

      doc.setTextColor(0, 0, 0); // Reset สีเป็นดำ
    },
  });

  // สรุปรายงาน
  const finalY = (doc as any).lastAutoTable.finalY || currentY;

  if (finalY + 20 < doc.internal.pageSize.getHeight()) {
    doc.setFontSize(10);
    doc.setFont('THSarabunNew', 'normal');
    doc.setTextColor(37, 99, 235);
    doc.text(`สรุป: งานทั้งหมด ${filteredTasks.length} รายการ`, 15, finalY + 12);
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
