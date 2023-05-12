const mongoose = require('mongoose');

const { Schema } = mongoose;

const app = new Schema(
  {
    appName: { type: String, required: true },
    appLogo: { type: String, required: true },
    appUrl: { type: String, required: true },
    notificationUrl: { type: String, required: false },
    longDescription: { type: String, required: true },
    shortDescription: { type: String, required: true },
    consentVersion: { type: String, required: true },
    consentTermOfUse: { type: String, required: true },
    consentPrivacy: { type: String, required: true },
    consentInformation: { type: String, required: true },
    consentPolicy_sp: { type: String, required: true },
    consentPolicy_en: { type: String, required: true },
    isSSOEnabled: { type: Boolean, required: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
    medicalRecords: [{ type: Schema.Types.ObjectId, ref: 'MedicalRecordType' }],
  },
  { collection: 'apps' }
);

module.exports = mongoose.model('App', app);
