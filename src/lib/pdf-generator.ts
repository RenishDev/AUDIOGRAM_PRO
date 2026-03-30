// Dynamic import to avoid SSR issues with canvg dependency
let jsPDF: any = null;
import('jspdf').then(m => { jsPDF = m.default; }).catch(() => {});

import html2canvas from 'html2canvas';

export interface TemplateElement {
  id: string;
  type: 'title' | 'patient-info' | 'chart' | 'thresholds' | 'date' | 'notes' | 'logo' | 'text';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
}

export interface PDFTemplate {
  id: string;
  name: string;
  elements: TemplateElement[];
  pageWidth: number;
  pageHeight: number;
  isDefault: boolean;
  createdAt: string;
}

export interface AudiogramRecord {
  id: string;
  patientName: string;
  dateOfBirth?: string;
  testDate: string;
  testType: string;
  leftEarThresholds: Record<string, number>;
  rightEarThresholds: Record<string, number>;
  notes?: string;
}

export class PDFGenerator {
  private template: PDFTemplate;
  private record: AudiogramRecord;
  private chartImageData?: string;

  constructor(template: PDFTemplate, record: AudiogramRecord) {
    this.template = template;
    this.record = record;
  }

  /**
   * Set chart image data (from chart canvas)
   */
  setChartImage(imageData: string) {
    this.chartImageData = imageData;
  }

  /**
   * Generate content for a specific element
   */
  private getElementContent(element: TemplateElement): string {
    switch (element.type) {
      case 'title':
        return 'AUDIOGRAM REPORT';
      
      case 'patient-info':
        return `Patient: ${this.record.patientName}\nDOB: ${this.record.dateOfBirth || 'N/A'}`;
      
      case 'date':
        return `Test Date: ${new Date(this.record.testDate).toLocaleDateString()}\nTest Type: ${this.record.testType}`;
      
      case 'thresholds':
        const leftFreqs = Object.entries(this.record.leftEarThresholds)
          .map(([freq, dB]) => `${freq}Hz: ${dB}dB`)
          .join(' | ');
        const rightFreqs = Object.entries(this.record.rightEarThresholds)
          .map(([freq, dB]) => `${freq}Hz: ${dB}dB`)
          .join(' | ');
        return `LEFT EAR\n${leftFreqs}\n\nRIGHT EAR\n${rightFreqs}`;
      
      case 'chart':
        return '[Audiogram Chart]';
      
      case 'notes':
        return this.record.notes || 'No additional notes';
      
      case 'logo':
        return '[Logo/Image]';
      
      case 'text':
        return element.label;
      
      default:
        return '';
    }
  }

  /**
   * Generate PDF using template
   */
  async generatePDF(): Promise<any> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [this.template.pageWidth, this.template.pageHeight],
    });

    // Set default font
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);

    // Add each element to the PDF
    for (const element of this.template.elements) {
      const content = this.getElementContent(element);

      if (element.type === 'chart' && this.chartImageData) {
        // Add chart image
        try {
          doc.addImage(
            this.chartImageData,
            'PNG',
            element.x,
            element.y,
            element.width,
            element.height
          );
        } catch (error) {
          console.error('Error adding chart image:', error);
        }
      } else if (element.type === 'title') {
        // Style title
        doc.setFont('Helvetica', element.fontWeight || 'bold');
        doc.setFontSize(element.fontSize || 24);
        doc.text(content, element.x, element.y + 5);
      } else if (element.type === 'patient-info' || element.type === 'thresholds') {
        // Multi-line content
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(element.fontSize || 12);
        const lines = content.split('\n');
        let yOffset = element.y;
        for (const line of lines) {
          doc.text(line, element.x, yOffset);
          yOffset += 5;
        }
      } else {
        // Regular text
        doc.setFont('Helvetica', element.fontWeight || 'normal');
        doc.setFontSize(element.fontSize || 12);
        
        // Split text if too long
        const textLines = doc.splitTextToSize(content, element.width - 2);
        doc.text(textLines, element.x + 1, element.y + 3);
      }
    }

    return doc;
  }

  /**
   * Save PDF to file
   */
  async savePDF(filename?: string): Promise<void> {
    const doc = await this.generatePDF();
    doc.save(filename || `${this.record.patientName}-audiogram.pdf`);
  }

  /**
   * Get PDF as data URL
   */
  async getPDFDataURL(): Promise<string> {
    const doc = await this.generatePDF();
    return doc.output('datauristring');
  }

  /**
   * Get PDF as blob
   */
  async getPDFBlob(): Promise<Blob> {
    const doc = await this.generatePDF();
    const pdfData = doc.output('arraybuffer');
    return new Blob([pdfData], { type: 'application/pdf' });
  }
}

/**
 * Generate multiple PDFs in bulk
 */
export async function generateBulkPDF(
  template: PDFTemplate,
  records: AudiogramRecord[],
  chartImages?: Map<string, string>
  ): Promise<any[]> {
  const pdfs: any[] = [];  for (const record of records) {
    const generator = new PDFGenerator(template, record);
    
    // Add chart image if available
    if (chartImages?.has(record.id)) {
      generator.setChartImage(chartImages.get(record.id)!);
    }

    const pdf = await generator.generatePDF();
    pdfs.push(pdf);
  }

  return pdfs;
}

/**
 * Export multiple PDFs as a single file or zip
 */
export async function downloadBulkPDF(
  template: PDFTemplate,
  records: AudiogramRecord[],
  chartImages?: Map<string, string>
): Promise<void> {
  const pdfs = await generateBulkPDF(template, records, chartImages);

  if (pdfs.length === 1) {
    pdfs[0].save(`${records[0].patientName}-audiogram.pdf`);
  } else {
    // For multiple PDFs, download each separately or create a combined PDF
    pdfs.forEach((pdf, index) => {
      const timer = index * 100; // Stagger downloads
      setTimeout(() => {
        pdf.save(`audiogram-${index + 1}.pdf`);
      }, timer);
    });
  }
}

/**
 * Merge multiple PDFs into one
 */
export async function mergePDFs(pdfs: any[]): Promise<any> {
  if (pdfs.length === 0) throw new Error('No PDFs provided');
  
  const mergedPdf = new jsPDF();
  let isFirstPage = true;

  for (const pdf of pdfs) {
    const totalPages = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      if (!isFirstPage) {
        mergedPdf.addPage();
      }
      
      const imgData = pdf.output('datauristring');
      mergedPdf.addImage(imgData, 'PDF', 0, 0, 210, 297);
      isFirstPage = false;
    }
  }

  return mergedPdf;
}
