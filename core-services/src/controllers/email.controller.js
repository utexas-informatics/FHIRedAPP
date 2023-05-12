var emailService = require('../services/email.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var sendEmail = async function (req, res, next) {
  logger.info(`email : controller : sendEmail : received request`);
  try {
    var result = await emailService.sendEmail(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to send email';
    logger.error(`email : controller : sendEmail : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.sendEmail = sendEmail;
