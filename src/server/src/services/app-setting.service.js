var appSettingDAO = require('../dao/app-setting.dao');
var logger = require('../config/logger');

var createAppSetting = async function (req, res) {
  logger.info(`appSetting : service : createAppSetting : received request`);
  try {
    var appSetting = await appSettingDAO.createAppSetting(req, res);
    return appSetting;
  } catch (e) {
    logger.error(`appSetting : service : createAppSettting : Error : ${e}`);
    throw e;
  }
};

var getAppSetting = async function (req) {
  logger.info(`appSetting : service : getAppSetting : received request`);
  try {
    var appSettings = await appSettingDAO.getAppSettings(req);
    return appSettings;
  } catch (e) {
    logger.error(`appSetting : service : getAppSetting : Error : ${e}`);
    throw e;
  }
};

var getAppSettingById = async function (req) {
  logger.info(`appSetting : service : getAppSettingById : received request`);
  try {
    var appSetting = await appSettingDAO.getAppSettingById(req);
    return appSetting;
  } catch (e) {
    logger.error(`appSetting : service : getAppSettingById : Error : ${e}`);
    throw e;
  }
};

var updateAppSetting = async function (req, res) {
  logger.info(`appSetting : service : updateAppSetting : received request`);
  try {
    var appSetting = await appSettingDAO.updateAppSettings(req, res);
    return appSetting;
  } catch (e) {
    logger.error(`appSetting : service : updateAppSetting : Error : ${e}`);
    throw e;
  }
};

var deleteAppSetting = async function (req, res) {
  logger.info(`appSetting : service : deleteAppSetting : received request`);
  try {
    return await appSettingDAO.deleteAppSetting(req, res);
  } catch (e) {
    logger.error(`appSetting : service : deleteAppSetting : Error : ${e} `);
    throw e;
  }
};

module.exports.createAppSetting = createAppSetting;
module.exports.getAppSetting = getAppSetting;
module.exports.getAppSettingById = getAppSettingById;
module.exports.updateAppSetting = updateAppSetting;
module.exports.deleteAppSetting = deleteAppSetting;
