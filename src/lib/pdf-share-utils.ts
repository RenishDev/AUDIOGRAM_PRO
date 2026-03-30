'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a PDF from a DOM element and shares it using the Web Share API.
 * Optimized for medical reports to maintain high fidelity.
 * Provides a smart fallback for Desktop vs Mobile environments.
 */
export async function shareReportAsPdf(elementId: string, filename: string, patientName: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Report area not found");

  try {
    // 1. Generate the High-Resolution Snapshot (3x for clinical detail)
    const canvas = await html2canvas(element, {
      scale: 3, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.margin = '0';
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.position = 'static';
        }
      }
    });

    // 2. Create PDF (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    const pdfBlob = pdf.output('blob');
    // Sanitize filename: remove spaces and special characters for better OS compatibility
    const cleanFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const pdfFile = new File([pdfBlob], `${cleanFilename}.pdf`, { type: 'application/pdf' });

    // 3. Smart Sharing Logic
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [pdfFile] }));

    if (isMobile && canShareFiles) {
      try {
        // On mobile, we share the file directly. 
        // We omit 'text' and 'title' if they cause the file to not be the primary attachment on some Android versions.
        await navigator.share({
          files: [pdfFile],
          title: `Audiogram: ${patientName}`,
        });
        return 'shared';
      } catch (shareError: any) {
        if (shareError.name === 'AbortError') return 'cancelled';
        console.warn('Native share failed, using fallback.', shareError);
      }
    } 
    
    // Desktop / Fallback: Download + Open WhatsApp Web
    // Browsers cannot auto-attach files to WhatsApp Web due to security restrictions.
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${cleanFilename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoke URL after a delay
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

    // Open WhatsApp Web with a message
    const waText = `Audiogram Report for ${patientName}. Please attach the PDF document I just sent to your downloads.`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
    
    return 'downloaded_and_wa_opened';
  } catch (error) {
    console.error('Direct PDF Share failed:', error);
    throw error;
  }
}
