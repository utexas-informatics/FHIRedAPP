var express = require('express');
const { validate, Joi } = require('express-validation');
const auditController = require('../controllers/audit.controller');

var router = express.Router();

const validationSchema = {
  verify: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
    body: Joi.object({
      action: Joi.string().required(),
      actionData: Joi.array()
        .items({
          name: Joi.string().required(),
          value: Joi.string().required(),
        })
        .optional(),
      entity: Joi.string().required(),
      change: Joi.array().items({}).default([]).optional(),
      createdBy: Joi.string().optional(),
    }).required(),
  },
};

router.post(
  '/generateAudit',
  validate(validationSchema.verify, {}, {}),
  auditController.generateAudit
);

module.exports = router;
