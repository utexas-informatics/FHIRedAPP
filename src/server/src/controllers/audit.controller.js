var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');
var { createAudit } = require('../services/audit.service');

var generateAudit = async function (req, res, next) {
  logger.info(`audit : controller : generateAudit : received request`);
  try {
    var response = await createAudit({
      system: 'LEAP',
      action: req.body.action,
      actionData: [
        ...req.body.actionData,
        {
          name: 'session_state',
          value: req.headers['session_state']
            ? req.headers['session_state']
            : '',
        },
        { name: 'timestamp', value: new Date() },
      ],
      platform: req.headers['platform'], // TBD - need to get this info from req
      source: req.headers['source'], // TBD - need to get this info from req
      entity: req.body.entity,
      documentId: req.body.createdBy || res.locals.userId,
      change: [...req.body.change],
      createdBy: req.body.createdBy || res.locals.userId,
    });
    res
      .status(200)
      .json({ message: 'audit created successfully', _id: response });
  } catch (e) {
    var error = 'Failed to create custom Audit';
    logger.error(`audit : controller : generateAudit : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

module.exports.generateAudit = generateAudit;
