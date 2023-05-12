var logger = require('../config/logger');
var auditDAO = require('../dao/audit.dao');
var auditTypes = require('../models/audit-models/audit-type');

var createAudit = async function (req, res) {
  logger.info(`audit : service : createAudit : received request`);
  try {
    const auditType = await auditTypes.findOne({ name: req.body.action });
    if (auditType && auditType.isActive) {
      var audit = await auditDAO.createAudit({
        ...req.body,
        action: auditType._id,
      });
      return audit._id;
    }
    logger.info(
      `audit : service : createAudit : audit type '${req.body.action}' not found or inactive`
    );
    return null;
  } catch (e) {
    logger.error(`audit : service : createAudit : Error : ${e}`);
    throw e;
  }
};

module.exports.createAudit = createAudit;
