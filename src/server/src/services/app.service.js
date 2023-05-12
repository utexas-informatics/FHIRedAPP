var appDAO = require('../dao/app.dao');
var logger = require('../config/logger');

var createApp = async function (req, res) {
  logger.info(`app : service : createApp : received request`);
  try {
    var app = await appDAO.createApp(req, res);
    return app;
  } catch (e) {
    logger.error(`app : service : createApp : Error : ${e}`);
    throw e;
  }
};

var getApps = async function (req) {
  logger.info(`app : service : getApps : received request`);

  try {
    var apps = await appDAO.getAllApps(req);
    return apps;
  } catch (e) {
    logger.error(`app : service : getApps : Error : ${e}`);
    throw e;
  }
};

var appList = async function (req) {
  logger.info(`app : service : appList : received request`);

  try {
    var apps = await appDAO.appList(req);
    return apps;
  } catch (e) {
    logger.error(`app : service : appList : Error : ${e}`);
    throw e;
  }
};

var getAppById = async function (req) {
  logger.info(`app : service : getAppById : received request`);

  try {
    var app = await appDAO.getAppById(req);
    return app;
  } catch (e) {
    logger.error(`app : service : getAppById : Error : ${e}`);
    throw e;
  }
};

var updateApp = async function (req, res) {
  logger.info(`app : service : updateApp : received request`);
  try {
    var app = await appDAO.updateApp(req, res);
    return app;
  } catch (e) {
    logger.error(`app : service : updateApp : Error : ${e}`);
    throw e;
  }
};

module.exports.createApp = createApp;
module.exports.getApps = getApps;
module.exports.getAppById = getAppById;
module.exports.updateApp = updateApp;
module.exports.appList = appList;
