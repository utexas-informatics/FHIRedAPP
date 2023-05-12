var userDAO = require('../dao/user.dao');
var logger = require('../config/logger');
const fetch = require('../config/fetch-wrapper');
const { createAudit } = require('../services/audit.service');
const notificationService = require('./notification.service');
const appModel = require('../models/app');
const metadataModel = require('../models/metadata');

const roleModel = require('../models/role');
const userModel = require('../models/user');
const notification = require('../models/notification');
var getUserByEmailId = async function (req, res) {
  logger.info(`user : service : getUserByEmailId : received request`);
  try {
    var user = await userDAO.getUserByEmailId(req, res);
    return user;
  } catch (e) {
    logger.error(`user : service : getUserByEmailId : Error : ${e}`);
    throw e;
  }
};

var getUserByEVC = async function (req, res) {
  logger.info(`user : service : getUserByEVC : received request`);
  try {
    var user = await userDAO.getUserByEVC(req, res);
    return user;
  } catch (e) {
    logger.error(`user : service : getUserByEVC : Error : ${e}`);
    throw e;
  }
};

var getUserById = async function (req) {
  logger.info(`user : service : getUserById : received request`);
  try {
    var user = await userDAO.getUserById(req);
    return user;
  } catch (e) {
    logger.error(`user : service : getUserById : Error : ${e}`);
    throw e;
  }
};
var getAllUsers = async function (req) {
  logger.info(`user : service : getAllUsers : received request`);
  try {
    var user = await userDAO.getAllUsers(req);
    return user;
  } catch (e) {
    logger.error(`user : service : getAllUsers : Error : ${e}`);
    throw e;
  }
};
var addNewAppToAllPatients = async function (req, res, app) {
  logger.info(`user : service : addNewAppToAllPatients : received request`);
  try {
    var user = await userDAO.addNewAppToAllPatients(req, res, app);
    return user;
  } catch (e) {
    logger.error(`user : service : addNewAppToAllPatients : Error : ${e}`);
    throw e;
  }
};

var createUser = async function (req, res) {
  logger.info(`user : service : createUser : received request`);
  try {
    var user = await userDAO.createUser(req, res);
    return user;
  } catch (e) {
    logger.error(`user : service : createUser : Error : ${e}`);
    throw e;
  }
};

var updateUser = async function (req, res) {
  logger.info(`user : service : updateUser : received request`);
  try {
    // this code is for handling gender other than male and female
    if( req.body.gender != 'Male' && req.body.gender != 'Female'){
      req.body.gender='Other'
      if(req.body.genderOther==null)
        req.body.genderOther='Other'
    }
    var user = await userDAO.updateUser(req, res);
    return user;
  } catch (e) {
    logger.error(`user : service : updateUser : Error : ${e}`);
    throw e;
  }
};

var acceptConsent = async function (req, res) {
  logger.info(`user : service : acceptConsent : received request`);
  try {
    var user = await userDAO.acceptConsent(req, res);
    return user;
  } catch (e) {
    logger.error(`user : service : acceptConsent : Error : ${e}`);
    throw e;
  }
};

var revokeConsent = async function (req, res) {
  logger.info(`user : service : revokeConsent : received request`);
  try {
    var user = await userDAO.revokeConsent(req, res);
    return user;
  } catch (e) {
    logger.error(`user : service : revokeConsent : Error : ${e}`);
    throw e;
  }
};

var getAppsByUserId = async function (req) {
  logger.info(`user : service : getAppsByUserId : received request`);
  try {
    var app = await userDAO.getAppsByUserId(req);
    return app;
  } catch (e) {
    logger.error(`user : service : getAppsByUserId : Error : ${e}`);
    throw e;
  }
};

var getNotificationsByUserId = async function (req) {
  logger.info(`user : service : getNotificationsByUserId : received request`);
  try {
    var notification = await userDAO.getNotificationsByUserId(req);
    return notification;
  } catch (e) {
    logger.error(`user : service : getNotificationsByUserId : Error : ${e}`);
    throw e;
  }
};

var markNotificationAsRead = async function (req, res) {
  logger.info(`user : service : markNotificationAsRead : received request`);
  try {
    var notification = await userDAO.markNotificationAsRead(req, res);
    return notification;
  } catch (e) {
    logger.error(`user : service : markNotificationAsRead : Error : ${e}`);
    throw e;
  }
};

