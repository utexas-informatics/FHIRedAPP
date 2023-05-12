const mongoose = require('mongoose');

const { Schema } = mongoose;

const metadata = new Schema(
  {
    type: { type: String, required: true },
    consentPolicy: { type: String, required: true },
    consentPolicy_en: { type: String, required: true },
    consentPolicy_sp: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    notifyAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { collection: 'metadatas' }
);

module.exports = mongoose.model('Metadata', metadata);
