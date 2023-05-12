const users = require('../models/user');
var roles = require('../models/role');
const logger = require('../config/logger');
const appModel = require('../models/app');
const notificationService = require('../services/notification.service');
const { createAudit } = require('../services/audit.service');
const evcDao = require('./email-verification-code.dao');
const inviteCodes = require('../models/invite-code');
const magicLinks = require('../models/magicLinks');

var getUserByEmailId = async function (req, res) {
  logger.info(
    `app : dao User : getUserByEmailId : received request` +
      JSON.stringify(req.body)
  );
  try {
    const emailId = req.params.emailId ? req.params.emailId : req.body.emailId;
    const user = await users
      .findOne({ email: emailId, isDeleted: false })
      .populate('apps.app')
      .populate('role', 'role');
    if (user) {
      return user;
    }
    // validate if new user is invited, verified and accepted consent
    const inviteCodeDoc = await inviteCodes.findOne({
      patientEmail: emailId,
      isDeleted: false,
    });
    if (inviteCodeDoc) {
      switch (inviteCodeDoc.status) {
        case 'Active':
          throw new Error(`User not verified`);
        case 'Verified':
          throw new Error(`User not accepted consent`);
        case 'ConsentAccepted': {
          const code = await evcDao.create(emailId, res);
          if (code) {
            // email verification code to patient
            await notificationService.generateNotification(
              {
                ...req,
                type: 'VerifySignup',
                body: {
                  ...req.body,
                  documentId: inviteCodeDoc._id,
                  recipients: { to: [emailId] },
                  data: { redirect: 'notification' },
                },
              },
              res,
              {
                patientEmail: emailId,
                code,
              }
            );
          }
          break;
        }
        // case 'SignedUp':
        //   console.log('innside case');
        //   const code = await evcDao.create(emailId, res);
        //   if (code) {
        //     // email verification code to patient
        //     await notificationService.generateNotification(
        //       {
        //         ...req,
        //         type: 'forgotPassword',
        //         body: {
        //           ...req.body,
        //           documentId: inviteCodeDoc._id,
        //           recipients: { to: [emailId] },
        //           data: { redirect: 'notification' },
        //         },
        //       },
        //       res,
        //       {
        //         patientEmail: emailId,
        //         code,
        //       }
        //     );
        //   }
        //   break;
        default:
          // SignedUp
          throw new Error(`User signed up but not found`);
      }
    } else {
      throw new Error(`User not invited`);
    }
    throw new Error(`User not found`);
  } catch (e) {
    logger.error(`user : dao : getUserByEmailId : Error : ${e}`);
    throw e;
  }
};

var getUserByEVC = async function (req, res) {
  logger.info(`app : dao User : getUserByEVC : received request`);
  try {
    const evcDoc = await evcDao.getByCode(req);
    if (evcDoc) {
      const user = await users.findOne({
        email: evcDoc.email,
        isDeleted: false,
      });
      if (user) {
        return user;
      }
    }
    throw new Error(`User not found`);
  } catch (e) {
    logger.error(`user : dao : getUserByEVC : Error : ${e}`);
    throw e;
  }
};

var getUserById = async function (req) {
  logger.info(`app : dao User : received request`);
  try {
    const user = await users
      .findById(req.params.id)
      .populate('apps.app')
      .populate('role', 'role');
    if (user) {
      return user;
    }
    throw new Error(`User not found with '${req.params.id}'`);
  } catch (e) {
    logger.error(`user : dao : getUserById : Error : ${e}`);
    throw e;
  }
};

