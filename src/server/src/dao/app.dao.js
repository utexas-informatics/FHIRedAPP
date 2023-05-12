var apps = require('../models/app');
var logger = require('../config/logger');
var defaultFields = require('.');

var createApp = async function (req, res) {
  logger.info(`app : dao : createApp : received request`);
  try {
    const app = await apps.create({
      ...req.body,
      createdBy: res.locals.userId,
      updatedBy: res.locals.userId,
    });
    if (app) {
      return app;
    }
    throw new Error(`Error while creating app`);
  } catch (e) {
    logger.error(`app : dao : createApp : Error : ${e}`);
    throw e;
  }
};

var getAllApps = async function (req) {
  logger.info(`app : dao : getAllApps : received request`);
  try {
    return await apps.find({ ...defaultFields });
  } catch (e) {
    logger.error(`app : dao : getAllApps : Error : ${e}`);
    throw e;
  }
};
var appList = async function (req) {
  logger.info(`app : dao : appList : received request`);
  try {
    return await apps.find({ ...defaultFields }, { appName: 1 });
  } catch (e) {
    logger.error(`app : dao : appList : Error : ${e}`);
    throw e;
  }
};

var getAppById = async function (req) {
  logger.info(`app : dao : getAppById : received request`);
  try {
    const app = await apps.findById(req.params.id).populate('medicalRecords');
    if (app) {
      return app;
    }
    throw new Error(`app with id ${req.params.id} not found`);
  } catch (e) {
    logger.error(`app : dao : getAppById : Error : ${e}`);
    throw e;
  }
};

var updateApp = async function (req, res) {
  logger.info(`app : dao : updateApp : received request`);
  try {
    const app = await apps.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
        updatedAt: new Date(),
        updatedBy: res.locals.userId,
      },
      {
        new: true,
      }
    );
    if (app) {
      return app;
    }
    throw new Error(`Error while updating app ${req.params.id}`);
  } catch (e) {
    logger.error(`app : dao : updateApp : Error : ${e}`);
    throw e;
  }
};

var getAppByName = async function (appname) {
  logger.info(`app : dao : getAppByName : received request ${appname}`);
  try {
    const app = await apps.findOne({ appName: appname });
    if (app) {
      return app;
    }
    throw new Error(`app with name ${appname} not found`);
  } catch (e) {
    logger.error(`app : dao : getAppByName : Error : ${e}`);
    throw e;
  }
};

module.exports.createApp = createApp;
module.exports.getAllApps = getAllApps;
module.exports.getAppById = getAppById;
module.exports.updateApp = updateApp;
module.exports.getAppByName = getAppByName;
module.exports.appList = appList;
