const mongoose = require('mongoose');

const { Schema } = mongoose;

const auditType = new Schema(
  {
    name: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
  },
  { collection: 'auditTypes' }
);

const auditConnection = mongoose.connection.useDb('audit', { useCache: true });
module.exports = auditConnection.model('AuditType', auditType);
