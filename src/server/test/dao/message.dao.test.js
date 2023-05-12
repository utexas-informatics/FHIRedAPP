const dbHandler = require('../db-handler');
const messageDAO = require('../../src/dao/message.dao');
const appDAO = require('../../src/dao/app.dao');

describe('Message DAO', () => {
  const id = 1;
  const params = { id };
  let req;

  const body = {
    title: 'test group Title',
  };

  const appBody = {
    appName: 'appName',
    appLogo: 'https://url_to_app_logo_location',
    appUrl: 'https://url_to_app_url_location',
    longDescription: 'longDescription',
    shortDescription: 'shortDescription',
    consentVersion: 'v1',
    consentTermOfUse: 'test',
    consentPrivacy: 'test',
    consentInformation: 'test',
    consentPolicy: '<b>test</b>',
    isSSOEnabled: false,
  };
  const chats = {
    sender: { id: '1', name: 'abc' },
    recipient: { id: '2', name: 'xyz' },
    body: 'hi, how are you',
  };

  const chatReq = {
    params,
    body: chats,
  };

  const appReq = {
    params,
    body: appBody,
  };

  const res = { locals: { userName: 'firstName lastName' } };

  beforeAll(async (done) => {
    await dbHandler.connect();
    done();
  });
  afterAll(async (done) => {
    await dbHandler.closeDatabase();
    done();
  });
  beforeEach(() => {
    req = { params, body };
  });

  var thread;
  var app;
  it('should create the message thread correctly with refernce', async () => {
    app = await appDAO.createApp(appReq, res);
    req.body.app = app._id;
    thread = await messageDAO.createThread(req, res);

    expect(thread._id).toBeDefined();
    expect(thread.app).toBe(app._id);
    expect(thread.createdAt).toBeDefined();
    expect(thread.createdBy).toBe(res.locals.userName);
    expect(thread.updatedAt).toBeDefined();
    expect(thread.updatedBy).toBe(res.locals.userName);
    expect(thread.chats.length).toEqual(0);
  });

  it('should get all thread correctly by appID and userID', async () => {
    const appId = app._id;
    const threadReq = {
      query: { appId, userId: id },
    };
    threadReq.query.appId = thread.app;
    const getThread = await messageDAO.getThreads(threadReq, res);
    expect(getThread[0]._id).toBeDefined();
    expect(getThread[0].app).toEqual(appId);
    expect(getThread[0].title).toBe(thread.title);
    expect(getThread.length).toEqual(1);
    expect(getThread[0].createdAt).toBeDefined();
    expect(getThread[0].updatedAt).toBeDefined();
  });

  it('should create chats correctly', async () => {
    chatReq.params.id = thread._id;
    expect(thread.chats.length).toEqual(0);
    const chatDocs = await messageDAO.createChat(chatReq, res);
    expect(chatDocs[0].chats.length).toEqual(1);
    expect(chatDocs[0].chats[0]._id).toBeDefined();
    expect(chatDocs[0].chats[0].sender.id).toEqual(chatReq.body.sender.id);
    expect(chatDocs[0].chats[0].recipient.id).toBe(chatReq.body.recipient.id);
    expect(chatDocs[0].chats[0].sender.name).toBe(chatReq.body.sender.name);
    expect(chatDocs[0].chats[0].sender.name).toBe(chatReq.body.sender.name);
    expect(chatDocs[0].chats[0].body).toBe(chatReq.body.body);
    expect(chatDocs[0].chats[0].isRead).toBe('false');
    expect(chatDocs[0].chats[0].isDeleted).toBe('false');
    expect(chatDocs[0].chats[0].postedAt).toBeDefined();
  });

  it('should get all messages/chats of the message thread', async () => {
    const appId = app._id;
    const threadReq = {
      query: { appId, userId: id },
    };
    threadReq.query.appId = thread.app;
    const getThread = await messageDAO.getThreads(threadReq, res);
    const chatsReq = {
      params: {
        id: getThread[0]._id,
      },
      query: {
        senderId: chats.sender.id,
        recipientId: chats.recipient.id,
      },
    };
    const getAllChats = await messageDAO.getChats(chatsReq, res);

    expect(getAllChats.length).toEqual(1);
    expect(getAllChats[0].chats[0].sender.id).toEqual(chatsReq.query.senderId);
    expect(getAllChats[0].chats[0].recipient.id).toEqual(
      chatsReq.query.recipientId
    );
  });

  it('should get participants for the message thread', async () => {
    const appId = app._id;
    const threadReq = {
      query: { appId, userId: id },
    };
    threadReq.query.appId = thread.app;
    const getThread = await messageDAO.getThreads(threadReq, res);
    const participantsReq = {
      params: {
        id: getThread[0]._id,
      },
      query: {
        userId: chats.recipient.id,
      },
    };
    await messageDAO.getParticipants(participantsReq, res);
  });

  it('should update read status as read', async () => {
    const appId = app._id;
    const threadReq = {
      query: { appId, userId: id },
    };
    threadReq.query.appId = thread.app;
    const getThread = await messageDAO.getThreads(threadReq, res);
    const readReq = {
      params: {
        id: getThread[0]._id,
      },
      query: {
        recipientId: chats.recipient.id,
      },
    };
    const getReadStatus = await messageDAO.markAsRead(readReq, res);
    expect(getReadStatus.message).toBe('chats mark as a read successfully');
  });
});