var getAllUsers = async function (req) {
  logger.info(`app : dao getAllUsers : received request`);

  try {
    const usersResponse = await users.find(
      {
        'apps.app': '5fec6f918048d25b1c189a2e',
        'apps.isActive': true,
      },
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        apps: 1,
        birthday: 1,
      }
    );
    const finalResponse = [];
    usersResponse.forEach((user) => {
      const filteredUser = user.apps.filter((item) => {
        return item.app == '5fec6f918048d25b1c189a2e' && item.isActive;
      });
      if (filteredUser.length > 0) {
        finalResponse.push(user);
      }
    });
    if (finalResponse) {
      return finalResponse;
    }
    throw new Error(`Users not found`);
  } catch (e) {
    logger.error(`user : dao : getAllUsers : Error : ${e}`);
    throw e;
  }
};
var addNewAppToAllPatients = async function (req, res, app) {
  logger.info(`app : dao addNewAppToAllPatients : received request`);

  try {
    let obj = {
      isActive: false,
      app: app.id,
      isFirstNotify: false,
      consentedMedicalRecords: app.medicalRecords,
    };
    const userUpadteResponse = await users.updateMany(
      { role: '5ff40cb84f294b73985e3dcc' },
      { $push: { apps: { obj } } }
    );
    if (userUpadteResponse) {
      return userUpadteResponse;
    }
    throw new Error(`Users not found`);
  } catch (e) {
    logger.error(`user : dao :addNewAppToAllPatients: Error : ${e}`);
    throw e;
  }
};

var createUser = async function (req, res) {
  logger.info(`app : dao User : received request`);
  try {
    const inviteCodeDoc = await inviteCodes.findOne({
      patientEmail: req.body.email,
      isDeleted: false,
    });
    const user = await users.create({
      ...req.body,
      inviteCode: inviteCodeDoc ? inviteCodeDoc.code : '',
      role: '5ff40cb84f294b73985e3dcc', //patient role
      createdBy: res.locals.userId || res.locals.adminId,
      updatedBy: res.locals.userId || res.locals.adminId,
    });
    if (user) {
      // audit the action
      createAudit({
        system: 'LEAP',
        action: 'CreateUserAccount',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'PatientId', value: user._id },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'user',
        documentId: user._id,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });
      if (inviteCodeDoc) {
        // update status in invite code doc
        inviteCodeDoc.status = 'SignedUp';
        inviteCodeDoc.updatedAt = new Date();
        inviteCodeDoc.updatedBy = res.locals.adminId;
        await inviteCodeDoc.save();

        // send emails
        const evcDoc = await evcDao.getLatestByEmailInBody(req);
        if (evcDoc) {
          // send email notification to study coordinator to activate signed up user account
          let approverEmail;
          if (inviteCodeDoc.approverEmail) {
            approverEmail = inviteCodeDoc.approverEmail;
          } else {
            // get fallback email id from user with study coordinator role
            const scRole = await roles.findOne({ role: 'StudyCoordinator' });
            if (scRole) {
              const scUser = await users.findOne({ role: scRole._id });
              if (scUser) {
                approverEmail = scUser.email;
              }
            }
          }
          await notificationService.generateNotification(
            {
              ...req,
              type: 'ActivateSignup',
              body: {
                ...req.body,
                documentId: user._id,
                recipients: { to: [approverEmail] },
                data: { redirect: 'notification' },
              },
            },
            res,
            {
              patientEmail: req.body.email,
              code: Buffer.from(`${req.body.email}:${evcDoc.code}`).toString(
                'base64'
              ),
            }
          );
        }
        // send email notification to patient informing account is awaiting approval
        await notificationService.generateNotification(
          {
            ...req,
            type: 'SignupPendingApproval',
            body: {
              ...req.body,
              documentId: user._id,
              recipients: { to: [req.body.email] },
              data: { redirect: 'notification' },
            },
          },
          res,
          {
            patientEmail: req.body.email,
          }
        );
      }
      return user;
    }
    throw new Error(`Error while creating user`);
  } catch (e) {
    logger.error(`user : dao : createUser : Error : ${e}`);
    throw e;
  }
};

