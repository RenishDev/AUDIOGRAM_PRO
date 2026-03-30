"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataEntryTable } from "@/components/audiogram/DataEntryTable";
import { AudiogramChart } from "@/components/audiogram/AudiogramChart";
import { AudiogramData, calculatePTA, generateAutoDiagnosis } from "@/lib/audiogram-utils";
import { Loader2, Save, ArrowLeft, Activity, LineChart as ChartIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOfflineStorage, useOfflineDoc } from "@/hooks/use-offline-storage";
import { Skeleton } from "@/components/ui/skeleton";

// Disable static generation for this page since it uses search params and offline storage
export const dynamic = 'force-dynamic';

function NewTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();
  const { addOrUpdateRecord } = useOfflineStorage();
  const { data: editData, isLoading: fetching } = useOfflineDoc(editId);

  const [saving, setSaving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [formData, setFormData] = useState<AudiogramData>({
    id: "",
    patientName: "",
    patientAge: "",
    patientSex: "Male",
    crNo: "",
    testDate: "",
    testBy: "",
    referral: "",
    isAdult: true,
    rightEarAir: [],
    leftEarAir: [],
    diagnosis: ""
  });

  useEffect(() => {
    setIsHydrated(true);
    if (editId && editData) {
      setFormData(editData);
    } else if (!editId) {
      setFormData(prev => ({
        ...prev,
        id: Math.random().toString(36).substring(2, 9),
        testDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [editId, editData]);

  const rightPTA = useMemo(() => calculatePTA(formData.rightEarAir), [formData.rightEarAir]);
  const leftPTA = useMemo(() => calculatePTA(formData.leftEarAir), [formData.leftEarAir]);

  const handleAutoAnalyze = () => {
    const suggestion = generateAutoDiagnosis(formData.rightEarAir, formData.leftEarAir);
    setFormData(prev => ({ ...prev, diagnosis: suggestion }));
    toast({
      title: "Analysis Complete",
      description: "Diagnostic suggestion generated based on current thresholds.",
    });
  };

  const handleSave = () => {
    if (!formData.patientName) {
      toast({ title: "Required", description: "Patient name is needed.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const finalData = {
      ...formData,
      updatedAt: new Date().toISOString(),
      createdAt: formData.createdAt || new Date().toISOString()
    };

    addOrUpdateRecord(finalData)
      .then(() => {
        toast({ title: "Success", description: "Record saved offline successfully." });
        router.push(`/test/${finalData.id}`);
      })
      .catch((error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
      });
  };

  if (!isHydrated) return null;

  if (fetching || !formData.id) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-body">
        <div className="max-w-[1400px] mx-auto space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3"><Skeleton className="h-[600px] w-full" /></div>
            <div className="lg:col-span-9 space-y-6">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 md:p-6 font-body">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <header className="flex items-center justify-between no-print gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="h-10 w-10 bg-white border-slate-200">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Button>
            <h1 className="text-2xl font-black text-primary flex items-center gap-2 tracking-tight truncate">
              <Activity className="w-6 h-6 shrink-0" />
              <span className="truncate">{editId ? "Edit Diagnostic Record" : "New Diagnostic Record"}</span>
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 px-8 font-bold shadow-lg transition-transform active:scale-95">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            SAVE CLINICAL RECORD
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Full Name</Label>
                  <Input 
                    value={formData.patientName}
                    onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    className="h-11 border-slate-200"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">CR No.</Label>
                    <Input value={formData.crNo} onChange={(e) => setFormData({...formData, crNo: e.target.value})} className="h-11 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Age</Label>
                    <Input value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} className="h-11 border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Sex</Label>
                    <Select value={formData.patientSex} onValueChange={(val: any) => setFormData({...formData, patientSex: val})}>
                      <SelectTrigger className="h-11 border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Type</Label>
                    <Select value={formData.isAdult ? "Adult" : "Child"} onValueChange={(val) => setFormData({...formData, isAdult: val === "Adult"})}>
                      <SelectTrigger className="h-11 border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Adult">Adult</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Test Date</Label>
                  <Input type="date" value={formData.testDate} onChange={(e) => setFormData({...formData, testDate: e.target.value})} className="h-11 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Clinician (Test By)</Label>
                  <Input value={formData.testBy} onChange={(e) => setFormData({...formData, testBy: e.target.value})} className="h-11 border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Referred By</Label>
                  <Input value={formData.referral} onChange={(e) => setFormData({...formData, referral: e.target.value})} className="h-11 border-slate-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9 space-y-6 order-1 lg:order-2">
             <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-4 px-6 bg-slate-50/30 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ChartIcon className="w-4 h-4" /> Live Audiogram Visualization
                  </CardTitle>
                  <div className="flex gap-6 text-[11px] font-black uppercase">
                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">PTA (R): {rightPTA} dB</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">PTA (L): {leftPTA} dB</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-center text-red-600 uppercase tracking-widest border-b pb-1">Right Ear Profile</div>
                      <div className="border rounded-xl bg-white p-4 h-[300px]">
                        <AudiogramChart side="Right" data={formData.rightEarAir} height={260} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-center text-blue-600 uppercase tracking-widest border-b pb-1">Left Ear Profile</div>
                      <div className="border rounded-xl bg-white p-4 h-[300px]">
                        <AudiogramChart side="Left" data={formData.leftEarAir} height={260} />
                      </div>
                    </div>
                  </div>
                </CardContent>
             </Card>

             <div className="space-y-4">
                <DataEntryTable side="Right" data={formData.rightEarAir} onChange={(d) => setFormData({...formData, rightEarAir: d})} />
                <DataEntryTable side="Left" data={formData.leftEarAir} onChange={(d) => setFormData({...formData, leftEarAir: d})} />
             </div>
             
             <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3 px-6 bg-slate-50/30 border-b flex items-center justify-between">
                  <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-400">Clinical Diagnosis Summary</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleAutoAnalyze} className="h-8 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
                    <Sparkles className="w-3.5 h-3.5 mr-2" /> AUTO ANALYZE
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <textarea 
                    className="w-full min-h-[140px] p-4 text-sm rounded-xl border border-slate-200 focus:ring-1 focus:ring-primary outline-none font-medium bg-[#FAFBFC] shadow-inner resize-none"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="Enter clinical summary or use 'AUTO ANALYZE' for instant results..."
                  />
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewTestPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
      <NewTestContent />
    </Suspense>
  );
}
