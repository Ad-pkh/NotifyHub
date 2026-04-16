import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    enum: ['email', 'webhook'],
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },
  webhookUrl: {
    type: String,
  },
  signingSecret: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

subscriptionSchema.index(
  { tenantId: 1, eventType: 1, channel: 1, recipient: 1 },
  { unique: true },
);

subscriptionSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.signingSecret;
    return ret;
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
