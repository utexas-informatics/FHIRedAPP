var inviteCodes = require('../models/invite-code');
var logger = require('../config/logger');
var defaultFields = require('.');
var { createAudit } = require('../services/audit.service');
const notificationService = require('../services/notification.service');
var crypto = require('crypto');

function generateInviteCode(length) {
  const LOWERCASE_ALPHABET = ''; // 'abcdefghijklmnopqrstuvwxyz' 26 chars
  const NUMBERS = '0123456789'; // 10 chars
  const alphabet = LOWERCASE_ALPHABET + NUMBERS;

  var invCode = crypto.randomBytes(length);
  // var invCode = crypto.randomInt(99999, 999999),
  var randomCode = '';

  for (var i = 0; i < length; i++) {
    invCode[i] = invCode[i] % alphabet.length;
    randomCode += alphabet[invCode[i]];
  }
  return randomCode;
}

var createInviteCode = async function (req, res) {
  logger.info(`inviteCode : dao : createInviteCode : received request`);
  try {
    var breakloop = true;
    while (breakloop) {
      var inviteCode = generateInviteCode(6);

      const resp = await inviteCodes.find({ code: inviteCode });
      if (!resp.length) {
        breakloop = false;
      }
    }
    const docs = await inviteCodes.findOneAndUpdate(
      { patientEmail: req.body.codes[0].patientEmail },
      {
        code: inviteCode,
        patientEmail: req.body.codes[0].patientEmail,
        // approverEmail: req.body.codes[0].approverEmail,
        createdBy: res.locals.adminId,
        updatedBy: res.locals.adminId,
        updatedAt: Date.now(),
      }
    );
    if (docs) {
      await notificationService.generateNotification(
        {
          ...req,
          type: 'InvitationCode',
          body: {
            ...req.body,
            documentId: docs._id,
            recipients: { to: ['fhiredapp-recruiter@utlists.utexas.edu'] },
            data: { redirect: 'notification' },
          },
        },
        res,
        {
          patientEmail: req.body.codes[0].patientEmail,
          inviteCode: inviteCode,
        }
      );
      createAudit({
        system: 'LEAP',
        action: 'InvitationCodeUpdate',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'studyCoordinatorId', value: res.locals.adminId },
          { name: 'patientEmail', value: req.body.codes[0].patientEmail },
          { name: 'code', value: inviteCode },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'invite code',
        documentId: docs._id,
        change: [],
        createdBy: res.locals.adminId || res.locals.userId,
      });
      return true;
    } else {
      const insertDocs = await inviteCodes.insertMany(
        req.body.codes.map((obj) => ({
          code: inviteCode,
          patientEmail: obj.patientEmail,
          // approverEmail: obj.approverEmail,
          createdBy: res.locals.adminId,
          updatedBy: res.locals.adminId,
        }))
      );
      if (insertDocs.length) {
        await notificationService.generateNotification(
          {
            ...req,
            type: 'InvitationCode',
            body: {
              ...req.body,
              documentId: insertDocs._id,
              recipients: { to: ['fhiredapp-recruiter@utlists.utexas.edu'] },
              data: { redirect: 'notification' },
            },
          },
          res,
          {
            patientEmail: req.body.codes[0].patientEmail,
            inviteCode: inviteCode,
          }
        );
        createAudit({
          system: 'LEAP',
          action: 'InvitePatient',
          actionData: [
            {
              name: 'session_state',
              value: req.headers['session_state']
                ? req.headers['session_state']
                : '',
            },
            { name: 'studyCoordinatorId', value: res.locals.adminId },
            { name: 'patientEmail', value: req.body.codes[0].patientEmail },
            { name: 'code', value: inviteCode },
            { name: 'timestamp', value: new Date() },
          ],
          platform: req.headers['platform'], // TBD - need to get this info from req
          source: req.headers['source'], // TBD - need to get this info from req
          entity: 'invite code',
          documentId: insertDocs[0]._id,
          change: [],
          createdBy: res.locals.adminId || res.locals.userId,
        });
        return true;
      }
    }
    throw new Error(`Error while creating inviteCode`);
  } catch (e) {
    logger.error(`inviteCode : dao : createInviteCode : Error : ${e}`);
    throw e;
  }
};

var getInviteCodeById = async function (req) {
  logger.info(`inviteCode : dao : getInviteCodeById : received request`);
  try {
    const inviteCode = await inviteCodes.findById(req.params.id);
    if (inviteCode) {
      return inviteCode;
    }
    throw new Error(`Invalid invite code`);
  } catch (e) {
    logger.error(`inviteCode : dao : getInviteCodeById : Error : ${e}`);
    throw e;
  }
};

