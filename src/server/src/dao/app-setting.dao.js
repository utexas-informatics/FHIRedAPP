var appSettings = require('../models/app-setting');
var logger = require('../config/logger');

var createAppSetting = async function (req, res) {
  logger.info(`appSetting : dao : createAppSetting : received request`);
  try {
    const appSetting = await appSettings.create({
      ...req.body,
    });
    if (appSetting) {
      return appSetting;
    }
    throw new Error(`Error while creating app settings`);
  } catch (e) {
    logger.error(`appSetting : dao : createAppSetting : Error : ${e}`);
    throw e;
  }
};

var getAppSettings = async function (req, res) {
  logger.info(`appSetting : dao : getAppSettings : received request`);
  try {
    return await appSettings.find();
  } catch (e) {
    logger.error(`appSetting : dao : getAppSettings : Error : ${e}`);
    throw e;
  }
};

var getAppSettingById = async function (req) {
  logger.info(`appSetting : dao : getAppSettingById : received request`);
  try {
    const appSetting = await appSettings.findById(req.params.id);
    if (appSetting) {
      return appSetting;
    }
    throw new Error(`appSetting with id ${req.params.id} not found`);
  } catch (e) {
    logger.error(`appSetting : dao : getAppSettingById : Error : ${e}`);
    throw e;
  }
};

var updateAppSettings = async function (req, res) {
  logger.info(`appSetting : dao : updateAppSettings : received request`);
  try {
    const appSetting = await appSettings.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );
    if (appSetting) {
      return appSetting;
    }
    throw new Error(`Error while updating app ${req.params.id}`);
  } catch (e) {
    logger.error(`appSetting : dao : updateAppSetting : Error ${e}`);
    throw e;
  }
};

var deleteAppSetting = async function (req, res) {
  logger.info(`appSetting : dao : deleteAppSetting : received request`);
  try {
    const appSetting = await appSettings.deleteOne({ _id: req.params.id });
  } catch (e) {
    logger.error(`appSetting : dao : deleteAppSetting : Error : ${e}`);
    throw e;
  }
};

module.exports.createAppSetting = createAppSetting;
module.exports.getAppSettings = getAppSettings;
module.exports.getAppSettingById = getAppSettingById;
module.exports.updateAppSettings = updateAppSettings;
module.exports.deleteAppSetting = deleteAppSetting;
