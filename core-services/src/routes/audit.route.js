var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var auditController = require('../controllers/audit.controller');

const validationSchema = {
  createAudit: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
    body: Joi.object({
      system: Joi.string().required(),
      action: Joi.string().required(),
      actionData: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          value: Joi.string().allow(null).allow(''),
        })
      ),
      platform: Joi.string().required(),
      source: Joi.string().required(),
      entity: Joi.string().required(),
      documentId: Joi.string().required(),
      change: Joi.array().items(
        Joi.object({
          fieldName: Joi.string().required(),
          oldValue: Joi.string().allow(null).allow(''),
          newValue: Joi.string().allow(null).allow(''),
        })
      ),
      createdBy: Joi.string().required(),
    }).required(),
  },
};

router.post(
  '/',
  validate(validationSchema.createAudit, {}, {}),
  auditController.createAudit
);

module.exports = router;
