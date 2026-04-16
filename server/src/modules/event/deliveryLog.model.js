import mongoose from 'mongoose';

const deliveryLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    channel: {
      type: String,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'retrying'],
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
    },
    httpStatusCode: {
      type: Number,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const DeliveryLog = mongoose.model('DeliveryLog', deliveryLogSchema);

export default DeliveryLog;
