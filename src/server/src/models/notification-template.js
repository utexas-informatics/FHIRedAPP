const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationTemplate = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    deliveryChannel: {
      type: Schema.Types.ObjectId,
      ref: 'NotificationDeliveryChannel',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
  },
  { collection: 'notificationTemplates' }
);

module.exports = mongoose.model('NotificationTemplate', notificationTemplate);
