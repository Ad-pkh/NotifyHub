import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },
    apiKeyHash: {
      type: String,
    },
    apiKeyId: {
      type: String,
      unique: true,
      sparse: true,
    },
    refreshToken: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {//removed from the object before it becomes JSON, so they won’t show up in normal API responses when you send a Mongoose document
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.apiKeyHash;
        delete ret.apiKeyId;
        delete ret.refreshToken;
        return ret;
      },
    },
  },
);

tenantSchema.pre('save', function preSaveLowercaseEmail() {
  if (this.isModified('email') && typeof this.email === 'string') {
    this.email = this.email.toLowerCase();
  }
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
