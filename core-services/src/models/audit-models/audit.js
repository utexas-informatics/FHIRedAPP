const mongoose = require('mongoose');

const { Schema } = mongoose;

const actionDataSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String },
});

const changeSchema = new Schema({
  fieldName: { type: String, required: true },
  oldValue: { type: String },
  newValue: { type: String },
});

const audit = new Schema(
  {
    system: { type: String, required: true }, // LEAP, SHIP
    action: { type: Schema.Types.ObjectId, ref: 'AuditType' },
    actionData: [actionDataSchema], // audit specific data
    platform: { type: String, required: true }, // mobile, web
    source: { type: String, required: true }, // deviceId, ip
    entity: { type: String, required: true },
    documentId: { type: String, required: true },
    change: [changeSchema],
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { collection: 'audits' }
);

const auditConnection = mongoose.connection.useDb('audit', { useCache: true });
module.exports = auditConnection.model('Audit', audit);
