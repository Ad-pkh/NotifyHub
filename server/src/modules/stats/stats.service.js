import mongoose from 'mongoose';
import DeliveryLog from '../event/deliveryLog.model.js';

/** JWT puts tenant id in `sub` as a string; DeliveryLog stores tenantId as ObjectId — must match both. */
function resolveTenantObjectId(req) {
  const raw = req.tenant?.sub ?? req.tenant?._id;
  if (!raw) {
    return null;
  }
  if (raw instanceof mongoose.Types.ObjectId) {
    return raw;
  }
  if (typeof raw === 'string' && mongoose.Types.ObjectId.isValid(raw)) {
    return new mongoose.Types.ObjectId(raw);
  }
  return raw;
}

export const getOverview = async (req) => {
  const tenantId = resolveTenantObjectId(req);
  if (!tenantId) {
    return {
      totalEvents: 0,
      delivered: 0,
      failed: 0,
      deliveryRate: 0,
    };
  }

  const [totals] = await DeliveryLog.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: '$tenantId',
        delivered: {
          $sum: {
            $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
          },
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
          },
        },
        uniqueEvents: { $addToSet: '$eventId' },
      },
    },
    {
      $project: {
        _id: 0,
        delivered: 1,
        failed: 1,
        totalEvents: { $size: '$uniqueEvents' },
      },
    },
  ]);

  const delivered = totals?.delivered || 0;
  const failed = totals?.failed || 0;
  const totalEvents = totals?.totalEvents || 0;
  const totalAttempts = delivered + failed;
  const deliveryRate = totalAttempts ? Number(((delivered / totalAttempts) * 100).toFixed(2)) : 0;

  return {
    totalEvents,
    delivered,
    failed,
    deliveryRate,
  };
};
