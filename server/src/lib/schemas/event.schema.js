import { z } from 'zod';

export const publishEventSchema = z.object({
  eventType: z.string().min(3).regex(/^\S+$/, 'eventType must not contain spaces'),
  payload: z.looseObject().optional(),
  idempotencyKey: z.string().optional(),
});
