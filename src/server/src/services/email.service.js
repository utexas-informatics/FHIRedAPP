const { post } = require('../config/fetch-wrapper');
const logger = require('../config/logger');
const { coreServicesEndpoints } = require('../config/constants');

var sendEmail = async function (emailData) {
  logger.info(`email : service : sendEmail : received request`);
  try {
    if (
      (emailData.bcc && emailData?.bcc.length > 0) ||
      (emailData.to && emailData?.to.length)
    ) {
      const url = `${process.env.CORE_SERVICES_API_BASE_URL}${coreServicesEndpoints.sendEmail}`;
      const response = await post(url, emailData);
      return response;
    } else return 'email list is empty';
  } catch (e) {
    logger.error(`email : service : sendEmail : Error : ${e}`);
    throw e;
  }
};

module.exports.sendEmail = sendEmail;
