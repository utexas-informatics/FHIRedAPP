var metadataService = require('../services/metadata.service');
var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');

var getLeapConsentPolicy = async function (req, res, next) {
  logger.info(
    `metadata : controller : getLeapConsentPolicy : received request : id : ${req.params.id}`
  );
  try {
    var leapConsentPolicy = await metadataService.getLeapConsentPolicy();
    res.json(leapConsentPolicy);
  } catch (e) {
    var error = 'Failed to get LEAP Consent Policy';
    logger.error(`metadata : controller : getLeapConsentPolicy : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.getLeapConsentPolicy = getLeapConsentPolicy;
