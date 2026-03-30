export type FrequencyPoint = {
  frequency: number;
  threshold: number;
  isMasked?: boolean;
};

export const FREQUENCIES = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];

/**
 * Calculates the Pure Tone Average (PTA) for a set of thresholds.
 * Standard PTA is the average of thresholds at 500, 1000, and 2000 Hz.
 */
export function calculatePTA(points: FrequencyPoint[]): number {
  if (!points || points.length === 0) return 0;
  const ptaFrequencies = [500, 1000, 2000];
  const relevantPoints = points.filter(p => ptaFrequencies.includes(p.frequency));
  
  if (relevantPoints.length === 0) return 0;
  
  const sum = relevantPoints.reduce((acc, curr) => acc + curr.threshold, 0);
  return Math.round((sum / relevantPoints.length));
}

export function getDegreeOfHearingLoss(pta: number): string {
  if (pta <= 25) return "Normal Hearing Sensitivity";
  if (pta <= 40) return "Mild Hearing Loss";
  if (pta <= 55) return "Moderate Hearing Loss";
  if (pta <= 70) return "Moderately Severe Hearing Loss";
  if (pta <= 90) return "Severe Hearing Loss";
  return "Profound Hearing Loss";
}

/**
 * Generates a rule-based diagnostic suggestion based on audiometric data.
 */
export function generateAutoDiagnosis(rightAir: FrequencyPoint[], leftAir: FrequencyPoint[]): string {
  const rightPTA = calculatePTA(rightAir);
  const leftPTA = calculatePTA(leftAir);

  if (rightAir.length === 0 && leftAir.length === 0) {
    return "Insufficient data for clinical analysis.";
  }

  const rightDegree = getDegreeOfHearingLoss(rightPTA);
  const leftDegree = getDegreeOfHearingLoss(leftPTA);

  const isBilateralNormal = rightPTA <= 25 && leftPTA <= 25;
  if (isBilateralNormal) {
    return "Bilateral Normal Hearing Sensitivity.";
  }

  const ptaDiff = Math.abs(rightPTA - leftPTA);
  const symmetry = ptaDiff <= 10 ? "Symmetrical" : "Asymmetrical";

  return `Right: ${rightDegree}.\nLeft: ${leftDegree}.\nSymmetry: ${symmetry} profile detected.`;
}

export type AudiogramData = {
  id: string;
  patientName: string;
  patientAge?: string;
  patientSex?: "Male" | "Female" | "Other";
  crNo?: string;
  testDate: string;
  testBy?: string;
  referral?: string;
  isAdult?: boolean;
  rightEarAir: FrequencyPoint[];
  leftEarAir: FrequencyPoint[];
  rightEarBone?: FrequencyPoint[];
  leftEarBone?: FrequencyPoint[];
  diagnosis?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Returns Tailwind CSS classes for diagnosis preview background color
 * Based on diagnosis type and severity
 */
export function getDiagnosisColorStyle(diagnosis: string): string {
  const diagLower = diagnosis?.toLowerCase() || "";

  // Normal Hearing - Green
  if (diagLower.includes("normal") && diagLower.includes("hearing")) {
    return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 hover:border-green-200";
  }

  // Mild Hearing Loss - Blue
  if (diagLower.includes("mild")) {
    return "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100 hover:border-blue-200";
  }

  // Moderate Hearing Loss - Yellow
  if (diagLower.includes("moderate") && !diagLower.includes("severe")) {
    return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100 hover:border-yellow-200";
  }

  // Moderately Severe & Severe - Orange
  if (diagLower.includes("severe")) {
    return "bg-gradient-to-r from-orange-50 to-red-50 border-orange-100 hover:border-orange-200";
  }

  // Profound - Red
  if (diagLower.includes("profound")) {
    return "bg-gradient-to-r from-red-50 to-rose-50 border-red-100 hover:border-red-200";
  }

  // Default - Indigo/Blue
  return "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-200";
}
