
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { FrequencyPoint, FREQUENCIES } from "@/lib/audiogram-utils";

interface AudiogramChartProps {
  data: FrequencyPoint[];
  side: "Right" | "Left";
  height?: number;
}

export function AudiogramChart({ data, side, height = 300 }: AudiogramChartProps) {
  const formattedData = FREQUENCIES.map(freq => {
    const point = data.find(d => d.frequency === freq);
    return {
      frequency: freq,
      threshold: point?.threshold,
    };
  });

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || payload.threshold === undefined) return null;

    if (side === "Right") {
      // Right Ear: Red Circle (O)
      return (
        <circle cx={cx} cy={cy} r={5} stroke="#ef4444" strokeWidth={2} fill="white" />
      );
    } else {
      // Left Ear: Blue Cross (X)
      return (
        <g transform={`translate(${cx-5}, ${cy-5})`}>
          <line x1="1" y1="1" x2="9" y2="9" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" />
          <line x1="9" y1="1" x2="1" y2="9" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-white h-full overflow-hidden">
      <div style={{ width: '100%', height }} className="pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
          >
            <CartesianGrid stroke="#999" strokeWidth={0.5} strokeDasharray="0" />
            <XAxis 
              dataKey="frequency" 
              type="number" 
              domain={[125, 8000]} 
              scale="log" 
              ticks={FREQUENCIES}
              tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000' }}
              interval={0}
              height={25}
              stroke="#000"
              strokeWidth={1}
              tickFormatter={(val) => val >= 1000 ? `${val/1000}K` : val}
            />
            <YAxis 
              reversed 
              domain={[-10, 120]} 
              ticks={[-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]}
              tick={{ fontSize: 9, fontWeight: 'bold', fill: '#000', dx: 4 }}
              stroke="#000"
              strokeWidth={1}
              width={40}
            />
            <Line
              type="linear"
              dataKey="threshold"
              stroke={side === "Right" ? "#ef4444" : "#3b82f6"}
              strokeWidth={2}
              dot={<CustomDot />}
              connectNulls
              isAnimationActive={false}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
