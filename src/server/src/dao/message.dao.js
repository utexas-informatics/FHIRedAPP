/* eslint-disable no-else-return */
var mongoose = require('mongoose');
var messages = require('../models/message');
var logger = require('../config/logger');
const notificationService = require('../services/notification.service');
const { createAudit } = require('../services/audit.service');

/**
 * @param  {string} id - Thread Id
 * @param  {string} senderId - sender Id
 * @param  {string} recipientId - recipient Id
 * @description - Get all messages of the thread
 */
async function _getMessages(id, senderId, recipientId, skip = 0, limit = 20) {
  logger.info(`message : dao : _getMessages : received request`);
  try {
    const message = await messages.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          // title: 1,
          // app: 1,
          chats: {
            $filter: {
              input: '$chats',
              as: 'chat',
              cond: {
                $or: [
                  {
                    $and: [
                      {
                        $eq: ['$$chat.sender.id', senderId],
                      },
                      {
                        $eq: ['$$chat.recipient.id', recipientId],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $eq: ['$$chat.sender.id', recipientId],
                      },
                      {
                        $eq: ['$$chat.recipient.id', senderId],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      { $unwind: '$chats' },
      { $sort: { 'chats.postedAt': -1 } },
      { $skip: Number(skip) },
      { $limit: Number(limit) },
      {
        $group: {
          _id: '$_id',
          chats: { $push: '$chats' },
        },
      },
    ]);
    if (message) {
      return message;
    }
    throw new Error(`Error while getting messages`);
  } catch (e) {
    logger.error(`message : dao : _getMessages : Error : ${e}`);
    throw e;
  }
}

var createThread = async function (req, res) {
  logger.info(`message : dao createThread : received request`);
  try {
    const message = await messages.create({
      ...req.body,
      createdBy: res.locals.userId,
      updatedBy: res.locals.userId,
    });
    if (message) {
      createAudit({
        system: 'LEAP',
        action: 'CreateThread',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'Researcher Id', value: req.body.userId },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'message',
        documentId: req.body.userId,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });

      return message;
    }
    throw new Error(`Error while creating threads`);
  } catch (e) {
    logger.error(`message : dao : createThread : Error : ${e}`);
    throw e;
  }
};

var createChat = async function (req, res) {
  logger.info(`message : dao createChat : received request`);
  try {
    const chats = req.body;
    const message = await messages.findOneAndUpdate(
      { _id: req.params.id },
      {
        updatedAt: new Date(),
        $push: {
          chats,
        },
      },
      { returnOriginal: false }
    );
    if (message) {
      var test = await _getMessages(
        req.params.id,
        req.body.sender.id,
        req.body.recipient.id,
        req.query.skip,
        req.query.limit
      );
      const date = new Date().toUTCString();
      let sender = req.body.sender.name;
      let notificaitonType = 'MessageSending';
      // Study App
      if (req.headers['source'] !== 'FhiredApp') {
        notificaitonType = 'MessageReceived';
      }
      notificationService.generateNotification(
        {
          ...req,
          type: notificaitonType,
          body: {
            ...req.body,
            documentId: req.body.sender.id,
            patients: [req.body.recipient.id],
            data: { redirect: 'message' },
          },
        },
        res,
        {
          sender,
          date,
        }
      );

      createAudit({
        system: 'LEAP',
        action: 'SendMessage',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: req.body.sender.id, value: req.body.body },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'message',
        documentId: req.body.sender.id,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });
      return test;
    }

    throw new Error(`Error while sending message`);
  } catch (e) {
    logger.error(`message : dao : send : Error : ${e}`);
    throw e;
  }
};
var _formatThreads = function (req, res, message) {
  createAudit({
    system: 'LEAP',
    action: 'getThreads',
    actionData: [
      {
        name: 'session_state',
        value: req.headers['session_state'] ? req.headers['session_state'] : '',
      },
      { name: 'user Id', value: req.query.userId },
      {
        name: 'Thread limit',
        value: `skip ${req.query.skip} and limit ${req.query.limit}`,
      },
      { name: 'timestamp', value: new Date() },
    ],
    platform: req.headers.platform, // TBD - need to get this info from req
    source: req.headers.source, // TBD - need to get this info from req
    entity: 'message',
    documentId: req.query.userId,
    change: [],
    createdBy: res.locals.userId || res.locals.adminId,
  });

  return message.length
    ? message
        .map((item) => {
          const [app] = item.app ? item.app : null;
          const chats =
            item.chats && item.chats.length
              ? item.chats
                  .sort(
                    (a, b) =>
                      new Date(a.postedAt).getTime() -
                      new Date(b.postedAt).getTime()
                  )
                  .reverse()
              : item.chats;
          var messageItem = { ...item, app, chats };

          if (item.participants) {
            messageItem.participants = {
              sender:
                item.participants.sender.id === req.query.userId
                  ? item.participants.recipient
                  : item.participants.sender,
              recipient:
                item.participants.sender.id === req.query.userId
                  ? item.participants.sender
                  : item.participants.recipient,
            };
          }
          messageItem.unreadCount =
            messageItem.chats && messageItem.chats.length
              ? messageItem.chats.length
              : 0;
          messageItem.chats =
            messageItem.chats && messageItem.chats.length
              ? [messageItem.chats[0]]
              : messageItem.chats;
          return messageItem.participants ? messageItem : null;
        })
        .filter((item) => item)
    : [];
};
/**
 * @description - Get all message threads with unread count based on match App Id, recipient.
 * @note - commented aggregation query code required for further enhancement
 */
var getThreads = async function (req, res) {
  logger.info(`message : dao getThreads : received request`);
  try {
    var message;
    const payload = {};
    if (req.query.appId) {
      payload.app = mongoose.Types.ObjectId(req.query.appId);
    }
    message = await messages.aggregate([
      {
        $match: payload,
      },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: 'apps',
          localField: 'app',
          foreignField: '_id',
          as: 'app1',
        },
      },
      {
        $project: {
          title: 1,
          createdAt: 1,
          updatedAt: 1,
          'app1.appName': 1,
          'app1._id': 1,
          app: 1,
          chats: {
            $filter: {
              input: '$chats',
              as: 'chat',
              cond: {
                $and: [
                  {
                    $eq: ['$$chat.isRead', 'false'],
                  },
                  {
                    $eq: ['$$chat.recipient.id', req.query.userId],
                  },
                ],
              },
            },
          },
          // participants section use for LEAP patient API only
          participants: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$chats',
                  as: 'chat',
                  cond: {
                    $or: [
                      {
                        $eq: ['$$chat.recipient.id', req.query.userId],
                      },
                      {
                        $eq: ['$$chat.sender.id', req.query.userId],
                      },
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      { $skip: Number(req.query.skip) },
      { $limit: Number(req.query.limit) },
    ]);
    if (message) {
      // return message;
      message = message.map((item) => {
        // eslint-disable-next-line no-param-reassign
        item.app = item.app1;
        return item;
      });
      return _formatThreads(req, res, message);
    } else {
      throw new Error(`Error while fetching threads`);
    }
  } catch (e) {
    logger.error(`message : dao : getThreads : Error : ${e}`);
    throw e;
  }
};

var getParticipantsUnreadCount = async function (req) {
  logger.info(`message : dao getParticipantsUnreadCount : received request`);
  try {
    const messageCount = await messages.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $project: {
          title: 1,
          app: 1,
          chats: {
            $filter: {
              input: '$chats',
              as: 'chat',
              cond: {
                $and: [
                  {
                    $eq: ['$$chat.isRead', 'false'],
                  },
                  {
                    $eq: ['$$chat.recipient.id', req.query.userId],
                  },
                ],
              },
            },
          },
        },
      },
      { $unwind: '$chats' },
      {
        $group: {
          _id: {
            id: '$chats.sender.id',
            user: '$chats.sender.name',
          },
          count: { $sum: 1 },
        },
      },
    ]);
    return messageCount && messageCount.length
      ? messageCount.map((item) => ({ ...item._id, count: item.count }))
      : null;
  } catch (e) {
    logger.error(`message : dao : getThreads : Error : ${e}`);
    throw e;
  }
};

var getParticipantList = async function (req) {
  logger.info(`message : dao getParticipantList : received request`);
  try {
    const participants = await messages.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $project: {
          title: 1,
          app: 1,
          chats: {
            $filter: {
              input: '$chats',
              as: 'chat',
              cond: {
                $and: [
                  // {
                  //   $eq: ['$$chat.isRead', 'false'],
                  // },
                  {
                    $eq: ['$$chat.recipient.id', req.query.userId],
                  },
                ],
              },
            },
          },
        },
      },
      { $unwind: '$chats' },
      {
        $group: {
          _id: {
            id: '$chats.sender.id',
            user: '$chats.sender.name',
          },
        },
      },
    ]);

    if (participants && participants.length) {
      return participants.map((item) => ({ ...item._id }));
    } else {
      throw new Error(`Error while fetching participants`);
    }
  } catch (e) {
    logger.error(`message : dao : participantsList : Error : ${e}`);
    throw e;
  }
};

