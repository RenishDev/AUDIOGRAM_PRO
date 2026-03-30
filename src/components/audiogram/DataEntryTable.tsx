
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FREQUENCIES, FrequencyPoint } from "@/lib/audiogram-utils";

interface DataEntryTableProps {
  side: "Right" | "Left";
  data: FrequencyPoint[];
  onChange: (data: FrequencyPoint[]) => void;
}

export function DataEntryTable({ side, data, onChange }: DataEntryTableProps) {
  const handleInputChange = (freq: number, value: string) => {
    const numValue = value === "" ? undefined : parseInt(value);
    
    let newData = [...data];
    const index = newData.findIndex(p => p.frequency === freq);
    
    if (numValue === undefined) {
      if (index !== -1) {
        newData.splice(index, 1);
      }
    } else {
      if (index !== -1) {
        newData[index] = { ...newData[index], threshold: numValue };
      } else {
        newData.push({ frequency: freq, threshold: numValue });
      }
    }
    
    onChange(newData);
  };

  const getVal = (freq: number) => {
    return data.find(p => p.frequency === freq)?.threshold ?? "";
  };

  const sideColor = side === "Right" ? "text-red-600" : "text-blue-600";
  const borderColor = side === "Right" ? "border-red-200" : "border-blue-200";
  const bgColor = side === "Right" ? "bg-red-50/20" : "bg-blue-50/20";

  return (
    <div className={`p-3 md:p-4 rounded-lg border ${borderColor} ${bgColor}`}>
      <h3 className={`font-black mb-3 text-[10px] md:text-xs uppercase tracking-wider flex items-center gap-2 ${sideColor}`}>
        {side} Ear Thresholds (dB HL)
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-1.5 md:gap-2">
        {FREQUENCIES.map((freq) => (
          <div key={freq} className="space-y-1">
            <label className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 block text-center truncate">
              {freq >= 1000 ? `${freq/1000}k` : freq}
            </label>
            <Input
              type="number"
              value={getVal(freq)}
              onChange={(e) => handleInputChange(freq, e.target.value)}
              className="h-8 md:h-9 px-1 text-center text-xs font-bold focus:ring-primary border-slate-300 bg-white"
              placeholder="-"
              min="-10"
              max="120"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
