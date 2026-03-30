'use client';

import { useState, useEffect, useCallback } from 'react';
import { AudiogramData } from '@/lib/audiogram-utils';
import { offlineStorage } from '@/lib/offline-storage';

export interface UseOfflineCollectionResult {
  data: AudiogramData[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to use offline storage for audiogram records
 * Replaces Firebase useCollection hook
 */
export function useOfflineCollection(): UseOfflineCollectionResult {
  const [data, setData] = useState<AudiogramData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await offlineStorage.init();
        const records = await offlineStorage.getAllRecords();
        setData(records);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to changes
    const unsubscribe = offlineStorage.subscribe((records) => {
      setData(records);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { data, isLoading, error };
}

export interface UseOfflineDocResult<T = AudiogramData> {
  data: (T & { id: string }) | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch a single offline record by ID
 * Replaces Firebase useDoc hook
 */
export function useOfflineDoc(id: string | null): UseOfflineDocResult {
  const [data, setData] = useState<(AudiogramData & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        await offlineStorage.init();
        const record = await offlineStorage.getRecordById(id);
        if (record) {
          setData(record as AudiogramData & { id: string });
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  return { data, isLoading, error };
}

/**
 * Hook to manage offline storage operations
 */
export function useOfflineStorage() {
  const addOrUpdateRecord = useCallback(async (record: AudiogramData) => {
    try {
      await offlineStorage.init();
      await offlineStorage.addOrUpdateRecord(record);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to save record');
    }
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      await offlineStorage.init();
      await offlineStorage.deleteRecord(id);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to delete record');
    }
  }, []);

  const exportToCSV = useCallback(async () => {
    try {
      await offlineStorage.init();
      return await offlineStorage.exportToCSV();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to export data');
    }
  }, []);

  const exportToJSON = useCallback(async () => {
    try {
      await offlineStorage.init();
      return await offlineStorage.exportToJSON();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to export data');
    }
  }, []);

  const importFromJSON = useCallback(async (jsonContent: string) => {
    try {
      await offlineStorage.init();
      return await offlineStorage.importFromJSON(jsonContent);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to import data');
    }
  }, []);

  const importFromCSV = useCallback(async (csvContent: string) => {
    try {
      await offlineStorage.init();
      return await offlineStorage.importFromCSV(csvContent);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to import CSV data');
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await offlineStorage.init();
      await offlineStorage.clearAll();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to clear data');
    }
  }, []);

  return {
    addOrUpdateRecord,
    deleteRecord,
    exportToCSV,
    exportToJSON,
    importFromJSON,
    importFromCSV,
    clearAll,
  };
}