var updateUser = async function (req, res) {
  logger.info(`user : dao : updateUser : received request`);
  try {
    const oldUser = await users.findById(req.params.id);
    if (oldUser) {
      const user = await users.findOneAndUpdate(
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
      if (user) {
        // audit the action for approve signup
        if (oldUser.status === 'PendingApproval' && user.status === 'Active') {
          // send email notification to patient on approval
          await notificationService.generateNotification(
            {
              ...req,
              type: 'SignupApproved',
              body: {
                ...req.body,
                documentId: user._id,
                recipients: { to: [user.email] },
                data: { redirect: 'notification' },
              },
            },
            res,
            {}
          );
        }
        if (req.body.status == 'Active') {
          createAudit({
            system: 'LEAP',
            action: 'ApproveSignup',
            actionData: [
              {
                name: 'session_state',
                value: req.headers['session_state']
                  ? req.headers['session_state']
                  : '',
              },
              { name: 'PatientId', value: user._id },
              { name: 'timestamp', value: new Date() },
            ],
            platform: req.headers['platform'], // TBD - need to get this info from req
            source: req.headers['source'], // TBD - need to get this info from req
            entity: 'user',
            documentId: user._id,
            change: [
              {
                fieldName: 'status',
                oldValue: 'PendingApproval',
                newValue: 'Active',
              },
            ],
            createdBy: res.locals.userId || res.locals.adminId,
          });
        }
        // audit the action for reject signup
        if (
          oldUser.status === 'PendingApproval' &&
          user.status === 'Inactive'
        ) {
          createAudit({
            system: 'LEAP',
            action: 'RejectSignup',
            actionData: [
              {
                name: 'session_state',
                value: req.headers['session_state']
                  ? req.headers['session_state']
                  : '',
              },
              { name: 'PatientId', value: user._id },
              { name: 'timestamp', value: new Date() },
            ],
            platform: req.headers['platform'], // TBD - need to get this info from req
            source: req.headers['source'], // TBD - need to get this info from req
            entity: 'user',
            documentId: user._id,
            change: [
              {
                fieldName: 'status',
                oldValue: 'PendingApproval',
                newValue: 'Inactive',
              },
            ],
            createdBy: res.locals.userId || res.locals.adminId,
          });

          // send email notification to patient on rejection
          await notificationService.generateNotification(
            {
              ...req,
              type: 'SignupRejected',
              body: {
                ...req.body,
                documentId: user._id,
                recipients: { to: [user.email] },
                data: { redirect: 'notification' },
              },
            },
            res,
            {}
          );
        }

        // audit the action for account locked
        if (oldUser.status !== 'Locked' && user.status === 'Locked') {
          createAudit({
            system: 'LEAP',
            action: 'AccountLocked',
            actionData: [
              {
                name: 'session_state',
                value: req.headers['session_state']
                  ? req.headers['session_state']
                  : '',
              },
              { name: 'PatientId', value: user._id },
              { name: 'timestamp', value: new Date() },
            ],
            platform: req.headers['platform'], // TBD - need to get this info from req
            source: req.headers['source'], // TBD - need to get this info from req
            entity: 'user',
            documentId: user._id,
            change: [
              {
                fieldName: 'status',
                oldValue: oldUser.status,
                newValue: 'Locked',
              },
            ],
            createdBy: res.locals.userId || res.locals.adminId,
          });
        }

        // audit the action for Demographics Added
        if (
          !oldUser.firstName &&
          !oldUser.lastName &&
          !oldUser.birthday &&
          !oldUser.gender &&
          !oldUser.genderOther &&
          !oldUser.phoneNumberPrimary &&
          !oldUser.zip &&
          user.firstName &&
          user.lastName &&
          user.birthday &&
          (user.gender || user.genderOther) &&
          user.phoneNumberPrimary &&
          user.zip
        ) {
          createAudit({
            system: 'LEAP',
            action: 'DemographicsAdded',
            actionData: [
              {
                name: 'session_state',
                value: req.headers['session_state']
                  ? req.headers['session_state']
                  : '',
              },
              { name: 'PatientId', value: user._id },
              { name: 'timestamp', value: new Date() },
            ],
            platform: req.headers['platform'], // TBD - need to get this info from req
            source: req.headers['source'], // TBD - need to get this info from req
            entity: 'user',
            documentId: user._id,
            change: [
              {
                fieldName: 'firstName',
                oldValue: oldUser.firstName || '',
                newValue: user.firstName,
              },
              {
                fieldName: 'lastName',
                oldValue: oldUser.lastName || '',
                newValue: user.lastName,
              },
              {
                fieldName: 'birthday',
                oldValue: oldUser.birthday || '',
                newValue: user.birthday,
              },
              {
                fieldName: 'gender',
                oldValue: oldUser.gender || '',
                newValue: user.gender,
              },
              {
                fieldName: 'genderOther',
                oldValue: oldUser.genderOther || '',
                newValue: user.genderOther || '',
              },
              {
                fieldName: 'phoneNumberPrimary',
                oldValue: oldUser.phoneNumberPrimary || '',
                newValue: user.phoneNumberPrimary,
              },
              {
                fieldName: 'phoneNumberSecondary',
                oldValue: oldUser.phoneNumberSecondary || '',
                newValue: user.phoneNumberSecondary || '',
              },
              {
                fieldName: 'zip',
                oldValue: oldUser.zip || '',
                newValue: user.zip,
              },
            ],
            createdBy: res.locals.userId || res.locals.adminId,
          });
        }
        return user;
      }
    }
    throw new Error(`Error while updating user`);
  } catch (e) {
    logger.error(`user : dao : updateUser : Error : ${e}`);
    throw e;
  }
};

var acceptConsent = async function (req, res) {
  logger.info(`user : dao : acceptConsent : received request`);
  try {
    const consentUpdatedAt = new Date();
    let appName;
    const app = await appModel.findById(req.body.appId);
    if (app) {
      appName = app.appName;
    }
    const apps = {
      app: req.body.appId,
      consentedMedicalRecords: req.body.consentedMedicalRecords.slice(),
    };
    const user = await users.findById(req.params.id);
    if (user) {
      const appIndex = user.apps.findIndex((a) => a.app.equals(req.body.appId));
      if (appIndex > -1) {
        user.apps[appIndex].isActive = true;
        user.apps[appIndex].consentUpdatedAt = consentUpdatedAt;
      } else {
        user.apps.push({ ...apps });
        user.updatedBy = res.locals.userId;
        user.updatedAt = new Date();
      }
      await user.save();
      // create and send notification for consent acceptance
      await notificationService.generateNotification(
        {
          ...req,
          type: 'AcceptConsent',
          body: {
            ...req.body,
            documentId: req.params.id,
            recipients: { to: [user.email] },
            data: { redirect: 'notification' },
          },
        },
        res,
        {
          appName,
          consentUpdatedAt,
        }
      );
      // audit the action
      createAudit({
        system: 'LEAP',
        action: 'AcceptConsent',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'AppId', value: req.body.appId },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'user',
        documentId: req.params.id,
        change: [
          {
            fieldName: 'apps.$.isActive',
            oldValue: 'false',
            newValue: 'true',
          },
        ],
        createdBy: res.locals.userId,
      });
      const updatedUser = await users.findById(req.params.id);
      return updatedUser;
    }
    throw new Error(`Error while updating user`);
  } catch (e) {
    logger.error(`user : dao : acceptConsent : Error : ${e}`);
    throw e;
  }
};

