const { post } = require('../config/fetch-wrapper');
const logger = require('../config/logger');
const { coreServicesEndpoints } = require('../config/constants');

var createAudit = async function (auditData) {
  logger.info(`audit : service : createAudit : received request`);
  try {
    const url = `${process.env.CORE_SERVICES_API_BASE_URL}${coreServicesEndpoints.createAudit}`;
    const response = await post(url, auditData);
    return response;
  } catch (e) {
    logger.error(`audit : service : createAudit : Error : ${e}`);
    throw e;
  }
};

module.exports.createAudit = createAudit;
