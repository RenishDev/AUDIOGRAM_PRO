'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOfflineCollection } from '@/hooks/use-offline-storage';
import { AudiogramData } from '@/lib/audiogram-utils';
import { Printer, Download, AlertCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BulkReportPrintDialog() {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [activeTab, setActiveTab] = useState('select');
  const { data: records, isLoading } = useOfflineCollection();
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(records?.map(r => r.id) || []));
      setSelectAll(true);
    }
  };

  const handleSelectRecord = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
    setSelectAll(newSet.size === records?.length);
  };

  const generatePrintHTML = (recordsToPrint: AudiogramData[]): string => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AudiogramPro - Bulk Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            background: white;
            padding: 20px;
        }
        
        .report-header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
        }
        
        .report-header h1 {
            font-size: 28px;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .report-header p {
            color: #666;
            font-size: 14px;
        }
        
        .records-container {
            margin-bottom: 40px;
        }
        
        .record {
            page-break-inside: avoid;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            background: #f9f9f9;
        }
        
        .record-header {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #667eea;
        }
        
        .record-field {
            display: flex;
            flex-direction: column;
        }
        
        .record-field label {
            font-weight: bold;
            color: #667eea;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .record-field value {
            font-size: 16px;
            color: #333;
            font-weight: 500;
        }
        
        .record-section {
            margin-bottom: 20px;
        }
        
        .record-section h3 {
            font-size: 14px;
            font-weight: bold;
            color: #667eea;
            text-transform: uppercase;
            margin-bottom: 10px;
            border-left: 4px solid #667eea;
            padding-left: 10px;
        }
        
        .frequencies-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
        }
        
        .frequency-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #667eea;
            text-align: center;
        }
        
        .frequency-label {
            font-size: 12px;
            color: #666;
            font-weight: bold;
        }
        
        .frequency-value {
            font-size: 18px;
            color: #667eea;
            font-weight: bold;
            margin-top: 5px;
        }
        
        .diagnosis-section {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
        }
        
        .diagnosis-label {
            font-size: 12px;
            font-weight: bold;
            color: #2e7d32;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        
        .diagnosis-text {
            font-size: 14px;
            color: #1b5e20;
            line-height: 1.6;
        }
        
        .record-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        
        .page-number {
            text-align: center;
            margin-top: 40px;
            color: #999;
            font-size: 12px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            .record {
                page-break-inside: avoid;
            }
        }
        
        @page {
            margin: 1cm;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>🎧 AudiogramPro - Bulk Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Total Records: ${recordsToPrint.length}</p>
    </div>
    
    <div class="records-container">
        ${recordsToPrint.map((record, index) => `
            <div class="record">
                <div class="record-header">
                    <div class="record-field">
                        <label>Patient Name</label>
                        <value>${record.patientName || 'N/A'}</value>
                    </div>
                    <div class="record-field">
                        <label>CR No</label>
                        <value>${record.crNo || 'N/A'}</value>
                    </div>
                    <div class="record-field">
                        <label>Age / Sex</label>
                        <value>${record.patientAge || '-'} years / ${record.patientSex || 'N/A'}</value>
                    </div>
                    <div class="record-field">
                        <label>Test Date</label>
                        <value>${record.testDate || 'N/A'}</value>
                    </div>
                </div>
                
                <div class="record-section">
                    <h3>Right Ear - Air Conduction</h3>
                    <div class="frequencies-grid">
                        ${record.rightEarAir?.map(point => `
                            <div class="frequency-item">
                                <div class="frequency-label">${point.frequency} Hz</div>
                                <div class="frequency-value">${point.threshold} dB</div>
                            </div>
                        `).join('') || '<p>No data</p>'}
                    </div>
                </div>
                
                <div class="record-section">
                    <h3>Left Ear - Air Conduction</h3>
                    <div class="frequencies-grid">
                        ${record.leftEarAir?.map(point => `
                            <div class="frequency-item">
                                <div class="frequency-label">${point.frequency} Hz</div>
                                <div class="frequency-value">${point.threshold} dB</div>
                            </div>
                        `).join('') || '<p>No data</p>'}
                    </div>
                </div>
                
                ${record.diagnosis ? `
                    <div class="diagnosis-section">
                        <div class="diagnosis-label">Diagnosis</div>
                        <div class="diagnosis-text">${record.diagnosis}</div>
                    </div>
                ` : ''}
                
                <div class="record-footer">
                    <div>
                        <strong>Test By:</strong> ${record.testBy || 'N/A'}
                    </div>
                    <div>
                        <strong>Referral:</strong> ${record.referral || 'N/A'}
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="page-number">
        <p>Report generated by AudiogramPro - Offline Version</p>
    </div>
</body>
</html>
    `;
    return html;
  };

  const handleShowPreview = () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Records Selected',
        description: 'Please select at least one record to preview',
        variant: 'destructive',
      });
      return;
    }

    const recordsToPreview = records?.filter(r => selectedIds.has(r.id)) || [];
    const html = generatePrintHTML(recordsToPreview);
    setPreviewHTML(html);
    setActiveTab('preview');
  };

  const handlePrint = () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Records Selected',
        description: 'Please select at least one record to print',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPrinting(true);
      const recordsToPrint = records?.filter(r => selectedIds.has(r.id)) || [];
      const html = generatePrintHTML(recordsToPrint);

      const printWindow = window.open('', '', 'width=900,height=600');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate print',
        variant: 'destructive',
      });
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadHTML = () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Records Selected',
        description: 'Please select at least one record to download',
        variant: 'destructive',
      });
      return;
    }

    try {
      const recordsToDownload = records?.filter(r => selectedIds.has(r.id)) || [];
      const html = generatePrintHTML(recordsToDownload);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audiogram-bulk-report-${new Date().toISOString().split('T')[0]}.html`);
      link.click();
      
      toast({
        title: 'Success',
        description: `Downloaded report for ${selectedIds.size} record(s)`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to download',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-xs font-bold uppercase tracking-widest"
      >
        <Printer className="w-3.5 h-3.5 mr-2" />
        Bulk Print
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase">Bulk Report & Print</DialogTitle>
            <DialogDescription>
              Select records, preview, then print or download as HTML report
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Loading records...</p>
            </div>
          ) : !records || records.length === 0 ? (
            <div className="py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  No records available. Create some audiogram records first.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">Select Records</TabsTrigger>
                  <TabsTrigger value="preview" disabled={selectedIds.size === 0}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview PDF
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  {/* Select Tab */}
                  <TabsContent value="select" className="space-y-4 overflow-y-auto h-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700 font-medium">
                        Select records to include in the bulk report. You can preview, print, or download as HTML.
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          id="select-all"
                        />
                        <span className="text-sm font-bold uppercase tracking-widest text-gray-700">
                          Select All ({records.length})
                        </span>
                      </label>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {records.map((record) => (
                        <label
                          key={record.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <Checkbox
                            checked={selectedIds.has(record.id)}
                            onCheckedChange={() => handleSelectRecord(record.id)}
                            id={`record-${record.id}`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">
                              {record.patientName || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.testDate || 'No date'} • CR: {record.crNo || 'N/A'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 font-medium sticky bottom-0">
                      Selected: {selectedIds.size} of {records.length} record(s)
                    </div>

                    <div className="flex gap-2 pt-4 sticky bottom-14">
                      <Button
                        onClick={handleShowPreview}
                        disabled={selectedIds.size === 0}
                        className="flex-1 text-xs font-bold"
                        variant="outline"
                      >
                        <Eye className="w-3.5 h-3.5 mr-2" />
                        Preview PDF
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Preview Tab */}
                  <TabsContent value="preview" className="h-full overflow-hidden">
                    <div className="flex flex-col h-full gap-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700 font-medium">
                          This is a preview of how your report will look when printed or exported to PDF.
                        </p>
                      </div>
                      
                      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white shadow-inner">
                        <div 
                          className="p-6"
                          dangerouslySetInnerHTML={{ __html: previewHTML }}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handlePrint}
                          disabled={printing || selectedIds.size === 0}
                          className="flex-1 text-xs font-bold"
                        >
                          <Printer className="w-3.5 h-3.5 mr-2" />
                          Print Report
                        </Button>
                        <Button
                          onClick={handleDownloadHTML}
                          disabled={printing || selectedIds.size === 0}
                          variant="outline"
                          className="flex-1 text-xs font-bold"
                        >
                          <Download className="w-3.5 h-3.5 mr-2" />
                          Download HTML
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
