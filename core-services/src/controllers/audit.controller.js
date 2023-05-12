var auditService = require('../services/audit.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var createAudit = async function (req, res, next) {
  logger.info(`audit : controller : createAudit : received request`);
  try {
    var result = await auditService.createAudit(req, res);
    res.json(result);
  } catch (e) {
    var error = 'Failed to create audit';
    logger.error(`audit : controller : createAudit : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.createAudit = createAudit;
