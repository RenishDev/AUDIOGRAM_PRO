"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  FileText, 
  Activity, 
  Trash2,
  Edit,
  Eye,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Download,
  Calendar
} from "lucide-react";
import { AudiogramData, calculatePTA, getDiagnosisColorStyle } from "@/lib/audiogram-utils";
import { useToast } from "@/hooks/use-toast";
import { useOfflineCollection, useOfflineStorage } from "@/hooks/use-offline-storage";
import { Skeleton } from "@/components/ui/skeleton";

// Disable static generation for this page since it uses offline storage
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Badge } from "@/components/ui/badge";
import { DataExportImportDialog } from "@/components/DataExportImportDialog";
import { StorageAnalytics } from "@/components/StorageAnalytics";

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteRecord } = useOfflineStorage();

  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: reports, isLoading } = useOfflineCollection();

  // Extract unique dates from reports
  const availableDates = useMemo(() => {
    if (!reports) return [];
    const datesSet = new Set<string>();
    reports.forEach(r => {
      if (r.testDate) {
        datesSet.add(r.testDate);
      }
    });
    // Sort dates in descending order (newest first)
    return Array.from(datesSet).sort().reverse();
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    
    return reports.filter(r => {
      const term = search.toLowerCase();
      const matchesSearch = (r.patientName || "").toLowerCase().includes(term) ||
                          (r.crNo || "").toLowerCase().includes(term) ||
                          (r.diagnosis || "").toLowerCase().includes(term);
      
      const matchesSex = sexFilter === "all" || 
                        r.patientSex?.toLowerCase() === sexFilter.toLowerCase();

      let matchesDate = true;
      if (dateFilter !== "all") {
        const reportDate = r.testDate || "";
        const today = new Date();
        const reportDateObj = new Date(reportDate);

        if (dateFilter === "today") {
          matchesDate = reportDate === today.toISOString().split('T')[0];
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = reportDateObj >= weekAgo && reportDateObj <= today;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = reportDateObj >= monthAgo && reportDateObj <= today;
        } else {
          // Specific date filter
          matchesDate = reportDate === dateFilter;
        }
      }

      return matchesSearch && matchesSex && matchesDate;
    });
  }, [reports, search, sexFilter, dateFilter]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sexFilter]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRecord(id).then(() => {
      toast({ title: "Record Removed", description: "The clinical record has been deleted.", variant: "destructive" });
    }).catch((error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    });
  };

  const handleRowClick = (id: string) => {
    router.push(`/test/${id}`);
  };

  // Bulk selection handlers
  const toggleRecordSelection = (id: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRecords.size === paginatedReports.length) {
      setSelectedRecords(new Set());
    } else {
      const allIds = new Set(paginatedReports.map(r => r.id));
      setSelectedRecords(allIds);
    }
  };

  const openSelectedBulk = () => {
    if (selectedRecords.size === 0) {
      toast({ title: "No records selected", description: "Please select at least one record to open." });
      return;
    }
    
    const recordIds = Array.from(selectedRecords).join(',');
    
    // Navigate to bulk view page with all selected IDs
    router.push(`/test/bulk?ids=${recordIds}`);
    
    toast({ 
      title: "Opening records", 
      description: `Opening ${selectedRecords.size} record(s) in bulk view...` 
    });
  };

  const clearSelection = () => {
    setSelectedRecords(new Set());
  };

  const clearFilters = () => {
    setSearch("");
    setSexFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
    setSelectedRecords(new Set());
    setItemsPerPage(10);
  };

  // Helper function to generate audiogram SVG chart
  const generateAudiogramChart = (earType: "right" | "left", airValues: any[], boneValues: any[]) => {
    const width = 300;
    const height = 220;
    const padding = 35;
    const frequencies = [125, 250, 500, 1000, 2000, 4000, 8000];
    
    // Extract numeric values from FrequencyPoint objects
    const getThreshold = (points: any[], freq: number) => {
      const point = points.find((p: any) => p.frequency === freq);
      return point ? point.threshold : null;
    };
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="border: 2px solid #000; background: white; font-family: Arial, sans-serif; display: inline-block;">`;
    
    // Draw white background
    svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="white" stroke="none" />`;
    
    // Draw grid lines - professional medical grade
    svg += `<g stroke="#e0e0e0" stroke-width="0.7">`;
    // Vertical lines for frequencies
    for (let i = 0; i < frequencies.length; i++) {
      const x = padding + (i / (frequencies.length - 1)) * (width - 2 * padding);
      svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" />`;
    }
    // Horizontal lines for dB levels
    for (let db = 0; db <= 100; db += 10) {
      const y = height - padding - (db / 110) * (height - 2 * padding);
      svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" />`;
    }
    svg += `</g>`;
    
    // Draw bolder grid lines for major intervals
    svg += `<g stroke="#999" stroke-width="0.5" opacity="0.6">`;
    // Major vertical lines
    for (let i = 0; i < frequencies.length; i++) {
      if (i % 2 === 0) { // Every other frequency
        const x = padding + (i / (frequencies.length - 1)) * (width - 2 * padding);
        svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" />`;
      }
    }
    // Major horizontal lines
    for (let db = 0; db <= 100; db += 20) {
      const y = height - padding - (db / 110) * (height - 2 * padding);
      svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" />`;
    }
    svg += `</g>`;
    
    // Draw axes with bold black lines
    svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#000" stroke-width="1.5" />`;
    svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#000" stroke-width="1.5" />`;
    
    // Draw frequency labels at bottom
    for (let i = 0; i < frequencies.length; i++) {
      const x = padding + (i / (frequencies.length - 1)) * (width - 2 * padding);
      svg += `<text x="${x}" y="${height - padding + 14}" text-anchor="middle" font-size="8" font-weight="bold" fill="#000">${frequencies[i]}</text>`;
    }
    
    // Draw dB labels on left
    for (let db = 0; db <= 100; db += 10) {
      const y = height - padding - (db / 110) * (height - 2 * padding);
      svg += `<text x="${padding - 8}" y="${y + 2.5}" text-anchor="end" font-size="7" fill="#000">${db}</text>`;
    }
    
    // Draw air conduction line - professional medical colors
    const airColor = earType === "right" ? "#cc0000" : "#0000cc";
    svg += `<g stroke="${airColor}" stroke-width="2" fill="none">`;
    let pathD = "";
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const threshold = getThreshold(airValues, freq);
      if (threshold !== null) {
        const x = padding + (i / (frequencies.length - 1)) * (width - 2 * padding);
        const y = height - padding - (threshold / 110) * (height - 2 * padding);
        if (pathD === "") pathD += `M ${x} ${y}`;
        else pathD += ` L ${x} ${y}`;
      }
    }
    if (pathD) svg += `<path d="${pathD}" />`;
    svg += `</g>`;
    
    // Draw air conduction markers (circles)
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const threshold = getThreshold(airValues, freq);
      if (threshold !== null) {
        const x = padding + (i / (frequencies.length - 1)) * (width - 2 * padding);
        const y = height - padding - (threshold / 110) * (height - 2 * padding);
        svg += `<circle cx="${x}" cy="${y}" r="2.5" fill="white" stroke="${airColor}" stroke-width="2" />`;
      }
    }
    
    // Draw bone conduction line if available
    if (boneValues && boneValues.length > 0) {
      const boneColor = earType === "right" ? "#ff6666" : "#6666ff";
      svg += `<g stroke="${boneColor}" stroke-width="2" fill="none" stroke-dasharray="3,3">`;
      let pathD = "";
      for (let i = 0; i < frequencies.length; i++) {
        const freq = frequencies[i];
        const threshold = getThreshold(boneValues, freq);
        if (threshold !== null) {
          const x = padding + (i / (frequencies.length - 1)) * (width - 2 * padding);
          const y = height - padding - (threshold / 110) * (height - 2 * padding);
          if (pathD === "") pathD += `M ${x} ${y}`;
          else pathD += ` L ${x} ${y}`;
        }
      }
      if (pathD) svg += `<path d="${pathD}" />`;
      svg += `</g>`;
      
      // Draw bone conduction markers (brackets [)
      for (let i = 0; i < frequencies.length; i++) {
        const freq = frequencies[i];
        const threshold = getThreshold(boneValues, freq);
        if (threshold !== null) {
          const x = padding + (i / (frequencies.length - 1)) * (width - 2 * padding);
          const y = height - padding - (threshold / 110) * (height - 2 * padding);
          svg += `<text x="${x}" y="${y + 3}" text-anchor="middle" font-size="11" font-weight="bold" fill="${boneColor}">[</text>`;
        }
      }
    }
    
    // Draw title with professional colors
    const titleColor = earType === "right" ? "#cc0000" : "#0000cc";
    svg += `<text x="${width / 2}" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="${titleColor}" letter-spacing="0.5">${earType === "right" ? "RIGHT EAR" : "LEFT EAR"}</text>`;
    
    svg += `</svg>`;
    return svg;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-primary p-2 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl text-primary tracking-tight uppercase">AudiogramPro</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Offline Mode - Local Storage
             </div>
             <DataExportImportDialog />
             <Button asChild className="font-bold bg-primary hover:bg-primary/90 transition-all active:scale-95 px-6">
              <Link href="/test/new">
                <Plus className="w-4 h-4 mr-2" /> NEW DIAGNOSTIC
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Clinical Command</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" /> Laboratory Information System Control
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <StorageAnalytics records={reports} isLoading={isLoading} />
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center justify-between flex-1">
                <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Clinical Database</CardTitle>
                <Badge variant="outline" className="font-black text-[10px] border-slate-200 text-slate-400">
                  {isLoading ? "LOADING..." : `${filteredReports.length} MATCHES`}
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search identity or CR No..." 
                    className="pl-10 h-10 bg-white border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sexFilter} onValueChange={setSexFilter}>
                    <SelectTrigger className="h-10 w-[160px] bg-white border-slate-200 font-bold text-[9px] uppercase tracking-widest">
                      <SelectValue placeholder="All Sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Biological Sex</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="h-10 w-[140px] bg-white border-slate-200 font-bold text-[9px] uppercase tracking-widest">
                      <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      
                      {/* Divider */}
                      {availableDates.length > 0 && (
                        <div className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          Available Dates
                        </div>
                      )}
                      
                      {/* Available dates from data */}
                      {availableDates.map(date => (
                        <SelectItem key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={itemsPerPage.toString()} onValueChange={(val) => {
                    setItemsPerPage(parseInt(val));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-10 w-[120px] bg-white border-slate-200 font-bold text-[9px] uppercase tracking-widest">
                      <SelectValue placeholder="Per Page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(search || sexFilter !== "all" || dateFilter !== "all" || itemsPerPage !== 10) && (
                    <Button variant="outline" size="icon" onClick={clearFilters} className="h-10 w-10 bg-white border-slate-200 text-slate-400 hover:text-destructive">
                      <FilterX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : filteredReports.length > 0 ? (
              <>
                {/* Bulk Action Toolbar */}
                {selectedRecords.size > 0 && (
                  <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
                    <div className="text-sm font-black text-blue-900 uppercase tracking-widest">
                      {selectedRecords.size} record{selectedRecords.size !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={openSelectedBulk}
                        className="bg-primary hover:bg-primary/90 text-white h-8 font-bold text-[9px] uppercase tracking-widest px-4"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Open Selected ({selectedRecords.size})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="h-8 font-bold text-[9px] uppercase tracking-widest px-3"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-[1200px] w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedRecords.size === paginatedReports.length && paginatedReports.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer"
                          aria-label="Select all records on this page"
                        />
                      </th>
                      <th className="px-6 py-4">Clinical Identity</th>
                      <th className="px-6 py-4">CR No</th>
                      <th className="px-6 py-4">Profile Info</th>
                      <th className="px-6 py-4">Diagnostic PTA (dB)</th>
                      <th className="px-6 py-4">Test Date</th>
                      <th className="px-6 py-4">Diagnosis Preview</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedReports.map((report) => {
                      const rightPTA = calculatePTA(report.rightEarAir);
                      const leftPTA = calculatePTA(report.leftEarAir);
                      return (
                        <tr key={report.id} className="hover:bg-slate-50/50 transition-all group" onClick={() => handleRowClick(report.id)}>
                          <td className="px-4 py-5" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedRecords.has(report.id)}
                              onChange={() => toggleRecordSelection(report.id)}
                              className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer"
                              aria-label={`Select ${report.patientName}`}
                            />
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                {report.patientName?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="space-y-0.5">
                                <div className="font-black text-slate-900 uppercase tracking-tight text-sm group-hover:text-primary transition-colors">{report.patientName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="secondary" className="font-black text-[10px] bg-slate-100 text-slate-600 border-none">
                              {report.crNo || 'N/A'}
                            </Badge>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700">{report.patientAge || '?'}Y • {report.patientSex?.toUpperCase() || '?'}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.isAdult ? 'Adult' : 'Pediatric'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2 text-[10px] font-black uppercase">
                              <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">R: {rightPTA}</span>
                              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">L: {leftPTA}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-xs font-bold text-slate-500">{report.testDate}</td>
                          <td className="px-6 py-5">
                            <div className="group relative">
                              <div className={`text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg border transition-colors cursor-help line-clamp-2 ${getDiagnosisColorStyle(report.diagnosis || "")}`}>
                                {report.diagnosis || "Bilateral Normal Hearing Sensitivity"}
                              </div>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-normal max-w-xs z-50 shadow-lg">
                                <p className="font-semibold">{report.diagnosis || "Bilateral Normal Hearing Sensitivity"}</p>
                                <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary" onClick={() => handleRowClick(report.id)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary" asChild>
                                <Link href={`/test/new?edit=${report.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-destructive" onClick={(e) => handleDelete(report.id, e)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </>
            ) : (
              <div className="py-24 text-center">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No Clinical Records Found</p>
                <Button onClick={clearFilters} variant="outline" className="mt-6 font-black text-[9px] uppercase tracking-widest h-10 px-6 border-slate-200">RESET ALL FILTERS</Button>
              </div>
            )}
            {totalPages > 1 && (
              <div className="border-t border-slate-100 bg-slate-50/30">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={filteredReports.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  className="p-6"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