/**
 * @description - Get all Participants with unread count based on match thread Id, UserId.
 */
var getParticipants = async function (req, res) {
  logger.info(`message : dao getParticipants : received request`);
  try {
    const [participantList, participantUnreadCount] = await Promise.all([
      getParticipantList(req),
      getParticipantsUnreadCount(req),
    ]);
    if (participantList && participantList.length) {
      createAudit({
        system: 'LEAP',
        action: 'getParticipant',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'Researcher Id', value: req.query.userId },
          {
            name: 'Thread Id',
            value: req.params.id,
          },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'message',
        documentId: req.query.userId,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });

      return participantList.map((item) => {
        const isCount = participantUnreadCount
          ? participantUnreadCount.find((countItem) => countItem.id === item.id)
          : null;
        return { ...item, count: isCount ? isCount.count : 0 };
      });
    } else {
      throw new Error(`Error while fetching threads`);
    }
  } catch (e) {
    logger.error(`message : dao : getThreads : Error : ${e}`);
    throw e;
  }
};
var updateThread = async function (req, res) {
  logger.info(`message : dao : updateThread : received request`);
  try {
    const message = await messages.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
        updatedAt: new Date(),
        createdBy: res.locals.userId,
        updatedBy: res.locals.userId,
      },
      {
        new: true,
        projection: {
          chats: false,
          __v: false,
        },
      }
    );
    if (message) {
      return message;
    }
    throw new Error(`Error while updating message thread`);
  } catch (e) {
    logger.error(`message : dao : updateThread : Error : ${e}`);
    throw e;
  }
};

