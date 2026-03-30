'use server';
/**
 * @fileOverview An AI agent that provides an audiological diagnosis based on audiogram data.
 * Optimized for maximum speed and clinical brevity.
 *
 * - diagnoseAudiogram - A function that handles the audiological diagnosis process.
 * - DiagnoseAudiogramInput - The input type for the diagnoseAudiogram function.
 * - DiagnoseAudiogramOutput - The return type for the diagnoseAudiogram function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AudiogramThresholdSchema = z.object({
  frequency: z.number().describe('The frequency in Hz.'),
  threshold: z.number().describe('The hearing threshold in dB HL.'),
});

const DiagnoseAudiogramInputSchema = z.object({
  patientName: z.string().describe('The full name of the patient.'),
  testDate: z.string().describe('The date the audiogram test was performed.'),
  rightEarAirConduction: z.array(AudiogramThresholdSchema).describe('Right ear thresholds.'),
  leftEarAirConduction: z.array(AudiogramThresholdSchema).describe('Left ear thresholds.'),
  rightEarPTA: z.number().describe('PTA for the right ear.'),
  leftEarPTA: z.number().describe('Left ear PTA.'),
});

export type DiagnoseAudiogramInput = z.infer<typeof DiagnoseAudiogramInputSchema>;

const DiagnoseAudiogramOutputSchema = z.object({
  diagnosis: z.string().describe('Concise clinical diagnosis keywords only.'),
});

export type DiagnoseAudiogramOutput = z.infer<typeof DiagnoseAudiogramOutputSchema>;

export async function diagnoseAudiogram(input: DiagnoseAudiogramInput): Promise<DiagnoseAudiogramOutput> {
  return diagnoseAudiogramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseAudiogramPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: DiagnoseAudiogramInputSchema },
  output: { schema: DiagnoseAudiogramOutputSchema },
  config: {
    temperature: 0,
    maxOutputTokens: 100,
  },
  prompt: `You are an expert audiologist. Analyze the provided PTA and thresholds to provide a keyword-only diagnosis.

--- Audiogram Data ---
Right PTA: {{{rightEarPTA}}} dB HL
Left PTA: {{{leftEarPTA}}} dB HL

--- CRITICAL INSTRUCTIONS ---
1. IF BOTH EARS ARE NORMAL (PTA <= 25dB AND all thresholds <= 25dB): 
   Set diagnosis to: "Bilateral Normal Hearing Sensitivity"

2. IF ABNORMAL:
   Use keywords only. Format:
   Right: [Degree] [Type] [Configuration]
   Left: [Degree] [Type] [Configuration]
   Symmetry: [Symmetrical/Asymmetrical]

3. NO RECOMMENDATIONS. NO SIGNATURES. NO FILLER. FASTEST POSSIBLE RESPONSE.`,
});

const diagnoseAudiogramFlow = ai.defineFlow(
  {
    name: 'diagnoseAudiogramFlow',
    inputSchema: DiagnoseAudiogramInputSchema,
    outputSchema: DiagnoseAudiogramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI failed to generate a diagnosis.');
    return output;
  }
);
