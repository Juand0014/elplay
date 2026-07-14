import { z } from 'zod';

export const TemporaryScorerNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(80);

export const EmailMagicLinkSchema = z.string().trim().email().max(254);
