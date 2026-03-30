/**
 * Offline Storage Service using IndexedDB for local data persistence
 * Supports export/import with Excel (CSV) format
 */

import { AudiogramData } from './audiogram-utils';

const DB_NAME = 'AudiogramDB';
const STORE_NAME = 'patients';
const DB_VERSION = 1;

type StorageListener = (data: AudiogramData[]) => void;

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private listeners: Set<StorageListener> = new Set();
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('patientName', 'patientName', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  async addOrUpdateRecord(record: AudiogramData): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const timestamp = new Date().toISOString();
    const recordWithTimestamp = {
      ...record,
      updatedAt: record.updatedAt || timestamp,
      createdAt: record.createdAt || timestamp,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(recordWithTimestamp);
      request.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllRecords(): Promise<AudiogramData[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        // Sort by updatedAt descending
        const records = (request.result as AudiogramData[]).sort((a, b) => {
          const dateA = new Date(a.updatedAt || 0).getTime();
          const dateB = new Date(b.updatedAt || 0).getTime();
          return dateB - dateA;
        });
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getRecordById(id: string): Promise<AudiogramData | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRecord(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  subscribe(listener: StorageListener): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.getAllRecords().then((records) => {
      this.listeners.forEach((listener) => listener(records));
    });
  }

  /**
   * Export records to CSV format (Excel compatible)
   */
  async exportToCSV(): Promise<string> {
    const records = await this.getAllRecords();
    
    if (records.length === 0) {
      return 'No records to export';
    }

    // CSV headers
    const headers = [
      'Patient Name',
      'Age',
      'Sex',
      'CR No',
      'Test Date',
      'Test By',
      'Referral',
      'Right Ear Air (125Hz)',
      'Right Ear Air (250Hz)',
      'Right Ear Air (500Hz)',
      'Right Ear Air (750Hz)',
      'Right Ear Air (1000Hz)',
      'Right Ear Air (1500Hz)',
      'Right Ear Air (2000Hz)',
      'Right Ear Air (3000Hz)',
      'Right Ear Air (4000Hz)',
      'Right Ear Air (6000Hz)',
      'Right Ear Air (8000Hz)',
      'Left Ear Air (125Hz)',
      'Left Ear Air (250Hz)',
      'Left Ear Air (500Hz)',
      'Left Ear Air (750Hz)',
      'Left Ear Air (1000Hz)',
      'Left Ear Air (1500Hz)',
      'Left Ear Air (2000Hz)',
      'Left Ear Air (3000Hz)',
      'Left Ear Air (4000Hz)',
      'Left Ear Air (6000Hz)',
      'Left Ear Air (8000Hz)',
      'Diagnosis',
      'Created At',
      'Updated At',
    ];

    // CSV rows
    const rows = records.map((record) => [
      this.escapeCSV(record.patientName || ''),
      record.patientAge || '',
      record.patientSex || '',
      record.crNo || '',
      record.testDate || '',
      record.testBy || '',
      record.referral || '',
      ...this.getFrequencyThresholds(record.rightEarAir),
      ...this.getFrequencyThresholds(record.leftEarAir),
      this.escapeCSV(record.diagnosis || ''),
      record.createdAt || '',
      record.updatedAt || '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Export records to JSON format
   */
  async exportToJSON(): Promise<string> {
    const records = await this.getAllRecords();
    return JSON.stringify(records, null, 2);
  }

  /**
   * Import records from JSON format
   */
  async importFromJSON(jsonContent: string): Promise<number> {
    try {
      const records = JSON.parse(jsonContent) as AudiogramData[];
      let importedCount = 0;

      for (const record of records) {
        if (record.patientName) {
          await this.addOrUpdateRecord(record);
          importedCount++;
        }
      }

      return importedCount;
    } catch (error) {
      throw new Error(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import records from CSV format (Excel compatible)
   */
  async importFromCSV(csvContent: string): Promise<number> {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      let importedCount = 0;

      // Expected header indices
      const headerMap: { [key: string]: number } = {};
      headers.forEach((header, index) => {
        headerMap[header] = index;
      });

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // Parse CSV line (handle quoted fields)
        const values = this.parseCSVLine(line);
        
        if (values.length < 7) continue; // Skip invalid rows

        // Build record from CSV values
        const record: AudiogramData = {
          id: `import-${Date.now()}-${i}`,
          patientName: this.getCSVValue(values, headerMap, 'patient name') || '',
          patientAge: this.getCSVValueAsNumber(values, headerMap, 'age') as any,
          patientSex: (this.getCSVValue(values, headerMap, 'sex') || 'Other') as any,
          crNo: this.getCSVValue(values, headerMap, 'cr no') || '',
          testDate: this.getCSVValue(values, headerMap, 'test date') || new Date().toISOString().split('T')[0],
          testBy: this.getCSVValue(values, headerMap, 'test by') || '',
          referral: this.getCSVValue(values, headerMap, 'referral') || '',
          rightEarAir: this.parseFrequenciesFromCSV(values, headerMap, 'right ear air'),
          leftEarAir: this.parseFrequenciesFromCSV(values, headerMap, 'left ear air'),
          diagnosis: this.getCSVValue(values, headerMap, 'diagnosis') || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (record.patientName) {
          await this.addOrUpdateRecord(record);
          importedCount++;
        }
      }

      if (importedCount === 0) {
        throw new Error('No valid records found in CSV file');
      }

      return importedCount;
    } catch (error) {
      throw new Error(`Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all records
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  private getCSVValue(values: string[], headerMap: { [key: string]: number }, headerName: string): string | undefined {
    const index = headerMap[headerName.toLowerCase()];
    return index !== undefined && values[index] ? values[index].replace(/^"|"$/g, '') : undefined;
  }

  private getCSVValueAsNumber(values: string[], headerMap: { [key: string]: number }, headerName: string): number | undefined {
    const value = this.getCSVValue(values, headerMap, headerName);
    return value ? parseInt(value, 10) : undefined;
  }

  private parseFrequenciesFromCSV(values: string[], headerMap: { [key: string]: number }, earLabel: string): any[] {
    const frequencies = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];
    const result: any[] = [];

    frequencies.forEach((freq) => {
      const headerName = `${earLabel} (${freq}hz)`.toLowerCase();
      const value = this.getCSVValue(values, headerMap, headerName);
      if (value && value !== '') {
        result.push({
          frequency: freq,
          threshold: parseInt(value, 10),
        });
      }
    });

    return result;
  }

  private getFrequencyThresholds(frequencies: any[] = []): string[] {
    const freqMap = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];
    return freqMap.map((freq) => {
      const point = frequencies.find((f) => f.frequency === freq);
      return point ? String(point.threshold) : '';
    });
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

export const offlineStorage = new OfflineStorageService();
