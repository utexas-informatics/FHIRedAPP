const mongoose = require('mongoose');

const { Schema } = mongoose;

const notification = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    app: { type: Schema.Types.ObjectId, ref: 'App' },
    type: {
      type: Schema.Types.ObjectId,
      ref: 'NotificationType',
    },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    meta: { type: Object },
  },
  { collection: 'notifications' }
);

module.exports = mongoose.model('Notification', notification);
