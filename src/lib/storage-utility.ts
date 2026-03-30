/**
 * Storage Utility Analysis Service
 * Provides information about offline storage usage and statistics
 */

import { AudiogramData } from './audiogram-utils';

export interface StorageStats {
  totalRecords: number;
  estimatedStorageUsed: string; // in MB
  estimatedStorageUsedBytes: number;
  storageQuota: string; // Available storage
  storageQuotaBytes: number;
  usagePercentage: number;
  recordsPerMB: number;
  averageRecordSize: number; // in bytes
  lastUpdated: Date;
}

class StorageUtilityService {
  /**
   * Calculate approximate size of a record in bytes
   */
  private calculateRecordSize(record: AudiogramData): number {
    const jsonString = JSON.stringify(record);
    // Each character in JavaScript is typically 2-4 bytes in memory
    // Using 2 bytes per character as conservative estimate
    return jsonString.length * 2;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(records: AudiogramData[]): Promise<StorageStats> {
    const totalRecords = records.length;
    
    // Calculate total size
    let totalBytes = 0;
    records.forEach(record => {
      totalBytes += this.calculateRecordSize(record);
    });

    const estimatedStorageUsedMB = totalBytes / (1024 * 1024);
    const averageRecordSize = totalRecords > 0 ? Math.round(totalBytes / totalRecords) : 0;
    
    // IndexedDB typical quota is 50MB per origin in Chrome/Edge
    // 20MB per origin in Firefox
    // Using conservative 50MB estimate
    const quotaBytes = 50 * 1024 * 1024;
    const usagePercentage = (totalBytes / quotaBytes) * 100;
    const recordsPerMB = totalRecords > 0 ? Math.round(totalRecords / estimatedStorageUsedMB) : 0;

    return {
      totalRecords,
      estimatedStorageUsed: estimatedStorageUsedMB.toFixed(2),
      estimatedStorageUsedBytes: totalBytes,
      storageQuota: (quotaBytes / (1024 * 1024)).toFixed(1),
      storageQuotaBytes: quotaBytes,
      usagePercentage: Math.min(usagePercentage, 100),
      recordsPerMB,
      averageRecordSize,
      lastUpdated: new Date(),
    };
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Get storage health status
   */
  getStorageHealthStatus(usagePercentage: number): {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    color: string;
  } {
    if (usagePercentage < 50) {
      return {
        status: 'healthy',
        message: 'Storage healthy - plenty of space available',
        color: 'green',
      };
    } else if (usagePercentage < 80) {
      return {
        status: 'warning',
        message: 'Storage usage moderate - consider backing up soon',
        color: 'yellow',
      };
    } else {
      return {
        status: 'critical',
        message: 'Storage running low - backup and clear old records',
        color: 'red',
      };
    }
  }

  /**
   * Get storage recommendations
   */
  getRecommendations(stats: StorageStats): string[] {
    const recommendations: string[] = [];

    if (stats.usagePercentage > 70) {
      recommendations.push('🚨 Consider backing up records to external storage');
    }

    if (stats.totalRecords > 500) {
      recommendations.push('💾 You have a large database - consider archiving old records');
    }

    if (stats.totalRecords > 1000) {
      recommendations.push('⚠️ With 1000+ records, performance may be affected');
    }

    if (stats.usagePercentage < 10) {
      recommendations.push('✅ Great! You have plenty of storage available');
    }

    if (stats.usagePercentage > 90) {
      recommendations.push('🔴 CRITICAL: Storage nearly full - export data immediately');
    }

    return recommendations.length > 0 
      ? recommendations 
      : ['✅ Storage usage is optimal'];
  }

  /**
   * Estimate cleanup savings
   */
  estimateCleanupSavings(recordsToDelete: number, averageRecordSize: number): {
    recordsToDelete: number;
    estimatedSpaceSaved: string;
    estimatedBytesToSave: number;
  } {
    const bytesToSave = recordsToDelete * averageRecordSize;
    return {
      recordsToDelete,
      estimatedSpaceSaved: this.formatBytes(bytesToSave),
      estimatedBytesToSave: bytesToSave,
    };
  }
}

export const storageUtility = new StorageUtilityService();
