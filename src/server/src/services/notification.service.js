const jwt_decode = require('jwt-decode');
const appDao = require('../dao/app.dao');
const fetchWrapper = require('../config/fetch-wrapper');
const Handlebars = require('handlebars');
const { sendEmail } = require('./email.service');
var userDAO = require('../dao/user.dao');
const { createAudit } = require('../services/audit.service');

var notificationDAO = require('../dao/notification.dao');
const notificationTypes = require('../models/notification-type');
var logger = require('../config/logger');
const fcm = require('../config/push-notification');
const notification = require('../models/notification');

var sendToMobilePush = async function (req, res) {
  logger.info(`notification : service : sendToMobilePush : received request`);
  try {
    // TBD - code to push notification (req.title and req.message) on mobile platform here..

    // 1. decode token
    // 2. get USerdetails from token
    // 3. send push notification
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    var message = {
      to: await getAccesstokenForPush(req, res),

      notification: {
        title: req.body.title,
        body: req.body.message,
      },
      //you can send only notification or only data(or include both)
      data: req.body.data ? req.body.data : {},
    };
    fcm.send(message, function (err, response) {
      if (err) {
        logger.info(
          `notification : service : Error while sending push notification :${err}`
        );
      } else {
        logger.info(
          `notification : service :notification sentsuccessfully :${response}`
        );

        return false;
      }
    });
  } catch (e) {
    logger.error(`notification : service : sendToMobilePush : Error : ${e}`);
    throw e;
  }
};

var sendToSMS = function (req, res) {
  logger.info(`notification : service : sendToSMS : received request`);
  try {
    // TBD - code to SMS notification (req.title and req.message) on mobile platform..
  } catch (e) {
    logger.error(`notification : service : sendToSMS : Error : ${e}`);
    throw e;
  }
};

var sendToWebPush = function (req, res) {
  logger.info(`notification : service : sendToWebPush : received request`);
  try {
    // TBD - code to push notification (req.title and req.message) on web platform here..
  } catch (e) {
    logger.error(`notification : service : sendToWebPush : Error : ${e}`);
    throw e;
  }
};

var generateNotification = async function (req, res, templateValues) {
  logger.info(
    `notification : service : generateNotification : received request`
  );
  try {
    if (templateValues?.consentUpdatedAt) {
      templateValues.consentUpdatedAt = new Date(
        templateValues.consentUpdatedAt
      ).toUTCString();
    }
    const nReq = { ...req };
    const nRes = { locals: { adminId: res.locals.adminId } };
    let notification;
    if (req.type) {
      const nType = await notificationTypes
        .findOne({
          name: req.type,
        })
        .populate({ path: 'templates', populate: 'deliveryChannel' });
      if (nType && nType.templates.length) {
        for await (const nTemplate of nType.templates) {
          // compose title and message from template and values
          let { title, message } = nTemplate;

          templateValues.signature = 'FHIRedApp Team';
          if (templateValues) {
            let template = Handlebars.compile(title);
            title = template({ ...templateValues });

            template = Handlebars.compile(message);
            message = template({ ...templateValues });
          }
          nReq.body = {
            ...req.body,
            title,
            message,
            app: req.body.appId,
          };

          // switch case for other delivery channels
          switch (nTemplate.deliveryChannel.name) {
            case 'MobilePush':
              await sendToMobilePush(nReq, nRes);
              sendAudit(
                nReq,
                res,
                nReq.body.title,
                nReq.body.message,
                nTemplate.deliveryChannel.name,
                res.locals.userId || res.locals.adminId
              );
              break;

            case 'Email':
              await sendEmail({
                system: 'LEAP',
                from: process.env.SMTP_FROM,
                replyTo: process.env.SMTP_REPLY_TO,
                to: [...req.body.recipients.to],
                subject: title,
                html: message,
              });
              sendAudit(
                nReq,
                res,
                nReq.body.title,
                nReq.body.message,
                nTemplate.deliveryChannel.name,
                JSON.stringify(req.body.recipients.to)
              );
              break;

            case 'SMS':
              await sendToSMS(nReq, nRes);
              break;

            case 'WebPush':
              await sendToWebPush(nReq, nRes);
              break;

            case 'API':
              await callNotificationAPI(nReq, nRes);
              break;

            default:
              // create in-app notification to be shown in notification tab
              notification = await notificationDAO.createAndMapNotification(
                nReq,
                nRes
              );
              sendAudit(
                nReq,
                res,
                nReq.body.title,
                nReq.body.message,
                nTemplate.deliveryChannel.name,
                res.locals.userId || res.locals.adminId
              );
              break;
          }
        }
      } else {
        notification = await notificationDAO.createAndMapNotification(
          nReq,
          nRes
        );
      }
    } else {
      notification = await notificationDAO.createAndMapNotification(nReq, nRes);
    }
    return notification;
  } catch (e) {
    logger.error(
      `notification : service : generateNotification : Error : ${e}`
    );
    throw e;
  }
};

const sendAudit = function (req, res, title, message, channelName, userType) {
  logger.info(
    `notification : service : sendAudit : title : ${title} : message : ${message} : channelName : ${channelName}`
  );
  createAudit({
    system: 'LEAP',
    action: 'NotificationSent',
    actionData: [
      {
        name: 'session_state',
        value:
          req.skip == true
            ? ''
            : req.headers['session_state']
            ? req.headers['session_state']
            : '',
      },
      { name: 'notificationHeading', value: title },
      { name: 'notificationBody', value: message },
      {
        name: 'typeOfNotification',
        value: channelName,
      },
      {
        name: 'receipients',
        value:
          typeof userType == 'string' ? userType : JSON.stringify(userType),
      },
      {
        name: 'userCount',
        value:
          typeof userType == 'string' ? '1' : JSON.stringify(userType.length),
      },
      { name: 'timestamp', value: new Date() },
    ],
    platform: req.headers['platform'],
    source: req.headers['source'],
    entity: 'notification',
    documentId: !res ? '' : res.locals.adminId,
    change: [],
    createdBy: !res ? '' : res.locals.adminId,
  });
};

