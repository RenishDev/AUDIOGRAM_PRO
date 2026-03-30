'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOfflineStorage } from '@/hooks/use-offline-storage';
import { Download, Upload, FileJson, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DataExportImportDialog() {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const { exportToCSV, exportToJSON, importFromJSON, importFromCSV, clearAll } = useOfflineStorage();
  const { toast } = useToast();

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const csvContent = await exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audiogram-records-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      toast({ title: 'Success', description: 'Records exported to CSV' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const jsonContent = await exportToJSON();
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audiogram-records-${new Date().toISOString().split('T')[0]}.json`);
      link.click();
      toast({ title: 'Success', description: 'Records exported to JSON' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const count = await importFromJSON(text);
      toast({
        title: 'Success',
        description: `Imported ${count} records from JSON file`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import JSON',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const count = await importFromCSV(text);
      toast({
        title: 'Success',
        description: `Imported ${count} records from CSV file`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import CSV',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL records? This action cannot be undone.')) {
      return;
    }

    try {
      await clearAll();
      toast({
        title: 'Success',
        description: 'All records have been deleted',
        variant: 'destructive',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to clear data',
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
        <Download className="w-3.5 h-3.5 mr-2" />
        Export / Import
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase">Data Management</DialogTitle>
            <DialogDescription>
              Export your records or import from a backup file for offline usage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 font-medium">
                All data is stored locally in your browser. Export regularly to create backups.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-2">Export</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportCSV}
                    disabled={exporting}
                    className="flex-1 text-xs font-bold"
                    variant="outline"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    CSV (Excel)
                  </Button>
                  <Button
                    onClick={handleExportJSON}
                    disabled={exporting}
                    className="flex-1 text-xs font-bold"
                    variant="outline"
                  >
                    <FileJson className="w-3.5 h-3.5 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-2">Import</h3>
                <div className="space-y-2">
                  <label className="relative block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      disabled={importing}
                      className="hidden"
                    />
                    <Button
                      className="w-full text-xs font-bold cursor-pointer"
                      variant="outline"
                      disabled={importing}
                      onClick={(e) => {
                        const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="w-3.5 h-3.5 mr-2" />
                      Import JSON Backup
                    </Button>
                  </label>
                  <label className="relative block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      disabled={importing}
                      className="hidden"
                    />
                    <Button
                      className="w-full text-xs font-bold cursor-pointer"
                      variant="outline"
                      disabled={importing}
                      onClick={(e) => {
                        const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="w-3.5 h-3.5 mr-2" />
                      Import CSV (Excel)
                    </Button>
                  </label>
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-2">Danger Zone</h3>
                <Button
                  onClick={handleClearAll}
                  className="w-full text-xs font-bold"
                  variant="destructive"
                >
                  Delete All Records
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
