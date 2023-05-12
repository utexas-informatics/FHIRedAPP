var messageDAO = require('../dao/message.dao');
var logger = require('../config/logger');
var messageDAO = require('../dao/message.dao');
const jwt_decode = require('jwt-decode');
var userDAO = require('../dao/user.dao');
var createThread = async function (req, res) {
  logger.info(`message : service : createThread : received request`);
  try {
    var message = await messageDAO.createThread(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : createThread : Error : ${e}`);
    throw e;
  }
};

var createChat = async function (req, res) {
  logger.info(`message : service : createChat : received request`);
  try {
    if(req.body.sender == null){
    // 1. verify sender
    const decodedHeader = jwt_decode(
      req.headers.authorization.replace('bearer ', '')
    );
    req.body = { ...req.body, emailId: decodedHeader.email };
    user = await userDAO.getUserByEmailId(req, res);
    if(user._id){
    // 2. Send the ,message if sender is not correct
    user = JSON.parse(JSON.stringify(user))
    const senderNew = {id: user._id,
      name: (user.firstName ? user.firstName: "")+ " " +  (user.lastName ? user.lastName: "")
    }
    delete req.body.emailId
    req.body.sender ={...senderNew}
   
    }else{
      throw new Error("Sender id is not valid") 
    }
  } 
  var message = await messageDAO.createChat(req, res);
  return message;
  } catch (e) {
    logger.error(`message : service : createChat : Error : ${e}`);
    throw e;
  }
};

var getThreads = async function (req, res) {
  logger.info(`message : service : getThreads : received request`);
  try {
    var message = await messageDAO.getThreads(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : getThreads : Error : ${e}`);
    throw e;
  }
};

var getParticipants = async function (req, res) {
  logger.info(`message : service : getParticipants : received request`);
  try {
    var message = await messageDAO.getParticipants(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : getParticipants : Error : ${e}`);
    throw e;
  }
};

var updateThread = async function (req, res) {
  logger.info(`message : service : updateThread : received request`);
  try {
    var message = await messageDAO.updateThread(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : updateThread : Error : ${e}`);
    throw e;
  }
};

var markAsRead = async function (req, res) {
  logger.info(`message : service : markAsRead : received request`);
  try {
    var message = await messageDAO.markAsRead(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : markAsRead : Error : ${e}`);
    throw e;
  }
};

var getChats = async function (req, res) {
  logger.info(`message : service : getChats : received request`);
  try {
    var message = await messageDAO.getChats(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : getChats : Error : ${e}`);
    throw e;
  }
};

var unreadCount = async function (req, res) {
  logger.info(`message : service : unreadCount : received request`);
  try {
    var message = await messageDAO.unreadCount(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : unreadCount : Error : ${e}`);
    throw e;
  }
};

var titleSearch = async function (req, res) {
  logger.info(`message : service : titleSearch : received request`);
  try {
    var message = await messageDAO.titleSearch(req, res);
    return message;
  } catch (e) {
    logger.error(`message : service : titleSearch : Error : ${e}`);
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
