var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var metadataController = require('../controllers/metadata.controller');

const validationSchema = {
  getLeapConsentPolicy: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
  },
};

router.get(
  '/getLeapConsentPolicy',
  validate(validationSchema.getLeapConsentPolicy, {}, {}),
  metadataController.getLeapConsentPolicy
);

module.exports = router;
