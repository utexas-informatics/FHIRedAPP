var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var controller = require('../controllers/notification.controller');
var grantAccess = require('../authorization');
const kc = require('../config/keycloak-config.js').getKeycloak();

const validationSchema = {
  generateNotification: {
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    body: Joi.object({
      title: Joi.string().required(),
      message: Joi.string().required(),
      app: Joi.string(),
      type: Joi.string(),
      patients: Joi.array().optional(),
      senderId: Joi.string().optional(),

    }).required(),
  },
  getNotificationById: {
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    params: Joi.object({
      id: Joi.string().required(),
    }).required(),
  },
};

router.post(
  '/',
  kc.enforcer(['generateNotification']),
  grantAccess('generateNotification', kc),
  validate(validationSchema.generateNotification, {}, {}),
  controller.generateNotification
);
router.get(
  '/:id',
  kc.enforcer(['getNotificationById']),
  grantAccess('getNotificationById', kc),
  validate(validationSchema.getNotificationById, {}, {}),
  controller.getNotificationById
);
router.post(
  '/sendMobilePush',
  kc.enforcer(['sendMobileNotification']),
  grantAccess('sendMobileNotification', kc),
  validate(validationSchema.generateNotification, {}, {}),
  controller.sendMobileNotification
);

module.exports = router;
