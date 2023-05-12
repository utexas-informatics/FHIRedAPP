var notificationService = require('../services/notification.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var generateNotification = async function (req, res, next) {
  logger.info(
    `notification : controller : generateNotification : received request`
  );
  try {
    var notification = await notificationService.generateNotification(req, res);
    res.json(notification);
  } catch (e) {
    var error = 'Failed to create and send Notification';
    logger.error(
      `notification : controller : generateNotification : Error : ${e}`
    );
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getNotificationById = async function (req, res, next) {
  logger.info(
    `notification : controller : getNotificationById : received request`
  );
  try {
    var notification = await notificationService.getNotificationById(req);
    res.json(notification);
  } catch (e) {
    var error = 'Failed to get Notification';
    logger.error(
      `notification : controller : getNotificationById : Error : ${e}`
    );
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var sendMobileNotification = async function (req, res, next) {
  logger.info(
    `notification : controller : sendMobileNotification : received request`
  );
  try {
    var notification = await notificationService.sendMobileNotification(req, res);
    res.json(notification);
  } catch (e) {
    var error = 'Failed to create and send Notification';
    logger.error(
      `notification : controller : sendMobileNotification : Error : ${e}`
    );
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
}


module.exports.generateNotification = generateNotification;
module.exports.getNotificationById = getNotificationById;
module.exports.sendMobileNotification = sendMobileNotification;