var revokeConsent = async function (req, res) {
  logger.info(`user : dao : revokeConsent : received request`);
  try {
    const consentUpdatedAt = new Date();
    const user = await users
      .findById(req.params.id)
      // .populate('apps.app');
      .populate({ path: 'apps', populate: 'app' });
    if (user) {
      for (const appId of req.body.appIds) {
        const appIndex = user.apps.findIndex((app) => app.app.equals(appId));
        if (appIndex > -1) {
          user.apps[appIndex].isActive = false;
          user.apps[appIndex].consentUpdatedAt = new Date();
          user.apps[appIndex].updatedAt = new Date();
          user.apps[appIndex].updatedBy = res.locals.userId;

          req.body.appId = appId;
          await notificationService.generateNotification(
            {
              ...req,
              type: 'WithdrawnConsent',
              body: {
                ...req.body,
                documentId: user._id,
                recipients: { to: [user.email] },
                data: { redirect: 'notification' },
              },
            },
            res,
            {
              patientEmail: user.email,
              appName: user.apps[appIndex].app.appName,
              consentUpdatedAt,
            }
          );
          // audit the action
          createAudit({
            system: 'LEAP',
            action: 'WithdrawConsent',
            actionData: [
              {
                name: 'session_state',
                value: req.headers['session_state']
                  ? req.headers['session_state']
                  : '',
              },
              { name: 'AppId', value: appId },
              { name: 'timestamp', value: new Date() },
            ],
            platform: req.headers['platform'], // TBD - need to get this info from req
            source: req.headers['source'], // TBD - need to get this info from req
            entity: 'user',
            documentId: user._id,
            change: [
              {
                fieldName: 'apps.$.isActive',
                oldValue: 'true',
                newValue: 'false',
              },
            ],
            createdBy: res.locals.userId,
          });
        }
      }
      const updatedUser = await user.save();
      return updatedUser;
    }
    throw new Error(`Error while updating user`);
  } catch (e) {
    logger.error(`user : dao : revokeConsent : Error : ${e}`);
    throw e;
  }
};

