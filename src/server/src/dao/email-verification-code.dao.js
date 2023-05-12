var moment = require('moment');
var crypto = require('crypto');

var emailVerificationCodes = require('../models/email-verification-code');
var logger = require('../config/logger');
const { createAudit } = require('../services/audit.service');
var defaultFields = require('.');

var create = async function (email, res) {
  logger.info(
    `emailVerificationCode : dao : createEmailVerificationCode : received request`
  );
  try {
    const doc = await emailVerificationCodes.create({
      code: crypto.randomInt(99999, 999999),
      email,
      createdBy: res.locals.adminId,
      updatedBy: res.locals.adminId,
    });
    if (doc) {
      return doc.code;
    }
    throw new Error(`Error while creating emailVerificationCode`);
  } catch (e) {
    logger.error(
      `emailVerificationCode : dao : createEmailVerificationCode : Error : ${e}`
    );
    throw e;
  }
};

var verify = async function (req, res) {
  logger.info(`emailVerificationCode : dao : verify : received request`);
  try {
    const doc = await emailVerificationCodes.findOne({
      code: req.body.code,
      email: req.body.email,
      isActive: true,
      ...defaultFields,
    });
    if (doc) {
      createAudit({
        system: 'LEAP',
        action: 'EnterEmailVerificationCode',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'patientEmail', value: req.body.email },
          { name: 'code', value: req.body.code },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'verify',
        documentId: doc._id,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });
      if (moment().diff(moment(doc.createdAt), 'seconds') > 180) {
        throw new Error(`Verification code expired`);
      }
      return true;
    } else {
      createAudit({
        system: 'LEAP',
        action: 'InvalidEmailVerificationCode',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'patientEmail', value: req.body.email },
          { name: 'code', value: req.body.code },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'verify',
        documentId: req.body.email,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });
      throw new Error(`Invalid verification code`);
    }
  } catch (e) {
    logger.error(`emailVerificationCode : dao : verify : Error : ${e}`);
    throw e;
  }
};

var getByCode = async function (req) {
  logger.info(`emailVerificationCode : dao : get : received request`);
  try {
    if (req.params && req.params.code) {
      var code = Buffer.from(req.params.code, 'base64')
        .toString('ascii')
        .split(':')[1];
      const doc = await emailVerificationCodes.findOne({
        code,
        isActive: true,
        ...defaultFields,
      });
      if (doc) {
        return doc;
      }
    }
    throw new Error(`Could not find verification code`);
  } catch (e) {
    logger.error(`emailVerificationCode : dao : get : Error : ${e}`);
    throw e;
  }
};

var getLatestByEmailInBody = async function (req) {
  logger.info(`emailVerificationCode : dao : get : received request`);
  try {
    // get latest created doc
    const doc = await emailVerificationCodes
      .findOne({
        email: req.body.email,
        isActive: true,
        ...defaultFields,
      })
      .sort({ _id: -1 })
      .limit(1);
    if (doc) {
      return doc;
    }
    throw new Error(`Could not find verification code`);
  } catch (e) {
    logger.error(`emailVerificationCode : dao : get : Error : ${e}`);
    throw e;
  }
};

var updateInviteCode = async function (req, res) {
  logger.info(
    `emailVerificationCode : dao : updateInviteCode : received request`
  );
  try {
    const doc = await emailVerificationCodes.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
        updatedAt: new Date(),
        updatedBy: res.locals.userId,
      },
      {
        new: true,
      }
    );
    if (doc) {
      return doc._id;
    }
    throw new Error(
      `Error while updating emailVerificationCode ${req.params.id}`
    );
  } catch (e) {
    logger.error(
      `emailVerificationCode : dao : updateInviteCode : Error : ${e}`
    );
    throw e;
  }
};

module.exports.create = create;
module.exports.verify = verify;
module.exports.updateInviteCode = updateInviteCode;
module.exports.getByCode = getByCode;
module.exports.getLatestByEmailInBody = getLatestByEmailInBody;
