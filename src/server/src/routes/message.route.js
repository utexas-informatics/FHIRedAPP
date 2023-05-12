var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var messageController = require('../controllers/message.controller');
var grantAccess = require('../authorization');
const kc = require('../config/keycloak-config.js').getKeycloak();

const validationSchema = {
  unreadCount: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
    }).unknown(),
    query: Joi.object({
      userId: Joi.string().required(),
    }).required(),
  },
  markAsRead: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
    }).unknown(),
    params: Joi.object({
      id: Joi.string().required(),
    }).required(),
    query: Joi.object({
      recipientId: Joi.string().required(),
      senderId: Joi.string().required(),
    }).required(),
  },
  getThreads: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
      openmessage: Joi.string().optional(),
    }).unknown(),
    query: Joi.object({
      userId: Joi.string().required(),
      appId: Joi.string(),
      skip: Joi.string().required(),
      limit: Joi.string().required(),
    }).required(),
  },
  titleSearch: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
    }).unknown(),
    query: Joi.object({
      search: Joi.string().required(),
      userId: Joi.string().required(),
      appId: Joi.string(),
      skip: Joi.string().required(),
      limit: Joi.string().required(),
    }).required(),
  },
  getChats: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
    }).unknown(),
    params: Joi.object({
      id: Joi.string().required(),
    }).required(),
    query: Joi.object({
      recipientId: Joi.string().required(),
      senderId: Joi.string().required(),
      skip: Joi.string().required(),
      limit: Joi.string().required(),
    }).required(),
  },
  getParticipants: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
    }).unknown(),
    params: Joi.object({
      id: Joi.string().required(),
    }).required(),
    query: Joi.object({
      userId: Joi.string().required(),
    }).required(),
  },
  createThread: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
    }).unknown(),
    body: Joi.object({
      app: Joi.string().required(),
      title: Joi.string().required(),
      userName: Joi.string().required(),
      userId: Joi.string().required(),
    }).required(),
  },
  createChat: {
    headers: Joi.object({
      authorization: Joi.string().required(),
      source: Joi.string().required(),
      platform: Joi.string().required(),
    }).unknown(),
    body: Joi.object({
      recipient: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required(),
      }),
      sender: Joi.object()
        .keys({
          id: Joi.string().required(),
          name: Joi.string().required(),
        })
        .optional(),
      body: Joi.string().required(),
    }).required(),
    params: Joi.object({
      id: Joi.string().required(),
    }).required(),
    query: Joi.object({
      skip: Joi.string().required(),
      limit: Joi.string().required(),
      appId: Joi.string().optional(),
    }).required(),
  },
};

router.get(
  '/unreadCount',
  validate(validationSchema.unreadCount, {}, {}),
  kc.enforcer(['unreadCount']),
  grantAccess('unreadCount', kc),
  messageController.unreadCount
);

router.get(
  '/titleSearch',
  validate(validationSchema.titleSearch, {}, {}),
  kc.enforcer(['titleSearch']),
  grantAccess('titleSearch', kc),
  messageController.titleSearch
);

router.post(
  '/',
  validate(validationSchema.createThread, {}, {}),
  kc.enforcer(['createThread']),
  grantAccess('createThread', kc),
  messageController.createThread
);
router.get(
  '/',
  validate(validationSchema.getThreads, {}, {}),
  kc.enforcer(['getThreads']),
  grantAccess('getThreads', kc),
  messageController.getThreads
);
router.get(
  '/:id',
  validate(validationSchema.getChats, {}, {}),
  kc.enforcer(['getChats']),
  grantAccess('getChats', kc),
  messageController.getChats
);
router.put(
  '/:id',
  validate(validationSchema.createChat, {}, {}),
  kc.enforcer(['createChat']),
  grantAccess('createChat', kc),
  messageController.createChat
);
// router.put('/:id', messageController.updateThread);
router.put(
  '/:id/markAsRead',
  validate(validationSchema.markAsRead, {}, {}),
  kc.enforcer(['markAsRead']),
  grantAccess('markAsRead', kc),
  messageController.markAsRead
);
router.get(
  '/:id/participants',
  validate(validationSchema.getParticipants, {}, {}),
  kc.enforcer(['getParticipants']),
  grantAccess('getParticipants', kc),
  messageController.getParticipants
);

module.exports = router;
