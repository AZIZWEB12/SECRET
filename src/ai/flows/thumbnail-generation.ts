'use server';

/**
 * @fileOverview Generates video thumbnails using AI, allowing admins to select the most representative frame.
 *
 * - generateVideoThumbnail - A function that handles the thumbnail generation process.
 * - GenerateVideoThumbnailInput - The input type for the generateVideoThumbnail function.
 * - GenerateVideoThumbnailOutput - The return type for the generateVideoThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoThumbnailInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'A video file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateVideoThumbnailInput = z.infer<typeof GenerateVideoThumbnailInputSchema>;

const GenerateVideoThumbnailOutputSchema = z.object({
  thumbnailDataUri: z
    .string()
    .describe(
      'A thumbnail image of the video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateVideoThumbnailOutput = z.infer<typeof GenerateVideoThumbnailOutputSchema>;

export async function generateVideoThumbnail(input: GenerateVideoThumbnailInput): Promise<GenerateVideoThumbnailOutput> {
  return generateVideoThumbnailFlow(input);
}

const generateVideoThumbnailPrompt = ai.definePrompt({
  name: 'generateVideoThumbnailPrompt',
  input: {schema: GenerateVideoThumbnailInputSchema},
  output: {schema: GenerateVideoThumbnailOutputSchema},
  prompt: `Generate a representative thumbnail for the video. Return the thumbnail as a data URI.

Video: {{media url=videoDataUri}}`,
});

const generateVideoThumbnailFlow = ai.defineFlow(
  {
    name: 'generateVideoThumbnailFlow',
    inputSchema: GenerateVideoThumbnailInputSchema,
    outputSchema: GenerateVideoThumbnailOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          {media: {url: input.videoDataUri}},
          {text: 'generate an appealing thumbnail for this video'},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won\'t work
        },
      });
    return {thumbnailDataUri: media!.url!};
  }
);