/**
 * @description - Get all message mark as a read based on match thread Id, recipientId.
 */
var markAsRead = async function (req) {
  logger.info(`message : dao : markAsRead : received request`);
  try {
    const message = await messages.updateOne(
      {
        _id: req.params.id,
        'chats.recipient.id': req.query.recipientId,
        'chats.sender.id': req.query.senderId,
      },
      {
        $set: {
          'chats.$[chat].isRead': true,
        },
      },
      {
        arrayFilters: [
          {
            'chat.recipient.id': req.query.recipientId,
            'chat.sender.id': req.query.senderId,
          },
        ],
      }
    );
    if (message) {
      return { message: 'chats mark as a read successfully' };
    }
    throw new Error(`Error while updating message thread`);
  } catch (e) {
    logger.error(`message : dao : markAsRead : Error : ${e}`);
    throw e;
  }
};

/**
 * @description - Get all message
 */
var getChats = async function (req, res) {
  logger.info(`message : dao : getChats : received request`);
  try {
    const message = await _getMessages(
      req.params.id,
      req.query.senderId,
      req.query.recipientId,
      req.query.skip,
      req.query.limit
    );
    if (message) {
      createAudit({
        system: 'LEAP',
        action: 'getMessages',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'User  Id', value: req.query.recipientId },
          {
            name: 'Thread Id',
            value: req.params.id,
          },
          {
            name: 'Thread limit',
            value: `skip ${req.query.skip} and limit ${req.query.limit}`,
          },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'message',
        documentId: req.query.recipientId,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });

      return message;
    }
    throw new Error(`Error while getting message thread`);
  } catch (e) {
    logger.error(`message : dao : getChats : Error : ${e}`);
    throw e;
  }
};

/**
 * @description - Get unread count
 */