var login = async function (req) {
  logger.info(`user : service : login : received request`);
  try {
    return await fetch.post(
      `${process.env.CORE_SERVICES_API_BASE_URL}/users/login`,
      {},
      { Authorization: req.headers.authorization }
    );
  } catch (e) {
    logger.error(`user : service : login : Error : ${e}`);
    throw e;
  }
};

var signup = async function (req) {
  logger.info(`user : service : signup : received request`);
  try {
    return await fetch.post(
      `${process.env.CORE_SERVICES_API_BASE_URL}/users/signup`,
      {},
      { Authorization: req.headers.authorization }
    );
  } catch (e) {
    logger.error(`user : service : signup : Error : ${e}`);
    throw e;
  }
};

var logout = async function (req, res) {
  logger.info(`user : service : logout : received request`);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('bearer ')
    ) {
      const userInfo = await fetch.get(
        `${process.env.CORE_SERVICES_API_BASE_URL}/users/getUserInfoByToken`,
        { authorization: req.headers.authorization }
      );
      if (userInfo == undefined) {
        return true;
      } else {
        const response = await fetch.post(
          `${process.env.CORE_SERVICES_API_BASE_URL}/users/logout`,
          { id: userInfo.sub },
          { Authorization: req.headers.authorization }
        );
        if (response) {
          const email = userInfo.email;
          createAudit({
            system: 'LEAP',
            action: 'AppLogout',
            actionData: [
              { name: 'email', value: email },
              {
                name: 'session_state',
                value: req.headers['session_state']
                  ? req.headers['session_state']
                  : '',
              },
            ],
            platform: req.headers['platform'],
            source: req.headers['source'],
            entity: 'user',
            documentId: res.locals.userId,
            change: [],
            createdBy: res.locals.userId || res.locals.adminId,
          });
        }
        return response;
      }
    }
    logger.error(
      `user : service : getUserInfoByToken : Authorization token not found`
    );
  } catch (e) {
    logger.error(`user : service : logout : Error : ${e}`);
    throw e;
  }
};
var forgotPassword = async function (req, res) {
  logger.info(`user : service : forgotPassword : received request`);
  try {
    var user = await userDAO.forgotPassword(req, res);
    return user;
  } catch (e) {
    logger.error(`user : service : forgotPassword : Error : ${e}`);
    throw e;
  }
};

var setNewPassword = async function (req) {
  logger.info(`user : service : setNewPassword : received request`);
  try {
    return await fetch.post(
      `${process.env.CORE_SERVICES_API_BASE_URL}/users/savePassword`,
      {},
      { Authorization: req.headers.authorization }
    );
  } catch (e) {
    logger.error(`user : service : setNewPassword : Error : ${e}`);
    throw e;
  }
};
var getBiometricAccessToken = async function (req) {
  logger.info(`user : service : getBiometricAccessToken : received request`);
  try {
    return await fetch.post(
      `${process.env.CORE_SERVICES_API_BASE_URL}/users/refreshToken`,
      {authType:req.body.authType, email:req.body.email},
      { Authorization: req.headers.authorization }
    );
  } catch (e) {
    logger.error(`user : service : getBiometricAccessToken : Error : ${e}`);
    throw e;
  }
};
var getTokenByHashkey = async function (req) {
  logger.info(`user : service : getTokenByHashkey : received request`);
  try {
    return await userDAO.getTokenByHashkey(req);
  } catch (e) {
    logger.error(`user : service : getTokenByHashkey : Error : ${e}`);
    throw e;
  }
};

