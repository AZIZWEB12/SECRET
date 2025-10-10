'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating quiz questions based on a given topic and difficulty.
 *
 * It exports:
 * - `generateQuizQuestions`: An async function to generate quiz questions.
 * - `GenerateQuizQuestionsInput`: The input type for the `generateQuizQuestions` function.
 * - `GenerateQuizQuestionsOutput`: The output type for the `generateQuizQuestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz questions.'),
  difficulty: z
    .string()
    .describe(
      'The difficulty level of the quiz questions (e.g., facile, moyen, difficile).' /* French levels to be consistent with the rest of the app */
    ),
  numberOfQuestions: z.number().default(5).describe('The number of questions to generate.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(
        z.object({
          label: z.string().describe('The label of the option (e.g., A, B, C, D).'),
          text: z.string().describe('The text of the option.'),
          is_correct: z.boolean().describe('Whether the option is correct.'),
        })
      ),
      explanation: z.string().describe('The explanation for the correct answer.'),
    })
  ).describe('The generated quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const generateQuizQuestionsPrompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator that creates quizzes based on the topic and difficulty.

  Generate {{numberOfQuestions}} questions on the topic of {{{topic}}} with a difficulty of {{{difficulty}}}.

  Each question should have 4 options labeled A, B, C, and D. Each question should have at least one correct answer and up to 3 correct answers. Provide a short explanation for each question.

  Format the output as a JSON object with a "questions" array. Each element of the array should have the following structure:
  {
    "question": "The question text",
    "options": [
      { "label": "A", "text": "Option A text", "is_correct": true|false },
      { "label": "B", "text": "Option B text", "is_correct": true|false },
      { "label": "C", "text": "Option C text", "is_correct": true|false },
      { "label": "D", "text": "Option D text", "is_correct": true|false }
    ],
    "explanation": "Explanation of the correct answer"
  }
  `,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuizQuestionsPrompt(input);
    return output!;
  }
);
