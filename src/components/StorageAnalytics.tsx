'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HardDrive, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Activity
} from 'lucide-react';
import { StorageStats, storageUtility } from '@/lib/storage-utility';
import { AudiogramData } from '@/lib/audiogram-utils';

interface StorageAnalyticsProps {
  records: AudiogramData[] | null;
  isLoading: boolean;
}

export function StorageAnalytics({ records, isLoading }: StorageAnalyticsProps) {
  const [stats, setStats] = useState<StorageStats | null>(null);

  useEffect(() => {
    const updateStats = async () => {
      if (!records) return;
      
      const newStats = await storageUtility.getStorageStats(records);
      setStats(newStats);
    };

    updateStats();
  }, [records]);

  if (isLoading || !stats) {
    return (
      <Card className="border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const healthStatus = storageUtility.getStorageHealthStatus(stats.usagePercentage);
  
  const colorConfigMap = {
    green: {
      accent: 'emerald',
      icon: <CheckCircle className="w-5 h-5" />,
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-green-500',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      label: 'Healthy',
    },
    yellow: {
      accent: 'amber',
      icon: <AlertTriangle className="w-5 h-5" />,
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-yellow-500',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      label: 'Warning',
    },
    red: {
      accent: 'red',
      icon: <AlertTriangle className="w-5 h-5" />,
      gradientFrom: 'from-red-500',
      gradientTo: 'to-rose-500',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      label: 'Critical',
    },
  } as const;

  const colorConfig = colorConfigMap[healthStatus.color as 'green' | 'yellow' | 'red'];

  const usedPercentage = stats.usagePercentage;
  const availablePercentage = 100 - stats.usagePercentage;

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${colorConfig.gradientFrom} ${colorConfig.gradientTo}`} />
      
      <CardHeader className="pb-3 pt-4 px-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-gradient-to-br ${colorConfig.gradientFrom} ${colorConfig.gradientTo} rounded-lg shadow-sm`}>
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Storage Usage
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Offline Database</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full ${colorConfig.bgLight} border ${colorConfig.borderColor} flex items-center gap-1.5`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorConfig.gradientFrom} ${colorConfig.gradientTo}`} />
            <span className={`text-xs font-semibold ${colorConfig.textColor}`}>
              {colorConfig.label}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-5 px-6">
        <div className="space-y-4">
          {/* Main Content Row */}
          <div className="flex items-start gap-6">
            {/* Donut Chart */}
            <div className="flex-shrink-0">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke={
                      healthStatus.color === 'green' ? '#10b981' :
                      healthStatus.color === 'yellow' ? '#f59e0b' :
                      '#ef4444'
                    }
                    strokeWidth="16"
                    strokeDasharray={`${(stats.usagePercentage / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-slate-900">{Math.round(stats.usagePercentage)}%</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Used</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex-1 space-y-3">
              {/* Row 1: Used / Available */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${colorConfig.gradientFrom} ${colorConfig.gradientTo}`} />
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-tight">Used</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{stats.estimatedStorageUsed} <span className="text-xs text-slate-500 font-medium">MB</span></p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <p className="text-xs text-slate-600 font-semibold uppercase tracking-tight">Available</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{((Number(stats.storageQuota) || 50) - parseFloat(stats.estimatedStorageUsed)).toFixed(2)} <span className="text-xs text-slate-500 font-medium">MB</span></p>
                </div>
              </div>

              {/* Row 2: Quota / Records */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl p-4 border border-blue-100 hover:border-blue-200 transition-colors">
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-tight mb-1">Quota</p>
                  <p className="text-lg font-bold text-slate-900">{stats.storageQuota} <span className="text-xs text-slate-500 font-medium">MB</span></p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-50/50 rounded-xl p-4 border border-indigo-100 hover:border-indigo-200 transition-colors">
                  <p className="text-xs text-indigo-700 font-semibold uppercase tracking-tight mb-1">Records</p>
                  <p className="text-lg font-bold text-slate-900">{stats.totalRecords}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-tight">Storage Capacity</p>
              <p className="text-xs font-bold text-slate-700">{Math.round(stats.usagePercentage)}% / 100%</p>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${colorConfig.gradientFrom} ${colorConfig.gradientTo} rounded-full transition-all duration-500 shadow-sm`}
                style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