var magicLink = async function (req, res) {
  logger.info(`user : service : magicLink : received request`);
  try {
    const response = await fetch.post(
      `${process.env.CORE_SERVICES_API_BASE_URL}/users/exchangeUser`,
      { email: req.body.email },
      {}
    );
    if (response.access_token && response.refresh_token) {
      var random_string =
        Math.random().toString(32).substring(2, 12) +
        Math.random().toString(32).substring(2, 12);
      const magicLinkDetails = {
        ...response,
        hashKey: random_string,
        email: req.body.email,
        createdAt: new Date(),
      };
      await userDAO.storeMagicLink(req, res, magicLinkDetails);
      // const url = `${process.env.FHIREDAPP_DOMAIN}callback?id1=${response.access_token}&id2=${response.refresh_token}&id3=${req.body.email}`;
      const url = `${process.env.FHIREDAPP_DOMAIN}callback/${random_string}`;
      await notificationService.generateNotification(
        {
          ...req,
          type: 'MagicLink',
          body: {
            ...req.body,
            documentId: '',
            recipients: { to: [req.body.email] },
            data: { redirect: 'notification' },
          },
        },
        res,
        {
          patientEmail: req.body.email,
          url,
        }
      );
      return {
        message: `Login Link sent to ${req.body.email}. Please check your email.`,
      };
    }
    logger.error(`user : service : magicLink : Error : ${response}`);
    throw response;
  } catch (e) {
    logger.error(`user : service : magicLink : Error : ${e}`);
    throw e;
  }
};

var getCrosswalkID = async function (req, res) {
  logger.info(`user : service : getCrosswalkID : received request`);
  try {
    return await fetch.post(
      `${process.env.CORE_SERVICES_API_BASE_URL}/patient/searchPatient`,
      req.body,
      { Authorization: req.headers.authorization }
    );
  } catch (e) {
    logger.error(`user : service : getCrosswalkID : Error : ${e}`);
    throw e;
  }
};

var getPatientIDFromFhir = async function (patientID) {
  logger.info(`user : service : getPatientIDFromFhir : received request`);
  try {
    return await fetch.get(
      `${process.env.FHIR_API_BASE_URL}Patient?_format=json&identifier=urn:oid:1.2.36.146.595.217.0.1|${patientID}`,
      {}
    );
  } catch (e) {
    logger.error(`user : service : getPatientIDFromFhir : Error : ${e}`);
    throw e;
  }
};

var datavantMatchStatus = async function (req, res) {
  logger.info(`user : service : datavantMatchStatus : received request`);
  try {
    var user = await userDAO.getPendingMatchUsers(req, res);
    if (user && user.length) {
      const matchUsers = await fetch.post(
        `${process.env.CORE_SERVICES_API_BASE_URL}/patient/datavantMatchStatus`,
        { FHIRedAppPatientIds: user.map((item) => item.id) }
      );
      const userInfoStatus = user.map((item) => {
        const isMatchProcess = matchUsers.find(
          (userItem) => userItem.source_patient_id === item.id
        );
        const result = {
          id: item.id,
          datavantMatchStatus: isMatchProcess ? 'matchFound' : 'matchNotFound',
        };
        if (result && result.id && result.datavantMatchStatus) {
          userDAO.matchProcessNotification(req, res, result);
        }
        return result;
      });
      return userInfoStatus;
    }
    return { message: 'users not found for datavant match process' };
  } catch (e) {
    logger.error(`user : service : datavantMatchStatus : Error : ${e}`);
    throw e;
  }
};

