/**
 * This file is the entrypoint for all Genkit flows.
 *
 * It is used by the Next.js API route to expose the flows.
 * It is also used by the dev server to run the flows locally.
 */

import './flows/analyze-user-performance';
import './flows/generate-dynamic-quizzes';
import './flows/generate-personalized-study-plan';
import './flows/generate-quiz-questions';
import './flows/summarize-training-content';
import './flows/thumbnail-generation';
