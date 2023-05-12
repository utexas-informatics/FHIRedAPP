var express = require('express');
var router = express.Router();
var fhirController = require('../controllers/fhir.controller');
const { validate, Joi } = require('express-validation');
const kc = require('../config/keycloak-config.js').getKeycloak();

const validationSchema = {
  clinicalData: {
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    body: Joi.object({
      categoryName: Joi.string().required(),
      pageCount: Joi.number().required(),
      // globalPatientId: Joi.string(),
      offset: Joi.number().required(),
      searchText: Joi.string().allow("")
    }).required(),
  }
}
router.post(
    '',
    kc.enforcer(['clinicalData']),
    validate(validationSchema.clinicalData, {}, {}),
    fhirController.clinicalDataByCategory
  );

  module.exports = router;
