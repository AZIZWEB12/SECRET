'use server';
/**
 * @fileOverview A flow to generate dynamic quizzes on a given topic.
 *
 * - generateDynamicQuiz - A function that handles the quiz generation.
 * - GenerateDynamicQuizInput - The input type for the function.
 * - GenerateDynamicQuizOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDynamicQuizInputSchema = z.object({
  topic: z
    .string()
    .describe('The subject for which to generate the quiz.'),
});
export type GenerateDynamicQuizInput = z.infer<typeof GenerateDynamicQuizInputSchema>;

const questionSchema = z.object({
      question: z.string(),
      options: z.array(z.string()).min(4),
      correctAnswers: z.array(z.string()),
      explanation: z.string().optional(),
    });

const GenerateDynamicQuizOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  duration_minutes: z.number(),
  questions: z
    .array(questionSchema)
    .min(10)
    .max(15),
});
export type GenerateDynamicQuizOutput = z.infer<typeof GenerateDynamicQuizOutputSchema>;

export async function generateDynamicQuiz(
  input: GenerateDynamicQuizInput
): Promise<GenerateDynamicQuizOutput> {
  return generateDynamicQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDynamicQuizPrompt',
  input: {schema: GenerateDynamicQuizInputSchema},
  output: {schema: GenerateDynamicQuizOutputSchema},
  prompt: `Act as an expert in creating quizzes for the Burkina Faso civil service exams. Generate a complete quiz in French on the topic of '{{{topic}}}'.

The quiz must include:
- A title, description, category, difficulty, and duration.
- Between 10 and 15 varied questions.
- For each question, provide at least 4 plausible options, one or more correct answers, and a detailed explanation.
- Ensure the quiz is balanced in difficulty and relevant for exam preparation.`,
});

const generateDynamicQuizFlow = ai.defineFlow(
  {
    name: 'generateDynamicQuizFlow',
    inputSchema: GenerateDynamicQuizInputSchema,
    outputSchema: GenerateDynamicQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
