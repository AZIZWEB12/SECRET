'use server';
/**
 * @fileOverview Summarizes training content from a given URL.
 *
 * - summarizeTrainingContent - The function that handles summarization.
 * - SummarizeTrainingContentInput - The input type for the function.
 * - SummarizeTrainingContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTrainingContentInputSchema = z.object({
  documentUrl: z
    .string()
    .url()
    .describe('The URL of the document to summarize.'),
});
export type SummarizeTrainingContentInput = z.infer<
  typeof SummarizeTrainingContentInputSchema
>;

const SummarizeTrainingContentOutputSchema = z.object({
  summary: z
    .string()
    .describe('The concise summary of the document in French.'),
});
export type SummarizeTrainingContentOutput = z.infer<
  typeof SummarizeTrainingContentOutputSchema
>;

export async function summarizeTrainingContent(
  input: SummarizeTrainingContentInput
): Promise<SummarizeTrainingContentOutput> {
  return summarizeTrainingContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTrainingContentPrompt',
  input: {schema: SummarizeTrainingContentInputSchema},
  output: {schema: SummarizeTrainingContentOutputSchema},
  prompt: `Act as an expert in summarizing educational documents for the Burkina Faso civil service exams.

Summarize in French the likely content of a document found at the URL '{{{documentUrl}}}' (without accessing it). The summary should be concise, structured with key points, and tailored for exam candidates. Limit the summary to 300 words.`,
});

const summarizeTrainingContentFlow = ai.defineFlow(
  {
    name: 'summarizeTrainingContentFlow',
    inputSchema: SummarizeTrainingContentInputSchema,
    outputSchema: SummarizeTrainingContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