var reminderNotification = async function (req, res) {
  logger.info(`user : service : reminderNotification : received request`);
  try {
    const appResponse = await appModel.find({ isActive: true });
    let userResponse;
    const role = await roleModel.findOne({ role: 'Admin' });
    const admin = await userModel.find({ role: role._id });
    res = {
      locals: {
        adminId: admin[0]._id,
      },
    };
    //TBD- 3days at start 2days onwards
    for (let iterations = 0; iterations < 2; iterations++) {
      let flag = true;
      let skip = 0,
        limit = 100;
      while (flag) {
        for (let i = 0; i < appResponse.length; i++) {
          const ntype = await notificationService.getTemplateValues(
            'ReminderNotification',
            {
              signature: 'FHIRedApp Team',
              appName: appResponse[i].appName,
            }
          );
          userResponse = await userDAO.getAllUsersForReminder(
            req,
            res,
            appResponse[i],
            iterations == 0 ? 3 : 2,
            skip,
            limit
          );
          if (userResponse.length > 0) {
            let pushToken = [],
              emailList = [];
            userIds = [];
            for (let j = 0; j < userResponse.length; j++) {
              if (userResponse[j].pushToken)
                pushToken.push(userResponse[j].pushToken);
              if (userResponse[j].email) emailList.push(userResponse[j].email);
              if (userResponse[j]._id) userIds.push(userResponse[j]._id);
            }
            if (ntype && ntype.length) {
              let notification;
              let updatedUserResponse;
              for await (const nTemplate of ntype) {
                switch (nTemplate.deliveryChannel) {
                  case 'MobilePush':
                    await notificationService.sendBulkToMobilePush(
                      {
                        type: 'ReminderNotification',
                        body: {
                          data: { redirect: 'notification' },
                        },
                      },
                      res,
                      pushToken,
                      nTemplate
                    );
                    notificationService.sendAudit(
                      req,
                      res,
                      nTemplate.title,
                      nTemplate.message,
                      nTemplate.deliveryChannel,
                      userIds
                    );
                    break;
                  case 'Email':
                    if (emailList.length > 0) {
                      await notificationService.sendBulkToEmail(
                        emailList,
                        nTemplate
                      );
                      notificationService.sendAudit(
                        req,
                        res,
                        nTemplate.title,
                        nTemplate.message,
                        nTemplate.deliveryChannel,
                        userIds
                      );
                    }
                    break;
                  default:
                    notification =
                      await notificationService.createAndMapNotificationInBulk(
                        req,
                        res,
                        userIds,
                        nTemplate,
                        appResponse[i]._id
                      );
                    notificationService.sendAudit(
                      req,
                      res,
                      nTemplate.title,
                      nTemplate.message,
                      nTemplate.deliveryChannel,
                      userIds
                    );
                }
              }
              if (notification) {
                updatedUserResponse = await userDAO.updateReminderNotification(
                  req,
                  res,
                  userResponse,
                  appResponse[i],
                  iterations == 0 ? 3 : 2
                );
              }
              if (userResponse && userResponse.length < limit) flag = false;
              skip += limit;
            } else flag = false;
          } else flag = false;
        }
      }
    }
    if (userResponse) return { message: 'notificatins send successfully' };
  } catch (e) {
    logger.error(`user : service : reminderNotification : Error : ${e}`);
    throw e;
  }
};
var updateFhiredPatientID = async function (req, fhiredPatientId) {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.body.FHIRedAppPatientID,
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

var reminderDemographic = async function (req, res) {
  logger.info(`user : service : reminderDemographic : received request`);
  try {
    let skip = 0,
      flag = true,
      success = false,
      limit =
        typeof process.env.REMINDER_DEMOGRAPHIC_LIMIT === 'string'
          ? Number(process.env.REMINDER_DEMOGRAPHIC_LIMIT)
          : process.env.REMINDER_DEMOGRAPHIC_LIMIT || 100;
    const role = await roleModel.findOne({ role: 'Admin' });
    const admin = await userModel.find({ role: role._id });
    res = {
      locals: {
        adminId: admin[0]._id,
      },
    };
    let difference = new Date();
    difference.setDate(difference.getDate() - 1);
    let templateValues = await notificationService.getTemplateValues(
      'ReminderDemographic',
      {
        signature: 'FHIRedApp Team',
      }
    );
    const prole = await roleModel.findOne({ role: 'Patient' });
    while (flag) {
      let payload = {
        lastLoginTime: { $ne: null },
        firstName: null,
        notificationSendAt: { $lt: difference },
        role: prole._id,
      };
      let notification;
      const userResponse = await userModel
        .find({ ...payload }, { _id: 1, email: 1 })
        .skip(skip)
        .limit(limit);
      let emailList = [];
      let userIds = [];
      if (userResponse.length) {
        for (let i = 0; i < userResponse.length; i++) {
          emailList.push(userResponse[i].email);
          userIds.push(userResponse[i]._id);
        }
      }
      if (emailList.length) {
        notification = await notificationService.sendBulkToEmail(
          emailList,
          templateValues[0]
        );
        notificationService.sendAudit(
          req,
          res,
          templateValues[0].title,
          templateValues[0].message,
          templateValues[0].deliveryChannel,
          userIds
        );
      }
      if (userIds.length) {
        const updateResponse = await userModel.updateMany(
          { _id: userIds },
          { $set: { notificationSendAt: new Date() } }
        );
      }
      skip += limit;
      if (userResponse.length < limit) flag = false;
      success = true;
    }
    if (success) return { message: 'notificatins send successfully' };
  } catch (e) {
    logger.error(`user : service : reminderDemographic : Error : ${e}`);
    throw e;
  }
};
var reminderLogin = async function (req, res) {
  logger.info(`user : service : reminderLogin : received request`);
  try {
    let skip = 0,
      flag = true,
      success = false,
      limit =
        typeof process.env.REMINDER_LOGIN_LIMIT === 'string'
          ? Number(process.env.REMINDER_LOGIN_LIMIT)
          : process.env.REMINDER_LOGIN_LIMIT || 100;
    const role = await roleModel.findOne({ role: 'Admin' });
    const admin = await userModel.find({ role: role._id });
    res = {
      locals: {
        adminId: admin[0]._id,
      },
    };
    let difference = new Date();
    difference.setDate(difference.getDate() - 1);
    let templateValues = await notificationService.getTemplateValues(
      'ReminderLogin',
      {
        signature: 'FHIRedApp Team',
      }
    );
    const prole = await roleModel.findOne({ role: 'Patient' });
    while (flag) {
      let payload = {
        firstName: null,
        notificationSendAt: { $lt: difference },
        role: prole._id,
      };
      let notification;
      const userResponse = await userModel
        .find({ ...payload }, { _id: 1, email: 1 })
        .skip(skip)
        .limit(limit);
      let emailList = [];
      let userIds = [];
      if (userResponse.length) {
        for (let i = 0; i < userResponse.length; i++) {
          emailList.push(userResponse[i].email);
          userIds.push(userResponse[i]._id);
        }
      }
      if (emailList.length) {
        notification = await notificationService.sendBulkToEmail(
          emailList,
          templateValues[0]
        );
        notificationService.sendAudit(
          req,
          res,
          templateValues[0].title,
          templateValues[0].message,
          templateValues[0].deliveryChannel,
          userIds
        );
      }
      const updateResponse = await userModel.updateMany(
        { _id: userIds },
        { $set: { notificationSendAt: new Date() } }
      );
      skip += limit;
      if (userResponse.length < limit) flag = false;
      success = true;
    }
    if (success) return { message: 'notificatins send successfully' };
  } catch (e) {
    logger.error(`user : service : reminderLogin : Error : ${e}`);
    throw e;
  }
};

var userSurvey = async function (req, res) {
  logger.info(`user : service : userSurvey : received request`);
  try {
    let templateValues = await notificationService.getTemplateValues('survey', {
      signature: 'FHIRedApp Team',
    });
    let skip = 0,
      flag = true,
      success = false,
      limit =
        typeof process.env.USER_SURVEY_LIMIT === 'string'
          ? Number(process.env.USER_SURVEY_LIMIT)
          : process.env.USER_SURVEY_LIMIT || 100;
    while (flag) {
      const user = await userDAO.getAllUsersInfo(req, res, skip, limit);
      let pushToken = [],
        userIds = [];

      for (let i = 0; i < user.length; i++) {
        pushToken.push(user[i].pushToken);
        userIds.push(user[i]._id);
      }
      if (pushToken) {
        success = true;
        await notificationService.sendBulkToMobilePush(
          req,
          res,
          pushToken,
          templateValues[0]
        );
      }
      if (userIds) {
        success = true;
        templateValues[1] = {
          ...templateValues[1],
          meta: {
            studyId: req.body.meta.studyId,
            surveyId: req.body.meta.surveyId,
          },
        };
        await notificationService.createAndMapNotificationInBulk(
          req,
          res,
          userIds,
          templateValues[1],
          req.body.appId
        );
      }
      if (user.length < limit) flag = false;
      skip += limit;
    }
    if (success) return { message: 'survey braodcasted successfully' };
    return { message: 'something went wrong' };
  } catch (e) {
    logger.error(`user : service : userSurvey : Error : ${e}`);
    throw e;
  }
};

var newMedicalRecordNotify = async function (req, res) {
  logger.info(`user : service : newMedicalRecordNotify : received request`);
  try {
    const role = await roleModel.findOne({ role: 'Admin' });
    const admin = await userModel.find({ role: role._id });
    res = {
      locals: {
        adminId: admin[0]._id,
      },
    };
    const ntype = await notificationService.getTemplateValues(
      'newMedicalRecords',
      {
        signature: 'FHIRedApp Team',
      }
    );
    let skip = 0,
      flag = true,
      success = false,
      limit =
        typeof process.env.NEW_MEDICAL_RECORD_NOTIFY_LIMIT === 'string'
          ? Number(process.env.NEW_MEDICAL_RECORD_NOTIFY_LIMIT)
          : process.env.NEW_MEDICAL_RECORD_NOTIFY_LIMIT || 100;

    let notifyAt = await metadataModel.find({ type: 'NewMedicalRecordsFound' });

    while (flag) {
      const fhirUsers = await fetch.post(
        `${process.env.CORE_SERVICES_API_BASE_URL}/patient/getPatientsWithNewMedicalRecords`,
        { date: notifyAt[0].notifyAt, limit: limit, skip: skip }
      );
      if (fhirUsers.length > 0) {
        let fhirUsersId = fhirUsers.map((x) => x.source_patient_id);
        let payload = {
          _id: fhirUsersId,
        };
        const user = await userDAO.getAllUsersInfo(
          req,
          res,
          skip,
          limit,
          payload
        );
        if (user.length > 0) {
          let pushToken = [],
            userIds = [];

          for (let i = 0; i < user.length; i++) {
            if (user[i].pushToken) pushToken.push(user[i].pushToken);
            userIds.push(user[i]._id);
          }
          if (ntype && ntype.length) {
            for await (const nTemplate of ntype) {
              switch (nTemplate.deliveryChannel) {
                case 'MobilePush':
                  if (pushToken) {
                    success = true;
                    await notificationService.sendBulkToMobilePush(
                      req,
                      res,
                      pushToken,
                      nTemplate
                    );
                    notificationService.sendAudit(
                      req,
                      res,
                      nTemplate.title,
                      nTemplate.message,
                      nTemplate.deliveryChannel,
                      userIds
                    );
                  }
                  break;
                default:
                  if (userIds) {
                    success = true;
                    await notificationService.createAndMapNotificationInBulk(
                      req,
                      res,
                      userIds,
                      nTemplate,
                      null
                    );
                    notificationService.sendAudit(
                      req,
                      res,
                      nTemplate.title,
                      nTemplate.message,
                      nTemplate.deliveryChannel,
                      userIds
                    );
                  }
                  break;
              }
            }
            if (user.length < limit) flag = false;
            skip += limit;
          } else flag = false;
        } else flag = false;
      } else flag = false;
    }
    if (success) {
      const currentTime = new Date();
      const res = await metadataModel.updateOne(
        { type: 'NewMedicalRecordsFound' },
        { $set: { notifyAt: currentTime, updatedAt: currentTime } },
        { new: true }
      );
      // const updateResponse = await fetch.put(
      //   `${process.env.CORE_SERVICES_API_BASE_URL}/patient/updateFPDUTUpdateAt`, //FHIR_PATIENT_DATA_UPDATE_TRACKER
      //   {subKey:}
      // );
      if (res.length) return { message: 'notification send successfully' };
    } else {
      return { message: 'no new medical record found' };
    }
    return { message: 'something went wrong' };
  } catch (e) {
    logger.error(`user : service : newMedicalRecordNotify : Error : ${e}`);
    throw e;
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
module.exports.login = login;
module.exports.signup = signup;
module.exports.logout = logout;
module.exports.forgotPassword = forgotPassword;
module.exports.setNewPassword = setNewPassword;
module.exports.getBiometricAccessToken = getBiometricAccessToken;
module.exports.magicLink = magicLink;
module.exports.getTokenByHashkey = getTokenByHashkey;
module.exports.getCrosswalkID = getCrosswalkID;
module.exports.getPatientIDFromFhir = getPatientIDFromFhir;
module.exports.datavantMatchStatus = datavantMatchStatus;
module.exports.getAllUsers = getAllUsers;
module.exports.addNewAppToAllPatients = addNewAppToAllPatients;
module.exports.reminderNotification = reminderNotification;
module.exports.updateFhiredPatientID = updateFhiredPatientID;
module.exports.reminderDemographic = reminderDemographic;
module.exports.reminderLogin = reminderLogin;
module.exports.userSurvey = userSurvey;
module.exports.newMedicalRecordNotify = newMedicalRecordNotify;
