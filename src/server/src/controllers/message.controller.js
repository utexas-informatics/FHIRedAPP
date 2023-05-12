var messageService = require('../services/message.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var createThread = async function (req, res, next) {
  try {
    var message = await messageService.createThread(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get message';
    logger.error(`message : controller : createThread : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var createChat = async function (req, res, next) {
  try {
    logger.info(
      `message : controller : createChat : received request : id : ${req.params.id}`
    );
    var message = await messageService.createChat(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get message';
    logger.error(`message : controller : createChat : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getThreads = async function (req, res, next) {
  try {
    logger.info(`message : controller : getThreads : received request`);
    var message = await messageService.getThreads(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get message';
    logger.error(`message : controller : getThreads : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getParticipants = async function (req, res, next) {
  try {
    logger.info(
      `message : controller : getParticipants : received request : id : ${req.params.id}`
    );
    var message = await messageService.getParticipants(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get message';
    logger.error(`message : controller : getParticipants : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var updateThread = async function (req, res, next) {
  try {
    logger.info(
      `message : controller : updateThread : received request : id : ${req.params.id}`
    );
    var message = await messageService.updateThread(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get message';
    logger.error(`message : controller : updateThread : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var markAsRead = async function (req, res, next) {
  try {
    logger.info(
      `message : controller : markAsRead : received request : id : ${req.params.id}`
    );
    var message = await messageService.markAsRead(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get message';
    logger.error(`message : controller : markAsRead : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getChats = async function (req, res, next) {
  try {
    logger.info(
      `message : controller : getChats : received request : id : ${req.params.id}`
    );
    var message = await messageService.getChats(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get message';
    logger.error(`message : controller : getChats : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var unreadCount = async function (req, res, next) {
  try {
    logger.info(
      `message : controller : unreadCount : received request : id : ${req.params.id}`
    );
    var message = await messageService.unreadCount(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get unread count';
    logger.error(`message : controller : unreadCount : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var titleSearch = async function (req, res, next) {
  try {
    logger.info(`message : controller : titleSearch : received request`);
    var message = await messageService.titleSearch(req, res);
    res.json(message);
  } catch (e) {
    var error = 'Failed to get unread count';
    logger.error(`message : controller : titleSearch : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.createThread = createThread;
module.exports.createChat = createChat;
module.exports.updateThread = updateThread;
module.exports.getThreads = getThreads;
module.exports.getParticipants = getParticipants;
module.exports.markAsRead = markAsRead;
module.exports.getChats = getChats;
module.exports.unreadCount = unreadCount;
module.exports.titleSearch = titleSearch;
