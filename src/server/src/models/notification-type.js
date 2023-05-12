const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationType = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    templates: [
      {
        type: Schema.Types.ObjectId,
        ref: 'NotificationTemplate',
        required: true,
      },
    ],
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
  },
  { collection: 'notificationTypes' }
);

module.exports = mongoose.model('NotificationType', notificationType);
