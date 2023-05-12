var userService = require('../services/user.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var login = async function (req, res, next) {
  logger.info(`user : controller : login : received request`);
  try {
    var result = await userService.login(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to login user';
    logger.error(`user : controller : login : Error : ${e}`);
    if (e.message.includes(401)) {
      error = 'Unauthorized login user';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var savePassword = async function (req, res, next) {
  logger.info(`user : controller : savePassword : received request`);
  try {
    var result = await userService.savePassword(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to save password';
    logger.error(`user : controller : savePassword : Error : ${e}`);
    if (e.message.includes(401)) {
      error = 'Unauthorized login user';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var signup = async function (req, res, next) {
  logger.info(`user : controller : signup : received request`);
  try {
    var result = await userService.signup(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to signup user';
    logger.error(`user : controller : signup : Error : ${e}`);
    if (e.message.includes(409)) {
      error = 'User exists with same username';
      next(errorResponse.build(constants.error.conflict, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var getUserInfoByToken = async function (req, res, next) {
  logger.info(`user : controller : getUserInfoByToken : received request`);
  try {
    var result = await userService.getUserInfoByToken(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to getUserInfoByToken';
    logger.error(`user : controller : getUserInfoByToken : Error : ${e}`);
    if (e.message.includes(401)) {
      error = 'Unauthorized login user';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var logout = async function (req, res, next) {
  logger.info(`user : controller : logout : received request`);
  try {
    var result = await userService.logout(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to logout user';
    logger.error(`user : controller : logout : Error : ${e}`);
    if (e.message.includes(401)) {
      error = 'Unauthorized login user';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var exchangeToken = async function (req, res, next) {
  logger.info(`user : controller : exchangeToken : received request`);
  try {
    var result = await userService.exchangeToken(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to exchangeToken user';
    logger.error(`user : controller : exchangeToken : Error : ${e}`);
    if (e.message.includes(401)) {
      error = 'Unauthorized login user';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var refreshToken = async function (req, res, next) {
  logger.info(`user : controller : refreshToken : received request`);
  try {
    var result = await userService.refreshToken(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to get refresh token';
    logger.error(`user : controller : refreshToken : Error : ${e}`);
    if (e.message.includes(401)) {
      error = 'Unauthorized login user';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var exchangeUser = async function (req, res, next) {
  logger.info(`user : controller : exchangeUser : received request`);
  try {
    var result = await userService.exchangeUser(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to get exchangeUser token';
    logger.error(`user : controller : exchangeUser : Error : ${e}`);
    if (e.message.includes(401)) {
      error = 'Unauthorized login user';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

module.exports.login = login;
module.exports.signup = signup;
module.exports.getUserInfoByToken = getUserInfoByToken;
module.exports.logout = logout;
module.exports.savePassword = savePassword;
module.exports.exchangeToken = exchangeToken;
module.exports.refreshToken = refreshToken;
module.exports.exchangeUser = exchangeUser;
