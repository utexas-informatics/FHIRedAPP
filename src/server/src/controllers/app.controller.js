var appService = require('../services/app.service');
var userService = require('../services/user.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');
var btoa = require('btoa');
var createApp = async function (req, res, next) {
  logger.info(`app : controller : createApp : received request`);
  try {
    var app = await appService.createApp(req, res);
    const userResponse = await userService.addNewAppToAllPatients(
      req,
      res,
      app
    );

    res.json(app);
  } catch (e) {
    var error = 'Failed to create App';
    logger.error(`app : controller : createApp : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getApps = async function (req, res, next) {
  logger.info(`app : controller : getApps : received request`);
  try {
    var apps = await appService.getApps(req);
    res.json(apps);
  } catch (e) {
    var error = 'Failed to get Apps';
    logger.error(`app : controller : getApps : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var appList = async function (req, res, next) {
  logger.info(`app : controller : appList : received request`);
  try {
    var apps = await appService.appList(req);
    res.json(apps);
  } catch (e) {
    var error = 'Failed to get Apps';
    logger.error(`app : controller : appList : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getAppById = async function (req, res, next) {
  logger.info(
    `app : controller : getAppById : received request : id : ${req.params.id}`
  );
  try {
    var app = await appService.getAppById(req);
    res.json(app);
  } catch (e) {
    var error = 'Failed to get App';
    logger.error(`app : controller : getAppById : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var updateApp = async function (req, res, next) {
  logger.info(`app : controller : updateApp : received request`);
  try {
    var app = await appService.updateApp(req, res);
    logger.info(`app : controller : updateApp : app updated`);
    res.json(app);
  } catch (e) {
    var error = 'Failed to update App';
    logger.error(`app : controller : updateApp : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};
var getAppRedirectionUrl = async function (req, res, next) {
  logger.info(
    `app : controller : getAppRedirectionUrl : received request : id : ${req.params.id}`
  );
  try {
    var app = await appService.getAppById(req);
    const token = JSON.parse(req.cookies.auth_token)

    let url  =  `${app.appUrl}/${btoa(res.locals.userId)}/${btoa(
      token.refresh_token
    )}`;

    res.json({redirectionURL:url});
  } catch (e) {
    var error = 'Failed to get App';
    logger.error(`app : controller : getAppRedirectionUrl : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.createApp = createApp;
module.exports.getApps = getApps;
module.exports.getAppById = getAppById;
module.exports.updateApp = updateApp;
module.exports.appList = appList;
module.exports.getAppRedirectionUrl=getAppRedirectionUrl;
