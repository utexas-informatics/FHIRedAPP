var inviteCodeService = require('../services/invite-code.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var createInviteCode = async function (req, res, next) {
  logger.info(`inviteCode : controller : createInviteCode : received request`);
  try {
    var inviteCode = await inviteCodeService.createInviteCode(req, res);
    res.json(inviteCode);
  } catch (e) {
    var error = 'Failed to create InviteCode';
    logger.error(`inviteCode : controller : createInviteCode : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getStatus = async function (req, res, next) {
  logger.info(`inviteCode : controller : getStatus : received request`);
  try {
    var result = await inviteCodeService.getStatus(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to verify InviteCode';
    logger.error(`inviteCode : controller : getStatus : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getInviteCodeById = async function (req, res, next) {
  logger.info(
    `inviteCode : controller : getInviteCodeById : received request : id : ${req.params.id}`
  );
  try {
    var inviteCode = await inviteCodeService.getInviteCodeById(req, res);
    res.json(inviteCode);
  } catch (e) {
    var error = 'Failed to get InviteCode';
    logger.error(`inviteCode : controller : getInviteCodeById : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var updateInviteCode = async function (req, res, next) {
  logger.info(`inviteCode : controller : updateInviteCode : received request`);
  try {
    var inviteCode = await inviteCodeService.updateInviteCode(req, res);
    logger.info(
      `inviteCode : controller : updateInviteCode : inviteCode updated`
    );
    res.json(inviteCode);
  } catch (e) {
    var error = 'Failed to update InviteCode';
    logger.error(`inviteCode : controller : updateInviteCode : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};
var declineAppConsent = async function (req, res, next) {
  logger.info(`inviteCode : controller : declineAppConsent : received request`);
  try {
    var response = await inviteCodeService.declineAppConsent(req, res);
    logger.info(
      `inviteCode : controller : declineAppConsent : consent declined for FhiredApp`
    );
    res.json(response);
  } catch (e) {
    var error = 'Failed to decline consent';
    logger.error(`inviteCode : controller : updateInviteCode : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.createInviteCode = createInviteCode;
module.exports.getStatus = getStatus;
module.exports.getInviteCodeById = getInviteCodeById;
module.exports.updateInviteCode = updateInviteCode;
module.exports.declineAppConsent = declineAppConsent;
