var metadataDAO = require('../dao/metadata.dao');
var logger = require('../config/logger');

var getLeapConsentPolicy = async function () {
  logger.info(`metadata : service : getLeapConsentPolicy : received request`);

  try {
    var leapConsentPolicy = await metadataDAO.getLeapConsentPolicy();
    return leapConsentPolicy;
  } catch (e) {
    logger.error(`metadata : service : getLeapConsentPolicy : Error : ${e}`);
    throw e;
  }
};

module.exports.getLeapConsentPolicy = getLeapConsentPolicy;
