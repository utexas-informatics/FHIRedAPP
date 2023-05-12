var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var controller = require('../controllers/patient.controller');

const validationSchema = {
  patientSearch: {
    body: Joi.object({
      iccPatientId: Joi.string().optional(),
      FHIRedAppPatientID: Joi.string().optional(),
    }).required(),
  },
  updateFPDUTUpdateAt: {
    body: Joi.object({
      subKey: Joi.string().required(),
    }).required(),
  },
};

router.post(
  '/searchPatient',
  validate(validationSchema.patientSearch, {}, {}),
  controller.searhcPatient
);

router.post('/datavantMatchStatus', controller.datavantMatchStatus);
router.post(
  '/getPatientsWithNewMedicalRecords',
  controller.getPatientsWithNewMedicalRecords
);
router.put(
  '/updateFPDUTUpdateAt',
  validate(validationSchema.updateFPDUTUpdateAt, {}, {}),
  controller.updateFPDUTUpdateAt
);

module.exports = router;