var getNotificationById = async function (req) {
  logger.info(
    `notification : service : getNotificationById : received request`
  );
  try {
    var notification = await notificationDAO.getNotificationById(req.params.id);
    return notification;
  } catch (e) {
    logger.error(`notification : service : getNotificationById : Error : ${e}`);
    throw e;
  }
};

var sendMobileNotification = async function (req, res) {
  try {
    const type = req.body['type'];
    delete req.body['type'];
    let nbody = { ...req.body };
    req.body = nbody;
    const notification = await notificationDAO.createNotification(req, res);
    await notificationDAO.mapUserNotifications(req, res, notification._id);
    await sendToMobilePush(req, res);
    return notification;
  } catch (e) {
    logger.error(
      `notification : service : sendMobileNotification : Error : ${e}`
    );
    throw e;
  }
};

var getAccesstokenForPush = async function (req, res) {
  let user;
  if (req.body.patients != null && req.body.patients.length > 0) {
    req.params = {};
    req.params.id = req.body.patients[0];
    user = await userDAO.getUserById(req);
    return user.pushToken;
  } else {
    const decodedHeader = jwt_decode(
      req.headers.authorization.replace('bearer ', '')
    );
    req.body = { ...req.body, emailId: decodedHeader.email };
    user = await userDAO.getUserByEmailId(req, res);
  }
  return user.pushToken;
};
var callNotificationAPI = async function (req, res) {
  logger.info(
    `notification : service : callNotificationAPI : received request`
  );
  try {
    req.params = {};
    req.params.id = req.query.appId;
    const app = await appDao.getAppById(req);
    const request = {
      researcherId: req.body.patients[0],
      title: req.body.title,
      message: req.body.message,
    };

    if (app.notificationUrl && app.notificationUrl.length > 0) {
      // write an API code
      const resp = await fetchWrapper.post(app.notificationUrl, request, {
        Authorization: req.headers.authorization,
      });
    }
  } catch (e) {
    logger.error(`notification : service : callNotificationAPI : Error : ${e}`);
    throw e;
  }
};

var getTemplateValues = async function (ntype, templateValues) {
  logger.info(`notification : service : getTemplateValues : received request`);
  try {
    const nType = await notificationTypes
      .findOne({
        name: ntype,
      })
      .populate({ path: 'templates', populate: 'deliveryChannel' });
    let response = [];
    if (nType && nType.templates.length) {
      for await (const nTemplate of nType.templates) {
        // compose title and message from template and values
        let { title, message } = nTemplate;

        if (templateValues) {
          templateValues.signature = 'FHIRedApp Team';
          let template = Handlebars.compile(title);
          title = template({ ...templateValues });

          template = Handlebars.compile(message);
          message = template({ ...templateValues });
        }
        response.push({
          title,
          message,
          deliveryChannel: nTemplate.deliveryChannel.name,
        });
      }
    }
    if (response) return response;
    return [];
  } catch (e) {
    logger.error(`notification : service : getTemplateValues : Error : ${e}`);
    throw e;
  }
};
var sendBulkToMobilePush = async function (req, res, pushTokens, message) {
  logger.info(
    `notification : service : sendBulkToMobilePush : received request`
  );
  try {
    var message = {
      registration_ids: [...pushTokens],

      notification: {
        title: message.title,
        body: message.message,
      },
      //you can send only notification or only data(or include both)
      // data: req.body.data ? req.body.data : {},
    };
    fcm.send(message, function (err, response) {
      if (err) {
        logger.info(
          `notification : service : Error while sending push notification :${err}`
        );
      } else {
        logger.info(
          `notification : service :notification sentsuccessfully :${response}`
        );

        return false;
      }
    });
  } catch (e) {
    logger.error(
      `notification : service : sendBulkToMobilePush : Error : ${e}`
    );
    throw e;
  }
};
var sendBulkToEmail = async function (emailList, message) {
  await sendEmail({
    system: 'LEAP',
    from: process.env.SMTP_FROM,
    replyTo: process.env.SMTP_REPLY_TO,
    bcc: [...emailList],
    subject: message.title,
    html: message.message,
  });
};

var createAndMapNotificationInBulk = async function (
  req,
  res,
  userIds,
  message,
  appId
) {
  logger.info(`notification : service : getTemplateValues : received request`);
  try {
    const response = notificationDAO.createAndMapNotificationInBulk(
      req,
      res,
      userIds,
      message,
      appId
    );
    if (response) return response;
    return false;
  } catch (e) {
    logger.error(`notification : service : getTemplateValues : Error : ${e}`);
    throw e;
  }
};
module.exports.generateNotification = generateNotification;
module.exports.getNotificationById = getNotificationById;
module.exports.sendMobileNotification = sendMobileNotification;
module.exports.callNotificationAPI = callNotificationAPI;
module.exports.getTemplateValues = getTemplateValues;
module.exports.sendBulkToMobilePush = sendBulkToMobilePush;
module.exports.sendBulkToEmail = sendBulkToEmail;
module.exports.createAndMapNotificationInBulk = createAndMapNotificationInBulk;
module.exports.sendAudit = sendAudit;
