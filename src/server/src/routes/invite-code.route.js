var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var inviteCodeController = require('../controllers/invite-code.controller');

const validationSchema = {
  createInviteCode: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
    body: Joi.object({
      codes: Joi.array()
        .min(1)
        .items(
          Joi.object({
            patientEmail: Joi.string().required(),
            approverEmail: Joi.string(),
          })
        )
        .required(),
    }).required(),
  },
  getStatus: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
    params: Joi.object({
      code: Joi.string().required(),
    }).required(),
  },
  updateInviteCode: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
    params: Joi.object({
      code: Joi.string().required(),
    }).required(),
    body: Joi.object({
      status: Joi.string().required(),
      code: Joi.string(),
      patientEmail: Joi.string(),
      approverEmail: Joi.string(),
    }).required(),
  },
  getInviteCodeById: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
    params: Joi.object({
      id: Joi.string().required(),
    }).required(),
  },
};

router.post(
  '/',
  validate(validationSchema.createInviteCode, {}, {}),
  inviteCodeController.createInviteCode
);
router.get(
  '/getStatus/:code',
  validate(validationSchema.getStatus, {}, {}),
  inviteCodeController.getStatus
);
router.put(
  '/:code',
  validate(validationSchema.updateInviteCode, {}, {}),
  inviteCodeController.updateInviteCode
);
router.get(
  '/:id',
  validate(validationSchema.getInviteCodeById, {}, {}),
  inviteCodeController.getInviteCodeById
);
router.post(
  '/declineAppConsent',
  // validate(validationSchema.getInviteCodeById, {}, {}),
  inviteCodeController.declineAppConsent
);

module.exports = router;