var unreadCount = async function (req, res) {
  logger.info(`message : dao unreadCount : received request`);
  try {
    var message;
    const payload = {};
    if (req.query.appId) {
      payload.app = mongoose.Types.ObjectId(req.query.appId);
    }
    message = await messages.aggregate([
      {
        $match: payload,
      },
      {
        $project: {
          unreadCount: {
            $size: {
              $filter: {
                input: '$chats',
                as: 'chat',
                cond: {
                  $and: [
                    {
                      $eq: ['$$chat.isRead', 'false'],
                    },
                    {
                      $eq: ['$$chat.recipient.id', req.query.userId],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ]);
    if (message) {
      createAudit({
        system: 'LEAP',
        action: 'unreadCount',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'User  Id', value: res.locals.userId },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'message',
        documentId: req.query.userId,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });
      return message.length
        ? {
            count: message.reduce(
              (result, item) => result + item.unreadCount,
              0
            ),
          }
        : { count: 0 };
    } else {
      throw new Error(`Error while fetching unread Count`);
    }
  } catch (e) {
    logger.error(`message : dao : unreadCount : Error : ${e}`);
    throw e;
  }
};

var titleSearch = async function (req, res) {
  logger.info(`message : dao : titleSearch : received request`);
  try {
    var message;
    if (req.query.appId) {
      message = await messages.aggregate([
        {
          $match: {
            $text: { $search: req.query.search },
            app: mongoose.Types.ObjectId(req.query.appId),
          },
        },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: 'apps',
            localField: 'app',
            foreignField: '_id',
            as: 'app',
          },
        },
        {
          $project: {
            title: 1,
            createdAt: 1,
            updatedAt: 1,
            'app.appName': 1,
            'app._id': 1,
            chats: {
              $filter: {
                input: '$chats',
                as: 'chat',
                cond: {
                  $and: [
                    {
                      $eq: ['$$chat.isRead', 'false'],
                    },
                    {
                      $eq: ['$$chat.recipient.id', req.query.userId],
                    },
                  ],
                },
              },
            },
            // participants section use for LEAP patient API only
            participants: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$chats',
                    as: 'chat',
                    cond: {
                      $or: [
                        {
                          $eq: ['$$chat.recipient.id', req.query.userId],
                        },
                        {
                          $eq: ['$$chat.sender.id', req.query.userId],
                        },
                      ],
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        { $skip: Number(req.query.skip) },
        { $limit: Number(req.query.limit) },
      ]);
    } else {
      message = await messages.aggregate([
        { $match: { $text: { $search: req.query.search } } },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: 'apps',
            localField: 'app',
            foreignField: '_id',
            as: 'app',
          },
        },
        {
          $project: {
            title: 1,
            createdAt: 1,
            updatedAt: 1,
            'app.appName': 1,
            'app._id': 1,
            chats: {
              $filter: {
                input: '$chats',
                as: 'chat',
                cond: {
                  $and: [
                    {
                      $eq: ['$$chat.isRead', 'false'],
                    },
                    {
                      $eq: ['$$chat.recipient.id', req.query.userId],
                    },
                  ],
                },
              },
            },
            // participants section use for LEAP patient API only
            participants: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$chats',
                    as: 'chat',
                    cond: {
                      $or: [
                        {
                          $eq: ['$$chat.recipient.id', req.query.userId],
                        },
                        {
                          $eq: ['$$chat.sender.id', req.query.userId],
                        },
                      ],
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        { $skip: Number(req.query.skip) },
        { $limit: Number(req.query.limit) },
      ]);
    }

    if (message) {
      return _formatThreads(req, res, message);
    } else {
      throw new Error(`Error while fetching threads`);
    }
  } catch (e) {
    logger.error(`message : dao : titleSearch : Error : ${e}`);
    throw e;
  }
};

module.exports.createThread = createThread;
module.exports.createChat = createChat;
module.exports.getThreads = getThreads;
module.exports.getParticipants = getParticipants;
module.exports.updateThread = updateThread;
module.exports.markAsRead = markAsRead;
module.exports.getChats = getChats;
module.exports.unreadCount = unreadCount;
module.exports.titleSearch = titleSearch;
