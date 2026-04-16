import AppError from '../../lib/AppError.js';
import DeliveryLog from './deliveryLog.model.js';
import Event from './event.model.js';
import { processEvent } from './event.processor.js';

const getTenantId = (req) => req.tenant.sub || req.tenant._id;

export const publishEvent = async (req) => {
  const tenantId = getTenantId(req);
  const { body } = req;
  if (body.idempotencyKey) {
    const existingEvent = await Event.findOne({
      tenantId,
      idempotencyKey: body.idempotencyKey,
    });
    if (existingEvent) {
      return existingEvent;
    }
  }

  const event = await Event.create({
    tenantId,
    eventType: body.eventType,
    payload: body.payload,
    idempotencyKey: body.idempotencyKey,
    status: 'pending',
  });

  setImmediate(() => {
    processEvent(event).catch((err) => {
      console.error('Event processing failed:', err);
    });
  });

  return event;
};

export const listEvents = async (req) => {
  const tenantId = getTenantId(req);
  const { page = 1, limit = 10 } = req.query;
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.max(Number(limit) || 10, 1);
  const skip = (currentPage - 1) * perPage;

  const [data, totalCount] = await Promise.all([
    Event.find({ tenantId }).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(perPage),
    Event.countDocuments({ tenantId }),
  ]);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / perPage) || 1,
    currentPage,
  };
};

export const getEventById = async (req) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const event = await Event.findOne({ _id: id, tenantId });
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const deliveryLogs = await DeliveryLog.find({ eventId: id, tenantId }).sort({
    createdAt: -1,
    _id: -1,
  });

  return { ...event.toJSON(), deliveryLogs };
};

export const retryEvent = async (req) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const event = await Event.findOne({ _id: id, tenantId });
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  if (event.status !== 'failed') {
    throw new AppError('Only failed events can be retried', 400);
  }

  event.status = 'pending';
  await event.save();

  setImmediate(() => {
    processEvent(event).catch((err) => {
      console.error('Event retry failed:', err);
    });
  });

  return event;
};
