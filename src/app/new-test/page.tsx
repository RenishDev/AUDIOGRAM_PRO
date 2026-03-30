"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudiogramChart } from "@/components/audiogram/AudiogramChart";
import { DataEntryTable } from "@/components/audiogram/DataEntryTable";
import { calculatePTA, AudiogramData, FREQUENCIES } from "@/lib/audiogram-utils";
import { Loader2, Save, ArrowLeft, Printer, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    setFormData(prev => ({
      ...prev,
      id: Math.random().toString(36).substring(2, 9),
      testDate: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const rightPTA = calculatePTA(formData.rightEarAir);
  const leftPTA = calculatePTA(formData.leftEarAir);

  const handleSave = () => {
    setLoading(true);
    const existing = JSON.parse(localStorage.getItem("audiograms") || "[]");
    localStorage.setItem("audiograms", JSON.stringify([formData, ...existing]));
    
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Success",
        description: "Report saved to database."
      });
      router.push("/");
    }, 800);
  };

  if (!formData.id) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2 p-0 h-auto hover:bg-transparent text-slate-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Professional Diagnostic Report
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()} className="bg-white">
              <Printer className="w-4 h-4 mr-2" /> Print PDF
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Data
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-base font-bold">Patient Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-bold text-slate-500">Full Name</Label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-500">CR No.</Label>
                  <Input 
                    placeholder="GMH00001" 
                    value={formData.crNo}
                    onChange={(e) => setFormData({...formData, crNo: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-500">Age</Label>
                  <Input 
                    placeholder="28" 
                    value={formData.patientAge}
                    onChange={(e) => setFormData({...formData, patientAge: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-500">Sex</Label>
                  <Select 
                    value={formData.patientSex} 
                    onValueChange={(val: any) => setFormData({...formData, patientSex: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-bold text-slate-500">Patient Type</Label>
                  <Select 
                    value={formData.isAdult ? "Adult" : "Child"} 
                    onValueChange={(val) => setFormData({...formData, isAdult: val === "Adult"})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adult">Adult</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
             <DataEntryTable side="Right" data={formData.rightEarAir} onChange={(d) => setFormData({...formData, rightEarAir: d})} />
             <DataEntryTable side="Left" data={formData.leftEarAir} onChange={(d) => setFormData({...formData, leftEarAir: d})} />
             
             <Card className="shadow-sm">
                <CardHeader className="py-4 border-b">
                  <CardTitle className="text-base font-bold">Audiological Diagnosis</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Diagnosis Content</Label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 text-sm rounded-md border border-slate-200 focus:ring-1 focus:ring-primary outline-none"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="Enter clinical summary..."
                  />
                </CardContent>
             </Card>
          </div>
        </div>

        <div className="bg-white p-[1cm] md:p-[1.5cm] shadow-xl border border-slate-200 rounded-none print:shadow-none print:border-none print:p-0 mx-auto" style={{ minHeight: '297mm' }}>
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-widest text-black">Department of ENT</h2>
          </div>

          <div className="grid grid-cols-3 gap-y-2 text-[10pt] text-black mb-4 border-b pb-4">
            <div className="flex gap-2"><span className="font-bold w-20">Name</span>: {formData.patientName || "_________________"}</div>
            <div className="flex gap-2"><span className="font-bold w-20">CRNo.</span>: {formData.crNo || "_________________"}</div>
            <div className="flex gap-2"><span className="font-bold w-20">TestDate</span>: {formData.testDate}</div>
            
            <div className="flex gap-2"><span className="font-bold w-20">Sex</span>: {formData.patientSex}</div>
            <div className="flex gap-2"><span className="font-bold w-20">Adult/Child</span>: {formData.isAdult ? "Adult" : "Child"}</div>
            <div className="flex gap-2"><span className="font-bold w-20">Age</span>: {formData.patientAge || "__"}</div>
            
            <div className="flex gap-2"><span className="font-bold w-20">Test By</span>: {formData.testBy || "_________________"}</div>
            <div className="flex gap-2"><span className="font-bold w-20">Referred By</span>: {formData.referral || "_________________"}</div>
          </div>

          <div className="bg-slate-100 text-center py-1 border-y-2 border-slate-300 font-bold text-xs uppercase tracking-widest mb-6">
            Pure Tone Audiometry
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border p-2">
               <AudiogramChart side="Right" data={formData.rightEarAir} height={300} />
            </div>
            <div className="border p-2">
               <AudiogramChart side="Left" data={formData.leftEarAir} height={300} />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_200px] gap-4">
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[9pt]">
                  <tbody>
                    <tr className="bg-slate-50">
                      <td className="border border-black px-2 py-1 font-bold bg-slate-100">Freq.</td>
                      {FREQUENCIES.map(f => (
                        <td key={f} className="border border-black px-1 py-1 text-center font-bold">
                          {f >= 1000 ? `${f/1000}K` : f}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-black px-2 py-1 font-bold">R</td>
                      {FREQUENCIES.map(f => (
                        <td key={f} className="border border-black px-1 py-1 text-center">
                          {formData.rightEarAir.find(d => d.frequency === f)?.threshold ?? ""}
                        </td>
                      ))}
                    </tr>
                    <tr><td className="border border-black px-2 py-1 font-bold text-slate-400">R(M)</td>{FREQUENCIES.map(f => <td key={f} className="border border-black px-1 py-1"></td>)}</tr>
                    <tr><td className="border border-black px-2 py-1 font-bold text-slate-400">BCR</td>{FREQUENCIES.map(f => <td key={f} className="border border-black px-1 py-1"></td>)}</tr>
                    <tr>
                      <td colSpan={3} className="border border-black px-2 py-1 font-bold bg-slate-50">PTA(R) = {rightPTA} dB</td>
                      <td colSpan={4} className="border border-black px-2 py-1 text-slate-400">PTR-M(R) = </td>
                      <td colSpan={5} className="border border-black px-2 py-1 text-slate-400">PTA-BCM(R) = </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[9pt]">
                  <tbody>
                    <tr className="bg-slate-50">
                      <td className="border border-black px-2 py-1 font-bold bg-slate-100">Freq.</td>
                      {FREQUENCIES.map(f => (
                        <td key={f} className="border border-black px-1 py-1 text-center font-bold">
                          {f >= 1000 ? `${f/1000}K` : f}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-black px-2 py-1 font-bold">L</td>
                      {FREQUENCIES.map(f => (
                        <td key={f} className="border border-black px-1 py-1 text-center">
                          {formData.leftEarAir.find(d => d.frequency === f)?.threshold ?? ""}
                        </td>
                      ))}
                    </tr>
                    <tr><td className="border border-black px-2 py-1 font-bold text-slate-400">L(M)</td>{FREQUENCIES.map(f => <td key={f} className="border border-black px-1 py-1"></td>)}</tr>
                    <tr><td className="border border-black px-2 py-1 font-bold text-slate-400">BCL</td>{FREQUENCIES.map(f => <td key={f} className="border border-black px-1 py-1"></td>)}</tr>
                    <tr>
                      <td colSpan={3} className="border border-black px-2 py-1 font-bold bg-slate-50">PTA(L) = {leftPTA} dB</td>
                      <td colSpan={4} className="border border-black px-2 py-1 text-slate-400">PTR-M(L) = </td>
                      <td colSpan={5} className="border border-black px-2 py-1 text-slate-400">PTA-BCM(L) = </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-black p-2 space-y-2 text-[8pt]">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center border-b pb-1">
                <span>Air</span>
                <span className="text-red-600 font-bold text-lg">○</span>
                <span className="text-blue-600 font-bold text-lg">✕</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center border-b pb-1 opacity-40">
                <span>Air/Masked</span>
                <span className="text-red-600 font-bold text-lg">△</span>
                <span className="text-blue-600 font-bold text-lg">□</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center border-b pb-1 opacity-40">
                <span>Bone</span>
                <span className="text-red-600 font-bold text-lg">&lt;</span>
                <span className="text-blue-600 font-bold text-lg">&gt;</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border border-black min-h-[150px] p-4">
            <h3 className="font-bold text-[10pt] uppercase mb-2">Audiological Diagnosis :-</h3>
            <div className="text-[10pt] whitespace-pre-wrap font-bold">
              {formData.diagnosis || "Bilateral Normal Hearing Sensitivity"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
