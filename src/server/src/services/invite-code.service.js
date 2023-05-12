var inviteCodeDAO = require('../dao/invite-code.dao');
var logger = require('../config/logger');

var createInviteCode = async function (req, res) {
  logger.info(`inviteCode : service : createInviteCode : received request`);
  try {
    var inviteCode = await inviteCodeDAO.createInviteCode(req, res);
    return inviteCode;
  } catch (e) {
    logger.error(`inviteCode : service : createInviteCode : Error : ${e}`);
    throw e;
  }
};

var getStatus = async function (req, res) {
  logger.info(`inviteCode : service : getStatus : received request`);
  try {
    var result = await inviteCodeDAO.getStatus(req, res);
    return result;
  } catch (e) {
    logger.error(`inviteCode : service : getStatus : Error : ${e}`);
    throw e;
  }
};

var getInviteCodeById = async function (req, res) {
  logger.info(`inviteCode : service : getInviteCodeById : received request`);

  try {
    var inviteCode = await inviteCodeDAO.getInviteCodeById(req, res);
    return inviteCode;
  } catch (e) {
    logger.error(`inviteCode : service : getInviteCodeById : Error : ${e}`);
    throw e;
  }
};

var updateInviteCode = async function (req, res) {
  logger.info(`inviteCode : service : updateInviteCode : received request`);
  try {
    var inviteCode = await inviteCodeDAO.updateInviteCode(req, res);
    return inviteCode;
  } catch (e) {
    logger.error(`inviteCode : service : updateInviteCode : Error : ${e}`);
    throw e;
  }
};
var declineAppConsent = async function (req, res) {
  logger.info(`inviteCode : service : declineAppConsent : received request`);
  try {
    const response = await inviteCodeDAO.declineAppConsent(req, res);
    return response;
  } catch (e) {
    logger.error(`inviteCode : service : declineAppConsent : Error : ${e}`);
    throw e;
  }
};

module.exports.createInviteCode = createInviteCode;
module.exports.getStatus = getStatus;
module.exports.getInviteCodeById = getInviteCodeById;
module.exports.updateInviteCode = updateInviteCode;
module.exports.declineAppConsent = declineAppConsent;
