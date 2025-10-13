'use server';
/**
 * @fileOverview Generates a personalized study plan for a user.
 *
 * - generatePersonalizedStudyPlan - The function to generate the plan.
 * - GeneratePersonalizedStudyPlanInput - The input type.
 * - GeneratePersonalizedStudyPlanOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  userId: z.string().describe("The user's ID."),
  topic: z
    .string()
    .describe('The main topic the user wants to focus on.'),
});
export type GeneratePersonalizedStudyPlanInput = z.infer<
  typeof GeneratePersonalizedStudyPlanInputSchema
>;

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  plan: z.array(
    z.object({
      day: z.number().describe('The day number (1-7).'),
      activity: z.string().describe('The main activity for the day.'),
      description: z
        .string()
        .describe('A brief description of the task.'),
    })
  ),
});
export type GeneratePersonalizedStudyPlanOutput = z.infer<
  typeof GeneratePersonalizedStudyPlanOutputSchema
>;

export async function generatePersonalizedStudyPlan(
  input: GeneratePersonalizedStudyPlanInput
): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: {schema: GeneratePersonalizedStudyPlanInputSchema},
  output: {schema: GeneratePersonalizedStudyPlanOutputSchema},
  prompt: `Create a personalized 7-day study plan in French for a candidate preparing for the Burkina Faso civil service exams. The user's ID is {{{userId}}}.

The plan should be tailored to the topic of '{{{topic}}}' and based on their past performance.

**Simulated User Performance:**
- Weakness in 'Droit Administratif'.
- Strength in 'Culture Générale'.

The plan should include a mix of quizzes, document reviews, and other learning activities. Structure the output as an array of objects, each with 'day', 'activity', and 'description'.`,
});

const generatePersonalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedStudyPlanFlow',
    inputSchema: GeneratePersonalizedStudyPlanInputSchema,
    outputSchema: GeneratePersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
