const mongoose = require('mongoose');

const { Schema } = mongoose;

const user = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    birthday: { type: Date },
    gender: { type: String },
    genderOther: { type: String },
    phoneNumberPrimary: { type: String, min: 10 },
    phoneNumberSecondary: { type: String, min: 10 },
    inviteCode: { type: String },
    zip: { type: String },
    loginMethod: { type: String }, // password, emailLink
    lastLoginTime: { type: Date },
    isBiometricEnabled: { type: Boolean, default: true },
    datavantMatchStatus: { type: String, default: 'pending' },
    status: { type: String },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    keycloakId: { type: String },
    role: { type: Schema.Types.ObjectId, ref: 'Role' },
    pushToken: { type: String },
    notificationSendAt: { type: Date, default: Date.now },
    fhiredPatientId: { type: String },
    apps: [
      {
        app: { type: Schema.Types.ObjectId, ref: 'App' }, // indexing
        consentUpdatedAt: { type: Date, default: Date.now },
        notificationSendAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
        IsFirstNotify: { type: Boolean, default: false },
        consentedMedicalRecords: [
          {
            type: Schema.Types.ObjectId,
            ref: 'MedicalRecord',
          },
        ],
      },
    ],
    notifications: [
      {
        notification: { type: Schema.Types.ObjectId, ref: 'Notification' },
        createdAt: { type: Date, default: Date.now },
        isPushed: { type: Boolean, default: false },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
      },
    ],
  },
  { collection: 'users' }
);

module.exports = mongoose.model('User', user);
