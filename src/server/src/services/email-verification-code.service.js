var evcDAO = require('../dao/email-verification-code.dao');
var logger = require('../config/logger');

var verify = async function (req, res) {
  logger.info(`emailVerificationCode : service : verify : received request`);
  try {
    var result = await evcDAO.verify(req, res);
    return result;
  } catch (e) {
    logger.error(`emailVerificationCode : service : verify : Error : ${e}`);
    throw e;
  }
};

module.exports.verify = verify;
