const mongoose = require('mongoose');

const { Schema } = mongoose;

const medicalRecordType = new Schema(
  {
    type: { type: String, required: true },
    description: { type: String, required: true },
    image_url: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
  },
  { collection: 'medicalRecordTypes' }
);

module.exports = mongoose.model('MedicalRecordType', medicalRecordType);
