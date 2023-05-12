var appSettingService = require('../services/app-setting.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var createAppSetting = async function (req, res, next) {
  logger.info(`appSetting : controller : createAppSetting : received request`);
  try {
    var appSetting = await appSettingService.createAppSetting(req, res);
    res.json(appSetting);
  } catch (e) {
    var error = 'Failed to create AppSetting';
    logger.error(`appSetting : controller : createAppSetting : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getAppSetting = async function (req, res, next) {
  logger.info(`appSetting : controller : getAppSetting : received request`);
  try {
    var appSetting = await appSettingService.getAppSetting(req);
    res.json(appSetting);
  } catch (e) {
    var error = 'Failed to get AppSettings';
    logger.error(`appSetting : controller : getAppSetting : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getAppSettingById = async function (req, res, next) {
  logger.info(
    `appSetting : controller : getAppSettingById : received request : id : ${req.params.id}`
  );
  try {
    var appSetting = await appSettingService.getAppSettingById(req);
    res.json(appSetting);
  } catch (e) {
    var error = 'Failed to get AppSetting';
    logger.error(`appSetting : controller : getAppSettingById : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var updateAppSetting = async function (req, res, next) {
  logger.info(`appSetting : controller : updateAppSetting : received request`);
  try {
    var appSetting = await appSettingService.updateAppSetting(req, res);
    res.json(appSetting);
  } catch (e) {
    var error = 'Failed to update AppSetting';
    logger.error(`appSetting : controller : updateAppSetting : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var deleteAppSetting = async function (req, res, next) {
  logger.info(`appSetting : controller : deleteAppSetting : recevied request`);
  try {
    var appSetting = await appSettingService.deleteAppSetting(req, res);
    res.json({ message: `appSetting Deleted` });
  } catch (e) {
    var error = `Failed to delete AppSetting`;
    logger.error(`appSetting : controller : deleteAppSetting : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.createAppSetting = createAppSetting;
module.exports.getAppSetting = getAppSetting;
module.exports.getAppSettingById = getAppSettingById;
module.exports.updateAppSetting = updateAppSetting;
module.exports.deleteAppSetting = deleteAppSetting;
