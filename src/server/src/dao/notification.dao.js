var notifications = require('../models/notification');
var apps = require('../models/app');
var users = require('../models/user');
var logger = require('../config/logger');

var createNotification = async function (req, res) {
  logger.info(
    `notification : dao : createNotification : received request` +
      JSON.stringify(res.locals)
  );
  logger.info(
    `notification : dao : createNotification : received request` +
      JSON.stringify(req.body)
  );

  try {
    const notification = await notifications.create({
      ...req.body,
      createdBy: res.locals.userId || res.locals.adminId,
      updatedBy: res.locals.userId || res.locals.adminId,
    });
    if (notification && req.body.app) {
      // add ref in app for created notification
      const app = await apps.findOneAndUpdate(
        { _id: req.body.app },
        {
          $push: { notifications: notification._id },
        },
        {
          new: true,
        }
      );
      if (app) {
        return notification;
      }
    } else if (notification) {
      return notification;
    }
    throw new Error(`Error while creating notification`);
  } catch (e) {
    logger.error(`notification : dao : createNotification : Error : ${e}`);
    throw e;
  }
};

var getNotificationById = async function (id) {
  logger.info(`notification : dao : getNotificationById : received request`);
  try {
    const notification = await notifications.findById(id).populate('app');
    if (notification) {
      return notification;
    }
    throw new Error(`notification with id ${id} not found`);
  } catch (e) {
    logger.error(`notification : dao : getNotificationById : Error : ${e}`);
    throw e;
  }
};

// adds ref of notifications provided in req to consented/all users
var mapNotifications = async function (req, res) {
  logger.info(`notification : dao : mapNotifications : received request`);
  try {
    for await (const id of req.body.notifications) {
      const notification = await getNotificationById(id);
      if (notification) {
        const currentTime = new Date();
        let filter = {};
        if (notification.app) {
          filter = { 'apps.app': notification.app };
        }
        if (req.params.id) {
          filter._id = req.params.id;
        }
        if (notification.app || req.params.fromDatavantMatchStatus) {
          // add external app notification ref in each consented user
          await users.updateMany(
            // { 'apps.app': notification.app },
            filter,
            {
              $push: {
                notifications: { notification: id },
              },
              updatedAt: currentTime,
              updatedBy: res.locals.adminId,
            }
          );
        } else {
          // add LEAP in-app notification ref in each user
          await users.updateMany(
            {},
            {
              $push: {
                notifications: { notification: id },
              },
              updatedAt: currentTime,
              updatedBy: res.locals.adminId,
            }
          );
        }
      }
    }
    return true;
  } catch (e) {
    logger.error(`notification : dao : mapNotifications : Error : ${e}`);
    throw e;
  }
};
var mapUserNotifications = async function (req, res, id) {
  logger.info(`notification : dao : mapNotifications : received request`);
  try {
    const user = users.findById(req.body.patients[0]);

    // add external app notification ref in each consented user
    await users.updateOne(
      { _id: req.body.patients[0] },
      {
        $push: {
          notifications: { notification: id },
        },
        updatedAt: Date.now(),
        updatedBy: res.locals.adminId,
      }
    );
    return true;
  } catch (e) {
    logger.error(`notification : dao : mapNotifications : Error : ${e}`);
    throw e;
  }
};

var createAndMapNotification = async function (req, res) {
  logger.info(`notification : dao : generateNotification : received request`);
  try {
    // create a notification
    const notification = await createNotification(req, res);
    if (notification) {
      const nReq = {
        body: {
          notifications: [notification._id],
        },
        params: {
          ...req?.params,
          id: req?.params?.id ? req.params.id : req.body.patients[0],
        },
      };
      // add ref to users
      return await mapNotifications(nReq, res);
    }

    throw new Error(`Error while creating and sending notification`);
  } catch (e) {
    logger.error(`notification : dao : generateNotification : Error : ${e}`);
    throw e;
  }
};
var createAndMapNotificationInBulk = async function (
  req,
  res,
  userIds,
  message,
  appId
) {
  logger.info(
    `notification : dao : createAndMapNotificationInBulk : received request`
  );
  try {
    // create a notification
    const notification = await notifications.create({
      ...message,
      app: appId,
      createdBy: '5ff559f333aad739800b9bc4',
      updatedBy: '5ff559f333aad739800b9bc4',
    });
    if (notification) {
      // add ref to users
      const currentTime = new Date();
      await users.updateMany(
        { _id: userIds },
        {
          $push: {
            notifications: { notification: notification._id },
          },
          updatedAt: currentTime,
          updatedBy: '5ff559f333aad739800b9bc4',
        }
      );
      return true;
    }

    throw new Error(`Error while creating and sending notification`);
  } catch (e) {
    logger.error(
      `notification : dao : createAndMapNotificationInBulk : Error : ${e}`
    );
    throw e;
  }
};

module.exports.createNotification = createNotification;
module.exports.getNotificationById = getNotificationById;
module.exports.mapNotifications = mapNotifications;
module.exports.createAndMapNotification = createAndMapNotification;
module.exports.mapUserNotifications = mapUserNotifications;
module.exports.createAndMapNotificationInBulk = createAndMapNotificationInBulk;