var getStatus = async function (req, res) {
  logger.info(`inviteCode : dao : getStatus : received request`);
  try {
    const inviteCodeDoc = await inviteCodes.findOne({
      code: req.params.code,
      ...defaultFields,
    });
    if (inviteCodeDoc) {
      let isExpired =
        Math.floor(new Date() - new Date(inviteCodeDoc.updatedAt)) <=
        24 * 60 * 60 * 1000;
      createAudit({
        system: 'LEAP',
        action: 'EnterInviteCode',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'code', value: req.params.code },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'],
        source: req.headers['source'],
        entity: 'invite code',
        documentId: inviteCodeDoc._id,
        change: [],
        createdBy: res.locals.adminId || res.locals.userId,
      });

      if (
        !isExpired ||
        inviteCodeDoc.status == 'Inactive' ||
        (inviteCodeDoc.status !== 'Active' &&
          inviteCodeDoc.status !== 'Verified')
      ) {
        createAudit({
          system: 'LEAP',
          action: 'InvalidInviteCode',
          actionData: [
            {
              name: 'session_state',
              value: req.headers['session_state']
                ? req.headers['session_state']
                : '',
            },
            { name: 'code', value: req.params.code },
            { name: 'timestamp', value: new Date() },
          ],
          platform: req.headers['platform'],
          source: req.headers['source'],
          entity: 'invite code',
          documentId: inviteCodeDoc._id,
          change: [],
          createdBy: res.locals.adminId || res.locals.userId,
        });
        return 'expired';
      }
      return inviteCodeDoc.status;
    } else {
      createAudit({
        system: 'LEAP',
        action: 'EnterInviteCode',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'code', value: req.params.code },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'],
        source: req.headers['source'],
        entity: 'invite code',
        documentId: req.params.code,
        change: [],
        createdBy: res.locals.adminId || res.locals.userId,
      });
      createAudit({
        system: 'LEAP',
        action: 'InviteCodeDoesNotExist',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'code', value: req.params.code },
          { name: 'timestamp', value: new Date() },
          { name: 'invite code does not exist' },
        ],
        platform: req.headers['platform'],
        source: req.headers['source'],
        entity: 'invite code',
        documentId: req.params.code,
        change: [],
        createdBy: res.locals.adminId || res.locals.userId,
      });
      throw new Error(
        'This invite code is either invalid or has already been used. Please contact Study Coordinator for further help.'
      );
    }
  } catch (e) {
    logger.error(`inviteCode : dao : getStatus : Error : ${e}`);
    throw e;
  }
};

var updateInviteCode = async function (req, res) {
  logger.info(`inviteCode : dao : updateInviteCode : received request`);
  try {
    const inviteCode = await inviteCodes.findOneAndUpdate(
      { code: req.params.code },
      {
        ...req.body,
        updatedAt: new Date(),
        updatedBy: res.locals.adminId,
      },
      {
        new: true,
      }
    );
    if (inviteCode && req.body.status == 'ConsentAccepted') {
      createAudit({
        system: 'LEAP',
        action: 'AcceptAppConsent',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'approvalEmail', value: inviteCode.approvalEmail },
          { name: 'patientEmail', value: inviteCode.patientEmail },
          { name: 'code', value: inviteCode.code },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'],
        source: req.headers['source'],
        entity: 'app consent',
        documentId: inviteCode._id,
        change: [],
        createdBy: res.locals.adminId || res.locals.userId,
      });
      return true;
    }
    if (inviteCode) return true;
    throw new Error(`Error occurred while updating inviteCode`);
  } catch (e) {
    logger.error(`inviteCode : dao : updateInviteCode : Error : ${e}`);
    throw e;
  }
};
var declineAppConsent = async function (req, res) {
  logger.info(`inviteCode : dao : declineAppConsent : received request`);
  try {
    const response = await inviteCodes.find({ code: req.body.code });

    if (response) {
      createAudit({
        system: 'LEAP',
        action: 'DeclineAppConsent',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'approvalEmail', value: response[0].approvalEmail },
          { name: 'patientEmail', value: response[0].patientEmail },
          { name: 'code', value: response[0].code },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'],
        source: req.headers['source'],
        entity: 'app consent',
        documentId: response[0]._id,
        change: [],
        createdBy: response[0].createdBy,
      });
      return 'declined consent for Fhired App';
    }
    throw new Error(`Error occurred while declining fhired app consent`);
  } catch (e) {
    logger.error(`inviteCode : dao : declineAppConsent : Error : ${e}`);
    throw e;
  }
};

module.exports.createInviteCode = createInviteCode;
module.exports.getStatus = getStatus;
module.exports.getInviteCodeById = getInviteCodeById;
module.exports.updateInviteCode = updateInviteCode;
module.exports.declineAppConsent = declineAppConsent;
