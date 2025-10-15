
import { NextResponse } from 'next/server';
import {ai} from '@/ai/genkit';
import {z, generate} from 'genkit';


// Define the schemas for input and output using Zod
const quizQuestionSchema = z.object({
  question: z.string().describe("The text of the question. Should be clear and unambiguous."),
  options: z.array(z.string()).length(4).describe("An array of 4 possible answers."),
  correctAnswers: z.array(z.string()).min(1).describe("An array containing one or more correct answers from the options."),
  explanation: z.string().describe("A brief explanation of why the correct answer(s) are correct."),
});

const quizSchema = z.object({
  title: z.string().describe("A concise and engaging title for the quiz."),
  description: z.string().describe("A brief description of the quiz topic."),
  category: z.string().describe("The general category of the quiz (e.g., 'Histoire', 'Mathématiques', 'Culture Générale')."),
  difficulty: z.enum(['facile', 'moyen', 'difficile']).describe("The difficulty level of the quiz."),
  duration_minutes: z.number().int().positive().describe("The estimated duration of the quiz in minutes."),
  questions: z.array(quizQuestionSchema).describe("An array of quiz questions."),
});

type Quiz = z.infer<typeof quizSchema>;

// Define the API request body schema
const apiRequestSchema = z.object({
  topic: z.string(),
  numberOfQuestions: z.number().int().positive(),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  source: z.enum(['ai', 'opentdb'])
});

// Function to fetch from Open Trivia Database
async function fetchFromOpenTDB(category: string, amount: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<any[]> {
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch from Open Trivia DB');
    }
    const data = await response.json();
    return data.results || [];
}

// Main POST handler for the API route
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, numberOfQuestions, difficulty, source } = apiRequestSchema.parse(body);

    if (source === 'opentdb') {
        const tdbDifficulty = difficulty === 'facile' ? 'easy' : difficulty === 'moyen' ? 'medium' : 'hard';
        const tdbQuestions = await fetchFromOpenTDB(topic, numberOfQuestions, tdbDifficulty);
        
        const formattedQuestions = tdbQuestions.map(q => {
            const options = [...q.incorrect_answers, q.correct_answer];
            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
            // Ensure there are always 4 options
            while (options.length < 4) {
              options.push(''); 
            }

            return {
                question: q.question,
                options: options.slice(0, 4), // Ensure exactly 4 options
                correctAnswers: [q.correct_answer],
                explanation: `La bonne réponse est ${q.correct_answer}.`
            };
        });

        const quiz: Partial<Quiz> = {
            title: `Quiz sur ${tdbQuestions[0]?.category || 'un sujet varié'}`,
            description: `Un quiz de ${numberOfQuestions} questions de culture générale.`,
            category: tdbQuestions[0]?.category || 'Culture Générale',
            difficulty: difficulty,
            duration_minutes: Math.ceil(numberOfQuestions * 0.75), // 45s per question
            questions: formattedQuestions,
        };
        
        return NextResponse.json({ quiz });

    } else {
        // AI Generation Logic
        const generationPrompt = `
          Génère un quiz complet en français sur le sujet suivant : "${topic}".
          Le quiz doit avoir exactement ${numberOfQuestions} questions.
          La difficulté doit être : ${difficulty}.

          Le format de sortie doit être un objet JSON valide qui respecte le schéma Zod suivant :
          ${JSON.stringify(quizSchema.shape, null, 2)}

          Assure-toi que :
          - Chaque question a exactement 4 options.
          - 'correctAnswers' est un tableau contenant le texte exact d'une ou plusieurs bonnes réponses.
          - L'explication est claire et concise.
          - Le titre, la description et la catégorie sont pertinents et en français.
        `;

        const { output } = await generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: generationPrompt,
            output: {
                format: 'json',
                schema: quizSchema,
            },
        });

        const quiz = output;

        if (!quiz) {
            throw new Error("AI model did not return a valid quiz object.");
        }
        
        // Final check to ensure every question has 4 options
        quiz.questions.forEach(q => {
            while(q.options.length < 4) {
                q.options.push('');
            }
            q.options = q.options.slice(0, 4);
        });


        return NextResponse.json({ quiz });
    }
  } catch (error) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof z.ZodError) {
        errorMessage = 'Invalid request body.';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
