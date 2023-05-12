var logger = require('../config/logger');
var audits = require('../models/audit-models/audit');

var createAudit = async function (auditData) {
  logger.info(`audit : dao : createAudit : received request`);
  try {
    const audit = await audits.create({
      ...auditData,
    });
    if (audit) {
      return audit;
    }
    throw new Error(`Error while creating audit`);
  } catch (e) {
    logger.error(`audit : dao : createAudit : Error : ${e}`);
    throw e;
  }
};
module.exports.createAudit = createAudit;