var getAppsByUserId = async function (req) {
  logger.info(`app : dao : getAppsByUserId : received request`);
  try {
    const user = await users.findById(req.params.id).populate('apps.app');
    if (user) {
      return user.apps.filter((a) => a.isActive);
    }
    throw new Error(`Error while getting apps consented by user`);
  } catch (e) {
    logger.error(`app : dao : getAppsByUserId : Error : ${e}`);
    throw e;
  }
};

var getNotificationsByUserId = async function (req) {
  logger.info(`user : dao : getNotificationsByUserId : received request`);
  try {
    const queryParams = req.query;
    const defaultSize = 10;
    const defaultPage = 0;
    const size =
      queryParams && queryParams.size
        ? parseInt(queryParams.size, 10)
        : defaultSize;
    const page =
      queryParams && queryParams.page
        ? parseInt(queryParams.page, 10)
        : defaultPage;
    const user = await users
      .findById(req.params.id)
      .populate({ path: 'notifications.notification', populate: 'app' });
    if (user) {
      if (queryParams && queryParams.appId) {
        // filer on apps
        return user.notifications
          .filter((n) => n.notification.app.equals(queryParams.appId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(page * size, page * size + size);
      }
      return user.notifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(page * size, page * size + size);
    }
    throw new Error(`Error while getting user notifications`);
  } catch (e) {
    logger.error(`user : dao : getNotificationsByUserId : Error : ${e}`);
    throw e;
  }
};

var markNotificationAsRead = async function (req, res) {
  logger.info(`user : dao : markNotificationAsRead : received request`);
  try {
    const user = await users.findOneAndUpdate(
      {
        _id: req.params.id,
        'notifications.notification': req.body.notificationId,
      },
      {
        $set: {
          'notifications.$.isRead': true,
          'apps.$.readAt': new Date(),
        },
        updatedAt: new Date(),
        updatedBy: res.locals.userId,
      },
      { new: true }
    );
    if (user) {
      return user;
    }
    throw new Error(`Error while updating notification in user`);
  } catch (e) {
    logger.error(`user : dao : markNotificationAsRead : Error : ${e}`);
    throw e;
  }
};
var storeMagicLink = async function (req, res, magicLinkDetails) {
  logger.info(`user : dao : storeMagicLink : received request`);
  try {
    const response = await magicLinks.create({ ...magicLinkDetails });
    if (response) {
      return response;
    }
    throw new Error(`Error while storing magicLink`);
  } catch (e) {
    logger.error(`user : dao : storeMagicLink : Error : ${e}`);
    throw e;
  }
};
var getTokenByHashkey = async function (req, res) {
  logger.info(`user : dao : getTokenByHashkey : received request`);
  try {
    const response = await magicLinks.find(
      { hashKey: req.params.hashkey },
      { hashKey: 0 }
    );
    const isLinkExpired =
      Math.floor(new Date() - new Date(response[0].createdAt)) >=
      response[0]['sessionTimeout'] * 1000;
      const resp =JSON.parse(JSON.stringify(response[0]))
    if (response && response.length && !isLinkExpired) {

      await magicLinks.updateOne({_id:resp._id},{sessionTimeout:0} )
      return response[0];
    }
    if (isLinkExpired) {
      throw new Error(`One-Time Login Link is Expired.`);
    }
    throw new Error(`Error while fetching token by hash key`);
  } catch (e) {
    logger.error(`user : dao : getTokenByHashkey : Error : ${e}`);
    throw e;
  }
};

var forgotPassword = async function (req, res) {
  logger.info(
    `app : dao User : forgotPassword : received request` +
      JSON.stringify(req.body)
  );

  try {
    const emailId = req.params.emailId ? req.params.emailId : req.body.emailId;
    const user = await users.findOne({ email: emailId, isDeleted: false });
    if (user) {
      const code = await evcDao.create(emailId, res);
      if (code) {
        // email verification code to patient
        createAudit({
          system: 'LEAP',
          action: 'ResendEmailVerificationCode',
          actionData: [
            {
              name: 'session_state',
              value: req.headers['session_state']
                ? req.headers['session_state']
                : '',
            },
            {
              name: 'patientEmail',
              value: req.params.emailId || req.body.emailId,
            },
            { name: 'code', value: code },
            { name: 'timestamp', value: new Date() },
          ],
          platform: req.headers['platform'], // TBD - need to get this info from req
          source: req.headers['source'], // TBD - need to get this info from req
          entity: 'resend email',
          documentId: user._id,
          change: [],
          createdBy: res.locals.userId || res.locals.adminId,
        });
        await notificationService.generateNotification(
          {
            ...req,
            type: 'ForgotPassword',
            body: {
              ...req.body,
              documentId: user._id,
              recipients: { to: [emailId] },
              data: { redirect: 'notification' },
            },
          },
          res,
          {
            patientEmail: emailId,
            code,
          }
        );
        return user;
      }
    } else throw new Error(`User not found`);
  } catch (e) {
    logger.error(`user : dao : forgotPassword : Error : ${e}`);
    throw e;
  }
};

var getPendingMatchUsers = async function (req) {
  logger.info(`user : dao User : received request`);
  try {
    const limit =
      typeof process.env.DATAVANT_MATCH_LIMIT === 'string'
        ? Number(process.env.DATAVANT_MATCH_LIMIT)
        : process.env.DATAVANT_MATCH_LIMIT || 50;

    const user = await users
      .find(
        {
          $or: req.body.datavantMatchStatus,
        },
        { _id: 1 }
      )
      .limit(limit);
    if (user) {
      return user;
    }
    throw new Error(`User not found with '${req.body.id}'`);
  } catch (e) {
    logger.error(`user : dao : datavantMatchStatus : Error : ${e}`);
    throw e;
  }
};
var matchProcessNotification = async function (req, res, userInfoStatus) {
  logger.info(`user : dao User : received request`);
  try {
    const { id } = userInfoStatus;
    const date = new Date();
    const user = await users.findOneAndUpdate(
      { _id: id },
      {
        datavantMatchStatus: userInfoStatus.datavantMatchStatus,
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );
    if (user && userInfoStatus.datavantMatchStatus === 'matchFound') {
      res.locals = res.locals || {};
      res.locals.userId = id;
      res.locals.adminId = id;
      req.headers = req.headers || {};
      req.headers.platform = 'mobile';
      req.headers.source = 'fhiredApp';
      await notificationService.generateNotification(
        {
          ...req,
          type: 'NewClinicalDataReceived',
          body: {
            ...req.body,
            documentId: userInfoStatus.id,
            patients: [userInfoStatus.id],
            data: { redirect: 'medicalRecords' },
          },
          params: {
            fromDatavantMatchStatus: true,
          },
        },
        res,
        {
          id,
          date,
        }
      );

      return user;
    }
    logger.error(
      `user : dao : datavantMatchStatus : Error : User not found with '${userInfoStatus.id}'`
    );
  } catch (e) {
    logger.error(`user : dao : datavantMatchStatus : Error : ${e}`);
    throw e;
  }
};

var getAllUsersForReminder = async function (
  req,
  res,
  app,
  dayDifference,
  skip,
  limit
) {
  logger.info(`app : dao getAllUsersForReminder : received request`);

  try {
    let difference = new Date();
    difference.setDate(difference.getDate() - dayDifference);

    const payload = {
      firstName: { $ne: null },
      lastLoginTime: { $ne: null },
      apps: {
        $elemMatch: {
          app: app._id,
          isActive: false,
          $or: [
            { IsFirstNotify: dayDifference == 3 ? false : true },
            { IsFirstNotify: null },
          ],
          $or: [
            { notificationSendAt: { $lt: difference } },
            { notificationSendAt: null },
          ],
          // notificationSendAt: { $lt: difference },
          // IsFirstNotify: dayDifference == 3 ? false : true,
        },
      },
    };
    const usersResponse = await users
      .find(
        { ...payload },
        {
          _id: 1,
          pushToken: 1,
          // firstName: 1,
          // lastName: 1,
          email: 1,
          // apps: 1,
          // birthday: 1,
        }
      )
      .skip(skip)
      .limit(limit);
    if (usersResponse) {
      return usersResponse;
    }
    throw new Error(`Users not found`);
  } catch (e) {
    logger.error(`user : dao : getAllUsersForReminder : Error : ${e}`);
    throw e;
  }
};

var updateReminderNotification = async function (
  req,
  res,
  userIds,
  app,
  dayDifference
) {
  logger.info(`app : dao updateReminderNotification : received request`);

  try {
    let difference = new Date();
    difference.setDate(difference.getDate() - dayDifference);

    const payload = {
      _id: {
        $in: userIds,
      },
      apps: {
        $elemMatch: {
          app: app._id,
          isActive: false,
          $or: [
            { IsFirstNotify: dayDifference == 3 ? false : true },
            { IsFirstNotify: null },
          ],
          $or: [
            {
              notificationSendAt: {
                $lt: new Date(difference),
              },
            },
            { notificationSendAt: null },
          ],

          // notificationSendAt: { $lt: new Date(difference) },
          // IsFirstNotify: dayDifference == 3 ? false : true,
        },
      },
    };
    const usersResponse = await users.updateMany(
      {
        ...payload,
      },
      {
        $set: {
          'apps.$.IsFirstNotify': true,
          'apps.$.notificationSendAt': new Date(),
        },
      },
      { upsert: true }
    );
    if (usersResponse) {
      return usersResponse;
    }
    throw new Error(`Users not found`);
  } catch (e) {
    logger.error(`user : dao : updateReminderNotification : Error : ${e}`);
    throw e;
  }
};

var updateFhiredPatientID = async function (req, res, fhiredPatientId) {
  try {
    const user = await users.findByIdAndUpdate(
      req.body.id,
      { fhiredPatientId: fhiredPatientId },
      { new: true }
    );
    return user;
  } catch (e) {
    logger.error(
      `user : dao : updateFhiredPatientID : Error : User not found with '${req.body.id}'`
    );
  }
};
var sendSurvey = async function (req, res, item) {
  logger.info(`app: dao sendSurvey : received request`);

  try {
    res.locals = res.locals || {};
    res.locals.userId = item._id;
    res.locals.adminId = item._id;
    req.headers = req.headers || {};
    req.headers.platform = 'mobile';
    req.headers.source = 'fhiredApp';
    notificationService.generateNotification(
      {
        ...req,
        type: 'survey',
        body: {
          ...req.body,
          documentId: item._id,
          data: { redirect: 'notification' },
        },
      },
      res,
      {
        // handlebars
      }
    );
  } catch (e) {
    logger.error(`user : dao : sendSurvey : Error : ${e}`);
  }
};
var getAllUsersInfo = async function (req, res, skip, limit, payload = {}) {
  logger.info(`app: dao getAllUsersInfo : received request`);

  try {
    const usersResponse = await users
      .find(payload, {
        _id: 1,
        firstName: 1,
        pushToken: 1,
      })
      .skip(skip)
      .limit(limit);

    if (usersResponse && usersResponse.length) {
      return usersResponse;
    }
    throw new Error(`Users not found`);
  } catch (e) {
    logger.error(`user : dao : getAllUsers : Error : ${e}`);
  }
};
module.exports.getUserById = getUserById;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.acceptConsent = acceptConsent;
module.exports.revokeConsent = revokeConsent;
module.exports.getAppsByUserId = getAppsByUserId;
module.exports.getNotificationsByUserId = getNotificationsByUserId;
module.exports.markNotificationAsRead = markNotificationAsRead;
module.exports.getUserByEmailId = getUserByEmailId;
module.exports.getUserByEVC = getUserByEVC;
module.exports.forgotPassword = forgotPassword;
module.exports.getPendingMatchUsers = getPendingMatchUsers;
module.exports.matchProcessNotification = matchProcessNotification;
module.exports.storeMagicLink = storeMagicLink;
module.exports.getTokenByHashkey = getTokenByHashkey;
module.exports.getAllUsers = getAllUsers;
module.exports.addNewAppToAllPatients = addNewAppToAllPatients;
module.exports.getAllUsersForReminder = getAllUsersForReminder;
module.exports.updateReminderNotification = updateReminderNotification;
module.exports.updateFhiredPatientID = updateFhiredPatientID;
module.exports.getAllUsersInfo = getAllUsersInfo;
module.exports.sendSurvey = sendSurvey;
