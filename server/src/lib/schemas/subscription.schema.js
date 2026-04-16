import { z } from 'zod';

export const createSubscriptionSchema = z
  .object({
    eventType: z.string().min(3, 'eventType must be at least 3 characters'),
    channel: z.enum(['email', 'webhook']),
    recipient: z.string().min(1, 'recipient is required'),
    template: z.string().min(1, 'template is required'),
    webhookUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channel === 'email') {
      const emailCheck = z.email().safeParse(data.recipient);
      if (!emailCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recipient'],
          message: 'recipient must be a valid email when channel is email',
        });
      }
    }

    if (data.channel === 'webhook') {
      if (!data.webhookUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['webhookUrl'],
          message: 'webhookUrl is required when channel is webhook',
        });
        return;
      }

      const urlCheck = z.url().safeParse(data.webhookUrl);
      if (!urlCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['webhookUrl'],
          message: 'webhookUrl must be a valid URL when channel is webhook',
        });
      }
    }
  });
