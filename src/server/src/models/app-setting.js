const mongoose = require('mongoose');

const { Schema } = mongoose;

const appSetting = new Schema(
  {
    sessionTimeOutPeriod: { type: Number, required: true },
    emailVerificationCodeExpiryPeriod: { type: Number, required: true },
    loginAttemptsAllowed: { type: Number, required: true },
    invalidLoginLockPeriod: { type: Number, required: true },
    timeZone: { type: String, required: true },
    dateFormat: { type: String, required: true },
    appConsentExpiryPeriod: { type: Number, required: true },
    emailLoginLinkValidityPeriod: { type: Number, required: true },
    loginExpiryPeriod: { type: Number, required: true },
    studyCoOrdinatorEmail: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
  },
  { collection: 'appSettings' }
);

module.exports = mongoose.model('AppSetting', appSetting);
