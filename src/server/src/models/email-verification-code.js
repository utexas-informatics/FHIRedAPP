const mongoose = require('mongoose');

const { Schema } = mongoose;

const emailVerificationCode = new Schema(
  {
    code: { type: String, required: true },
    email: { type: String, required: true },
    validity: { type: Number, default: 180 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { collection: 'emailVerificationCodes' }
);

module.exports = mongoose.model('EmailVerificationCode', emailVerificationCode);
