var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var medicalRecordTpController = require('../controllers/medical-record-type.controller');

const validationSchema = {
    createMedicalRecordType: {
      headers: Joi.object({
        authorization: Joi.string()
      }).unknown(),
      body: Joi.object({
          type: Joi.string()
          .min(5)
          .required(),
          description: Joi.string()
          .min(5)
          .optional(),
          image_url: Joi.string()
          .min(5)
          .required(),
          isDeleted: Joi.bool()
          .optional(),
          isActive: Joi.bool()
          .optional(),
      }).required(),
    }
  };



router.post(
    '/',
    validate(validationSchema.createMedicalRecordType, {}, {}),
    medicalRecordTpController.createMedicalRecordType
  );
  router.get(
    '/',
    // validate(validationSchema.getStatus, {}, {}),
    medicalRecordTpController.getMedicalRecordTypes
  );
  router.put(
    '/:id',
    // validate(validationSchema.updateInviteCode, {}, {}),
    medicalRecordTpController.updateMedicalRecordType
  );

  module.exports = router;