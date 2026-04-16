import { handleEmail } from '../notification/email.handler.js';
import { retryWithBackoff } from '../notification/retry.js';
import { handleWebhook } from '../notification/webhook.handler.js';
import DeliveryLog from './deliveryLog.model.js';
import Event from './event.model.js';
import Subscription from '../subscription/subscription.model.js';

export const processEvent = async (event) => {
  const subscriptions = await Subscription.find({
    tenantId: event.tenantId,
    eventType: event.eventType,
    isActive: true,
  });

  if (!subscriptions.length) {
    await DeliveryLog.create({
      eventId: event._id,
      tenantId: event.tenantId,
      channel: 'system',
      status: 'failed',
      attempts: 0,
      lastError: `No active subscriptions matched eventType "${event.eventType}"`,
    });

    await Event.findOneAndUpdate(
      { _id: event._id, tenantId: event.tenantId },
      { status: 'failed' },
      { returnDocument: 'after' },
    );
    return;
  }

  const results = [];

  for (const subscription of subscriptions) {
    let finalResult = { success: false, error: 'Unsupported channel' };

    finalResult = await retryWithBackoff(async (attemptNumber) => {
      let attemptResult;
      if (subscription.channel === 'email') {
        attemptResult = await handleEmail(subscription, event, attemptNumber);
      } else if (subscription.channel === 'webhook') {
        attemptResult = await handleWebhook(subscription, event, attemptNumber);
      } else {
        attemptResult = { success: false, error: 'Unsupported channel' };
      }

      await DeliveryLog.create({
        eventId: event._id,
        tenantId: event.tenantId,
        subscriptionId: subscription._id,
        channel: subscription.channel,
        status: attemptResult.success ? 'success' : 'failed',
        attempts: attemptNumber,
        lastError: attemptResult.success ? undefined : attemptResult.error,
        httpStatusCode: attemptResult.statusCode,
        deliveredAt: attemptResult.success ? new Date() : undefined,
      });

      return attemptResult;
    });

    results.push(finalResult.success);
  }

  const allSuccess = results.every(Boolean);
  const allFailed = results.every((result) => !result);
  const status = allSuccess ? 'delivered' : allFailed ? 'failed' : 'partial';

  await Event.findOneAndUpdate(
    { _id: event._id, tenantId: event.tenantId },
    { status },
    { returnDocument: 'after' },
  );
};
