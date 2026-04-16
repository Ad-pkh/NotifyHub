import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    eventType: {
      type: String,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    idempotencyKey: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'partial'],
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
