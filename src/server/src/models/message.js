const mongoose = require('mongoose');

const { Schema } = mongoose;

const message = Schema(
  {
    app: { type: Schema.Types.ObjectId, ref: 'App' },
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    chats: [
      {
        sender: {
          id: { type: String, required: true }, // indexing
          name: { type: String, required: true },
        },
        recipient: {
          id: { type: String, required: true }, // indexing
          name: { type: String, required: true },
        },
        body: { type: String, required: true },
        postedAt: { type: Date, default: Date.now }, // indexing (-1)
        isDeleted: { type: String, default: false },
        isRead: { type: String, default: false }, // indexing
      },
    ],
  },
  { collection: 'messages' }
);
message.index({ title: 'text' });

module.exports = mongoose.model('Message', message);
