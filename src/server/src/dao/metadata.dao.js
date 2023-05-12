var metadatas = require('../models/metadata');
var logger = require('../config/logger');
var defaultFields = require('.');

var getLeapConsentPolicy = async function () {
  logger.info(`metadata : dao : getLeapConsentPolicy : received request`);
  try {
    const metadata = await metadatas.findOne({
      type: 'LEAP',
      ...defaultFields,
    });
    if (metadata) {
      return {consentPolicy_en:metadata.consentPolicy_en,consentPolicy_sp:metadata.consentPolicy_sp};
    }
    throw new Error(`metadata with type 'LEAP' not found`);
  } catch (e) {
    logger.error(`leapMetadata : dao : getLeapConsentPolicy : Error : ${e}`);
    throw e;
  }
};

module.exports.getLeapConsentPolicy = getLeapConsentPolicy;
