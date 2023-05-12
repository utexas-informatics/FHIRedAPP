var evcService = require('../services/email-verification-code.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var verify = async function (req, res, next) {
  logger.info(`emailVerificationCode : controller : verify : received request`);
  try {
    var result = await evcService.verify(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to verify emailVerificationCode';
    logger.error(`emailVerificationCode : controller : verify : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.verify = verify;
