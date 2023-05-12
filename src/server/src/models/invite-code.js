const mongoose = require('mongoose');

const { Schema } = mongoose;

const inviteCode = new Schema(
  {
    code: { type: String, required: true },
    patientEmail: { type: String, required: true },
    approverEmail: { type: String },
    description: { type: String },
    status: { type: String, default: 'Active' }, // Active, Verified, ConsentAccepted, SignedUp, Inactive
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { collection: 'inviteCodes' }
);

module.exports = mongoose.model('InviteCode', inviteCode);
