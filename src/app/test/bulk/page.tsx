"use client";

// Disable static generation for this page since it uses search params and offline storage
export const dynamic = 'force-dynamic';

import React, { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AudiogramData, FREQUENCIES, calculatePTA } from "@/lib/audiogram-utils";
import { useOfflineDoc } from "@/hooks/use-offline-storage";
import { AudiogramChart } from "@/components/audiogram/AudiogramChart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const LegendRow = ({ label, right, left, rColor = "text-red-600", lColor = "text-blue-600" }: { label: string, right: React.ReactNode, left: React.ReactNode, rColor?: string, lColor?: string }) => (
  <div className="grid grid-cols-[1fr_25px_25px] items-center border-b-[0.5pt] border-black py-0 last:border-0 h-[21px]">
    <span className="text-[7.5pt] font-medium px-2 uppercase tracking-tight">{label}</span>
    <span className={`${rColor} font-bold text-center flex justify-center text-[10pt]`}>{right}</span>
    <span className={`${lColor} font-bold text-center flex justify-center text-[10pt]`}>{left}</span>
  </div>
);

// Wrapper component that uses useSearchParams
function BulkViewReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [scale, setScale] = useState(1);

  // Get IDs from URL query: ?ids=id1,id2,id3
  const idsParam = searchParams.get('ids') || '';
  const ids = idsParam ? idsParam.split(',').filter(id => id.trim()) : [];

  useEffect(() => {
    setIsHydrated(true);
    
    const updateScale = () => {
      const targetWidth = 840;
      const currentWidth = window.innerWidth;
      
      if (currentWidth < targetWidth) {
        const newScale = (currentWidth - 32) / 800;
        setScale(Math.max(0.4, newScale));
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  if (!isHydrated) return null;

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-2 xs:p-4 font-body">
        <div className="max-w-4xl mx-auto text-center py-8 xs:py-12">
          <p className="text-slate-500 font-bold uppercase tracking-widest mb-4 xs:mb-6 text-xs xs:text-sm">No records selected</p>
          <Button variant="outline" onClick={() => router.push("/")} className="font-black text-[9px] xs:text-[10px] uppercase h-9 xs:h-10 px-3 xs:px-4">
            <ArrowLeft className="w-3.5 xs:w-4 h-3.5 xs:h-4 mr-1.5 xs:mr-2" /> <span>Back</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 xs:p-3 sm:p-4 md:p-6 print:p-0 print:bg-white font-body overflow-x-hidden">
      {/* Header Toolbar */}
      <div className="max-w-4xl mx-auto no-print mb-4 sm:mb-6 flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4 justify-between bg-white p-2.5 xs:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-slate-500 font-black text-[9px] xs:text-[10px] uppercase tracking-widest hover:bg-slate-50 px-2 xs:px-3 md:px-4 h-9 xs:h-10">
            <ArrowLeft className="w-3.5 xs:w-4 h-3.5 xs:h-4 mr-1 xs:mr-2" /> <span className="hidden xs:inline">Back</span>
          </Button>
          <span className="text-[8px] xs:text-xs font-bold text-slate-400 uppercase tracking-widest">
            {ids.length} Report{ids.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button 
          onClick={handlePrint} 
          className="bg-primary hover:bg-primary/90 text-white h-9 xs:h-10 font-bold text-[9px] xs:text-[10px] uppercase tracking-widest px-3 xs:px-4 md:px-6 shadow-md w-full xs:w-auto"
        >
          <Printer className="w-3.5 xs:w-4 h-3.5 xs:h-4 mr-1.5 xs:mr-2" /> <span>Print</span>
        </Button>
      </div>

      {/* Reports Container */}
      <div className="w-full flex flex-col gap-8 pb-8">
        {ids.map((id, index) => (
          <ReportCard key={id} id={id} index={index} scale={scale} />
        ))}
      </div>
    </div>
  );
}

// Export with Suspense boundary to handle useSearchParams
export default function BulkViewReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 p-3 md:p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          <p className="text-slate-600 font-medium">Loading reports...</p>
        </div>
      </div>
    }>
      <BulkViewReportsContent />
    </Suspense>
  );
}

