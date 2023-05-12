const mongoose = require('mongoose');

const { Schema } = mongoose;

const magicLink = new Schema(
  {
    hashKey: { type: String, required: true },
    email: { type: String, required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, default: false },
    id_token: { type: String, default: false },
    session_state: { type: String, default: false },
    createdAt: { type: Date, default: Date.now },
    sessionTimeout: { type: Number, default: 300 },
  },
  { collection: 'magicLink' }
);

module.exports = mongoose.model('MagicLink', magicLink);
