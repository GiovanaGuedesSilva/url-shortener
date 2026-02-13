import { z } from 'zod';

export const urlSchema = z.object({
  url: z
	.string()
	.url({ message: 'Invalid URL format' })
	.max(2048, { message: 'URL is too long' }),
});