function ReportCard({ id, index, scale }: { id: string; index: number; scale: number }) {
  const { data: report, isLoading } = useOfflineDoc(id || null);

  const rightPTA = useMemo(() => report ? calculatePTA(report.rightEarAir) : 0, [report]);
  const leftPTA = useMemo(() => report ? calculatePTA(report.leftEarAir) : 0, [report]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-3 gap-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl border border-slate-200">
        <p className="text-center text-slate-500 font-bold uppercase tracking-widest">
          Record {id} Not Found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center print:flex print:flex-col print:gap-0">
      <div 
        style={{ 
          transform: scale < 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'top center',
          height: scale < 1 ? `${297 * scale}mm` : 'auto',
          marginBottom: scale < 1 ? `${(297 * (1 - scale))}mm` : '0'
        }}
        className="transition-all duration-200 ease-in-out print:transform-none print:h-auto print:mb-0 print:w-full"
      >
        <div className="bg-white print:shadow-none print:border-none w-[210mm] min-w-[210mm] print:h-auto p-[10mm_12mm] flex flex-col shadow-2xl border border-slate-200 text-black print:overflow-visible relative shrink-0" id={`report-${id}`}>
          
          <div className="text-center mb-4">
            <div className="border-t-[1pt] border-black mb-2"></div>
            <h1 className="text-[12pt] font-bold uppercase tracking-[0.15em] font-sans">DEPARTMENT OF ENT</h1>
            <div className="border-b-[1pt] border-black mt-2"></div>
          </div>

          <div className="grid grid-cols-3 gap-x-8 text-[9.5pt] mb-4 px-1 py-3 border-b-[0.5pt] border-black font-sans">
            <div className="space-y-1.5">
              <div className="flex whitespace-nowrap"><span className="w-20 font-bold">Name</span><span>: {report.patientName}</span></div>
              <div className="flex whitespace-nowrap"><span className="w-20 font-bold">Sex</span><span>: {report.patientSex || "Other"}</span></div>
              <div className="flex whitespace-nowrap"><span className="w-20 font-bold">Test By</span><span>: {report.testBy || ""}</span></div>
            </div>
            <div className="space-y-1.5">
              <div className="flex whitespace-nowrap"><span className="w-24 font-bold">CRNo.</span><span>: {report.crNo || ""}</span></div>
              <div className="flex whitespace-nowrap"><span className="w-24 font-bold">Adult/Child</span><span>: {report.isAdult ? "Adult" : "Child"}</span></div>
              <div className="flex whitespace-nowrap"><span className="w-24 font-bold">Referred By</span><span>: {report.referral || ""}</span></div>
            </div>
            <div className="space-y-1.5">
              <div className="flex whitespace-nowrap"><span className="w-20 font-bold">TestDate</span><span>: {report.testDate}</span></div>
              <div className="flex whitespace-nowrap"><span className="w-20 font-bold">Age</span><span>: {report.patientAge || ""}</span></div>
            </div>
          </div>

          <div className="bg-[#f3f4f6] text-center py-1.5 font-bold text-[10pt] uppercase tracking-[0.25em] mb-4 border-[0.5pt] border-black medical-bg-gray font-sans">
            PURE TONE AUDIOMETRY
          </div>

          <div className="grid grid-cols-2 gap-x-8 mb-6 h-[340px]">
            <div className="flex flex-col items-center">
              <span className="text-[9pt] font-bold mb-1 uppercase tracking-widest font-sans">RIGHT EAR</span>
              <div className="w-full flex-1 border-[0.5pt] border-black overflow-hidden bg-white">
                <AudiogramChart side="Right" data={report.rightEarAir} height={310} />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9pt] font-bold mb-1 uppercase tracking-widest font-sans">LEFT EAR</span>
              <div className="w-full flex-1 border-[0.5pt] border-black overflow-hidden bg-white">
                <AudiogramChart side="Left" data={report.leftEarAir} height={310} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_200px] gap-6 items-start">
            <div className="space-y-6">
              <table className="w-full border-collapse border-[0.5pt] border-black text-[9pt] medical-table font-sans">
                <tbody>
                  <tr className="font-bold h-7 medical-bg-gray bg-[#f3f4f6]">
                    <td className="w-12 text-center border-[0.5pt] border-black">Freq.</td>
                    {FREQUENCIES.map(f => (
                      <td key={f} className="text-center border-[0.5pt] border-black">{f >= 1000 ? `${f/1000}K` : f}</td>
                    ))}
                  </tr>
                  <tr className="h-7">
                    <td className="font-bold text-center border-[0.5pt] border-black">R</td>
                    {FREQUENCIES.map(f => (
                      <td key={f} className="text-center border-[0.5pt] border-black font-bold">
                        {report.rightEarAir.find(d => d.frequency === f)?.threshold ?? ""}
                      </td>
                    ))}
                  </tr>
                  <tr className="h-7 text-slate-300">
                    <td className="font-bold text-center border-[0.5pt] border-black">R(M)</td>
                    {FREQUENCIES.map(f => <td key={f} className="border-[0.5pt] border-black"></td>)}
                  </tr>
                  <tr className="h-7 text-slate-300">
                    <td className="font-bold text-center border-[0.5pt] border-black">BCR</td>
                    {FREQUENCIES.map(f => <td key={f} className="border-[0.5pt] border-black"></td>)}
                  </tr>
                  <tr className="h-8 font-bold text-[8.5pt]">
                    <td colSpan={3} className="px-2 border-[0.5pt] border-black bg-[#f9fafb]">PTA(R) = {rightPTA} dB HL</td>
                    <td colSpan={4} className="px-2 border-[0.5pt] border-black">PTR-M(R) = </td>
                    <td colSpan={5} className="px-2 border-[0.5pt] border-black">PTA-BCM(R) = </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border-[0.5pt] border-black text-[9pt] medical-table font-sans">
                <tbody>
                  <tr className="font-bold h-7 medical-bg-gray bg-[#f3f4f6]">
                    <td className="w-12 text-center border-[0.5pt] border-black">Freq.</td>
                    {FREQUENCIES.map(f => (
                      <td key={f} className="text-center border-[0.5pt] border-black">{f >= 1000 ? `${f/1000}K` : f}</td>
                    ))}
                  </tr>
                  <tr className="h-7">
                    <td className="font-bold text-center border-[0.5pt] border-black">L</td>
                    {FREQUENCIES.map(f => (
                      <td key={f} className="text-center border-[0.5pt] border-black font-bold">
                        {report.leftEarAir.find(d => d.frequency === f)?.threshold ?? ""}
                      </td>
                    ))}
                  </tr>
                  <tr className="h-7 text-slate-300">
                    <td className="font-bold text-center border-[0.5pt] border-black">L(M)</td>
                    {FREQUENCIES.map(f => <td key={f} className="border-[0.5pt] border-black"></td>)}
                  </tr>
                  <tr className="h-7 text-slate-300">
                    <td className="font-bold text-center border-[0.5pt] border-black">BCL</td>
                    {FREQUENCIES.map(f => <td key={f} className="border-[0.5pt] border-black"></td>)}
                  </tr>
                  <tr className="h-8 font-bold text-[8.5pt]">
                    <td colSpan={3} className="px-2 border-[0.5pt] border-black bg-[#f9fafb]">PTA(L) = {leftPTA} dB HL</td>
                    <td colSpan={4} className="px-2 border-[0.5pt] border-black">PTR-M(L) = </td>
                    <td colSpan={5} className="px-2 border-[0.5pt] border-black">PTA-BCM(L) = </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-[0.5pt] border-black h-full flex flex-col font-sans">
              <div className="grid grid-cols-[1fr_25px_25px] items-center border-b-[0.5pt] border-black py-1 medical-bg-gray bg-[#f3f4f6] h-[28px]">
                  <span className="text-[8.5pt] font-bold px-2 uppercase tracking-tighter">Air</span>
                  <span className="text-red-600 font-bold text-center">○</span>
                  <span className="text-blue-600 font-bold text-center">✕</span>
              </div>
              <div className="flex-1 flex flex-col bg-white">
                <LegendRow label="Air/Masked" right="△" left="□" />
                <LegendRow label="Bone" right="<" left=">" />
                <LegendRow label="Bone/Masked" right="[" left="]" />
                <LegendRow label="MCL" right="M" left="M" />
                <LegendRow label="UCL" right="U" left="U" />
                <LegendRow label="C5 Dip" right="↓" left="↓" />
                <LegendRow label="Recruitment" right="✓" left="✓" />
                <LegendRow label="AI" right="Δ" left="◆" rColor="text-green-600" lColor="text-green-600" />
              </div>
            </div>
          </div>

          <div className="border-[0.5pt] border-black p-4 bg-white font-sans mt-0">
            <h3 className="font-bold text-[10pt] uppercase mb-2 tracking-widest">AUDIOLOGICAL DIAGNOSIS :-</h3>
            <div className="text-[10pt] leading-tight whitespace-pre-wrap font-bold p-2 min-h-[40px]">
              {report.diagnosis || "Bilateral Normal Hearing Sensitivity"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
