/* eslint-disable newline-per-chained-call */
const express = require('express');
const { validate, Joi } = require('express-validation');

const router = express.Router();
const userController = require('../controllers/user.controller');
var grantAccess = require('../authorization');
const kc = require('../config/keycloak-config.js').getKeycloak();

const validationSchema = {
  getNotificationsByUserId: {
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      page: Joi.number().integer().min(0).empty('').allow(null),
      size: Joi.number().integer().min(0).empty('').allow(null),
      appId: Joi.string().empty('').allow(null),
    }),
  },
  markNotificationAsRead: {
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      notificationId: Joi.string().required(),
    }),
  },
  magicLink: {
    body: Joi.object({
      email: Joi.string().required(),
    }),
  },
  getTokensFromHashkey: {
    params: Joi.object({
      hashkey: Joi.string().required(),
    }),
  },
};

router.post(
  '/',
  kc.enforcer(['createUser']),
  grantAccess('createUser', kc),
  userController.createUser
);

router.post(
  '/magicLink',
  validate(validationSchema.magicLink, {}, {}),
  userController.magicLink
);
router.post('/login', userController.login);
router.post('/signup', userController.signup);

router.get(
  '/byEmailId/:emailId',
  kc.enforcer(['getUserByEmailId']),
  grantAccess('getUserByEmailId', kc),
  userController.getUserByEmailId
);
router.get('/byEVC/:code', userController.getUserByEVC);
router.get(
  '/:id',
  kc.enforcer(['getUserById']),
  grantAccess('getUserById', kc),
  userController.getUserById
);
router.put(
  '/:id',
  kc.enforcer(['updateUser']),
  grantAccess('updateUser', kc),
  userController.updateUser
);
router.put('/activateSignup/:id', userController.updateUser);
router.put(
  '/:id/acceptConsent',
  kc.enforcer(['acceptConsent']),
  grantAccess('acceptConsent', kc),
  userController.acceptConsent
);
router.put(
  '/:id/revokeConsent',
  kc.enforcer(['revokeConsent']),
  grantAccess('revokeConsent', kc),
  userController.revokeConsent
);
router.get(
  '/:id/apps',
  kc.enforcer(['getAppsByUserId']),
  grantAccess('getAppsByUserId', kc),
  userController.getAppsByUserId
);
router.get(
  '/:id/notifications',
  kc.enforcer(['getNotificationsByUserId']),
  grantAccess('getNotificationsByUserId', kc),
  validate(validationSchema.getNotificationsByUserId, {}, {}),
  userController.getNotificationsByUserId
);
router.put(
  '/:id/markNotificationAsRead',
  kc.enforcer(['markNotificationAsRead']),
  grantAccess('markNotificationAsRead', kc),
  validate(validationSchema.markNotificationAsRead, {}, {}),
  userController.markNotificationAsRead
);

router.post('/verify', userController.verifyUser);
router.post('/logout', userController.logout);

router.get('/forgot/:emailId', userController.forgotPassword);
router.post('/setNewPassword', userController.setNewPassword);
router.post('/getBiometricAccessToken', userController.getBiometricAccessToken);
router.post('/datavantMatchStatus', userController.datavantMatchStatus);
router.post(
  '/userSurvey',
  kc.enforcer(['broadcastUserFeedbackSurvey']),
  grantAccess('broadcastUserFeedbackSurvey', kc),
  userController.userSurvey
);
router.get('/getTokensFromHashkey/:hashkey', userController.getTokenByHashkey);
router.get(
  '/get/getAllUsers',
  kc.enforcer(['getAllUsers']),
  userController.getAllUsers
);

router.post(
  '/getFhirPatientId',
  kc.enforcer(['getFhirPatientId']),
  grantAccess('getFhirPatientId', kc),
  userController.getCrosswalkID
);
module.exports = router;
