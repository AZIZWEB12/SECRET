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

const questionSchema = z.object({
  question: z.string().describe("The text of the question. Should be clear and unambiguous."),
  options: z.array(z.string()).min(4).describe("An array of at least 4 possible answers."),
  correctAnswers: z.array(z.string()).min(1).describe("An array containing one or more correct answers from the options."),
  explanation: z.string().optional().describe("A brief explanation of why the correct answer(s) are correct."),
});


const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(questionSchema).describe('The generated quiz questions.'),
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

  Each question should have at least 4 options. Each question should have at least one correct answer and up to 3 correct answers. Provide a short explanation for each question.

  The text of the options should be the value in the options array. The correctAnswers array should contain the full text of the correct options.

  Format the output as a JSON object with a "questions" array.
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
