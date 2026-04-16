import crypto from 'crypto';
import Subscription from './subscription.model.js';
import AppError from '../../lib/AppError.js';

const getTenantId = (req) => req.tenant.sub || req.tenant._id;
const DUPLICATE_SUBSCRIPTION_ERROR = 'Subscription already exists for this tenant, event, channel, and recipient';

const handleDuplicateSubscriptionError = (err) => {
  if (err?.code === 11000) {
    throw new AppError(DUPLICATE_SUBSCRIPTION_ERROR, 409);
  }
  throw err;
};

const assertNoDuplicateSubscription = async ({
  tenantId,
  eventType,
  channel,
  recipient,
  excludeId,
}) => {
  const duplicateFilter = {
    tenantId,
    eventType,
    channel,
    recipient,
  };

  if (excludeId) {
    duplicateFilter._id = { $ne: excludeId };
  }

  const existingSubscription = await Subscription.findOne(duplicateFilter);
  if (existingSubscription) {
    throw new AppError(DUPLICATE_SUBSCRIPTION_ERROR, 409);
  }
};

export const create = async (req) => {
  try {
    const tenantId = getTenantId(req);
    const { body } = req;
    const payload = { ...body, tenantId };

    await assertNoDuplicateSubscription({
      tenantId,
      eventType: payload.eventType,
      channel: payload.channel,
      recipient: payload.recipient,
    });

    if (payload.channel === 'webhook') {
      payload.signingSecret = crypto.randomBytes(32).toString('hex');
    }
    return await Subscription.create(payload);
  } catch (err) {
    handleDuplicateSubscriptionError(err);
  }
};

export const list = async (req) => {
  const tenantId = getTenantId(req);
  return Subscription.find({ tenantId }).sort({ createdAt: -1 });
};

export const getById = async (req) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const subscription = await Subscription.findOne({ _id: id, tenantId });
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }
  return subscription;
};

export const update = async (req) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    const { body } = req;
    const existingSubscription = await Subscription.findOne({ _id: id, tenantId });
    if (!existingSubscription) {
      throw new AppError('Subscription not found', 404);
    }

    const updatePayload = { ...body };
    const targetEventType = updatePayload.eventType ?? existingSubscription.eventType;
    const targetChannel = updatePayload.channel ?? existingSubscription.channel;
    const targetRecipient = updatePayload.recipient ?? existingSubscription.recipient;

    await assertNoDuplicateSubscription({
      tenantId,
      eventType: targetEventType,
      channel: targetChannel,
      recipient: targetRecipient,
      excludeId: existingSubscription._id,
    });

    if (targetChannel === 'webhook' && !existingSubscription.signingSecret) {
      updatePayload.signingSecret = crypto.randomBytes(32).toString('hex');
    }

    const subscription = await Subscription.findOneAndUpdate({ _id: id, tenantId }, updatePayload, {
      returnDocument: 'after',
      runValidators: true,
    });
    return subscription;
  } catch (err) {
    handleDuplicateSubscriptionError(err);
  }
};

export const remove = async (req) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const subscription = await Subscription.findOneAndDelete({ _id: id, tenantId });
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }
  return subscription;
};

export const toggle = async (req) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const subscription = await Subscription.findOne({ _id: id, tenantId });
  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  subscription.isActive = !subscription.isActive;
  await subscription.save();
  return subscription;
};
