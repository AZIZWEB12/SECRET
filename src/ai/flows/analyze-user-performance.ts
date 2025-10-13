'use server';
/**
 * @fileOverview Analyzes a user's performance and provides recommendations.
 *
 * - analyzeUserPerformance - A function that handles the analysis.
 * - AnalyzeUserPerformanceInput - The input type for the function.
 * - AnalyzeUserPerformanceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUserPerformanceInputSchema = z.object({
  userId: z.string().describe("The ID of the user to analyze."),
  // In a real app, you would pass user performance data here.
  // For this example, we'll simulate it in the prompt.
});
export type AnalyzeUserPerformanceInput = z.infer<typeof AnalyzeUserPerformanceInputSchema>;

const AnalyzeUserPerformanceOutputSchema = z.object({
  insights: z
    .string()
    .describe(
      "A summary of the user's strengths and weaknesses in French."
    ),
  recommendations: z
    .array(z.string())
    .describe('A list of actionable recommendations for improvement.'),
});
export type AnalyzeUserPerformanceOutput = z.infer<typeof AnalyzeUserPerformanceOutputSchema>;

export async function analyzeUserPerformance(
  input: AnalyzeUserPerformanceInput
): Promise<AnalyzeUserPerformanceOutput> {
  return analyzeUserPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUserPerformancePrompt',
  input: {schema: AnalyzeUserPerformanceInputSchema},
  output: {schema: AnalyzeUserPerformanceOutputSchema},
  prompt: `You are an expert tutor for the Burkina Faso civil service exams.

Analyze the simulated performance of a user based on their quiz history. Provide actionable insights into their strengths and weaknesses, and give specific recommendations for improvement. The response must be in French.

**Simulated User Data for user ID {{{userId}}}:**
- **Quiz 'Droit Constitutionnel'**: Score 45% - Weaknesses in 'La séparation des pouvoirs'.
- **Quiz 'Culture Générale'**: Score 85% - Strengths in 'Histoire du Burkina Faso'.
- **Quiz 'Français - Grammaire'**: Score 55% - Weaknesses in 'Concordance des temps'.

Based on this data, provide insights and recommendations.`,
});

const analyzeUserPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeUserPerformanceFlow',
    inputSchema: AnalyzeUserPerformanceInputSchema,
    outputSchema: AnalyzeUserPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
