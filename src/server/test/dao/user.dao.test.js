const Handlebars = require('handlebars');
const fetch = require('node-fetch');

jest.mock('node-fetch', () => jest.fn());
fetch.mockImplementation(
  () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve('1234'),
    })
  // eslint-disable-next-line function-paren-newline
);
const dbHandler = require('../db-handler');
const appDAO = require('../../src/dao/app.dao');
const userDAO = require('../../src/dao/user.dao');
const nDC = require('../../src/models/notification-delivery-channel');
const notificationTemplates = require('../../src/models/notification-template');
const notificationTypes = require('../../src/models/notification-type');

describe('User DAO', () => {
  const id = 1;
  const params = { id };
  const body = {
    firstName: 'firstName',
    lastName: 'lastName',
    birthday: '10/05/1992',
    email: 'test@test.com',
    gender: 'male',
    phoneNumberPrimary: '1234567890',
    phoneNumberSecondary: '1234567890',
    invitationCode: 'MAFB4326',
    zip: 123456,
    role: '5ff40c7e153fc3d42838f9cb',
    createdBy: 'user name',
    updatedBy: 'user name',
  };
  const req = {
    params,
    body,
  };
  const res = {
    locals: { userName: 'firstName lastName', adminName: 'admin name' },
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
  const appReq = { body: appBody };
  let userDoc;
  let templateDoc;
  let a;

  beforeAll(async (done) => {
    await dbHandler.connect();
    // req = { params, body };
    userDoc = await userDAO.createUser(req, res);
    const nDCDoc = await nDC.create({
      name: 'InApp',
      createdBy: 'user name',
      updatedBy: 'user name',
    });
    a = await appDAO.createApp(appReq, res);
    templateDoc = await notificationTemplates.create({
      name: 'AcceptConsent-InApp',
      title: 'Consent accepted',
      message: `You have accepted a consent for '{{appName}}' at '{{consentUpdatedAt}}'.`,
      deliveryChannel: nDCDoc._id,
      createdBy: 'user name',
      updatedBy: 'user name',
    });
    await notificationTypes.create({
      name: 'AcceptConsent',
      templates: [templateDoc._id],
      isDeleted: false,
      isActive: true,
      createdAt: new Date(),
      createdBy: 'user name',
      updatedAt: new Date(),
      updatedBy: 'user name',
    });
    done();
  });
  afterAll(async (done) => {
    await dbHandler.closeDatabase();
    done();
  });
  beforeEach(async () => {
    userDoc.apps = [];
    userDoc.notifications = [];
    userDoc = await userDoc.save();
  });
  it('should create user correctly', async () => {
    expect(userDoc._id).toBeDefined();
    expect(userDoc.isDeleted).toBe(false);
    expect(userDoc.createdAt).toBeDefined();
    expect(userDoc.createdBy).toBe(res.locals.userName);
    expect(userDoc.updatedAt).toBeDefined();
    expect(userDoc.updatedBy).toBe(res.locals.userName);
  });

  it('should get user correctly', async () => {
    if (userDoc) {
      req.params.id = userDoc._id;
      expect(async () => await userDAO.getUserById(req)).not.toThrow();
      req.params.emailId = userDoc.email;
      expect(async () => await userDAO.getUserByEmailId(req)).not.toThrow();
    }
  });

  it('should update user correctly', async () => {
    if (userDoc) {
      req.params.id = userDoc._id;
      req.body.firstName = 'new name';
      const doc = await userDAO.updateUser(req, res);
      expect(doc.firstName).toBe(req.body.firstName);
    }
  });

  // apps related test cases
  it('should acceptConsent correctly', async () => {
    if (userDoc) {
      if (a) {
        req.params.id = userDoc._id;
        req.body = { appId: a._id, consentedMedicalRecords: [] };
        const user = await userDAO.acceptConsent(req, res);
        expect(
          user.apps.find((app) => app.app._id.equals(a._id)).isActive
        ).toBe(true);
      }
    }
  });

  it('should revokeConsent correctly', async () => {
    if (userDoc) {
      if (a) {
        req.params.id = userDoc._id;
        req.body = { appId: a._id, consentedMedicalRecords: [] };
        const user = await userDAO.acceptConsent(req, res);
        if (user) {
          req.body = { appIds: [a._id] };
          const updatedUser = await userDAO.revokeConsent(req, res);
          expect(
            updatedUser.apps.find((app) => app.app._id.equals(a._id)).isActive
          ).toBe(false);
        }
      }
    }
  });

  it('should get apps consented by user correctly', async () => {
    if (userDoc) {
      if (a) {
        req.params.id = userDoc._id;
        req.body = { appId: a._id, consentedMedicalRecords: [] };
        await userDAO.acceptConsent(req, res);
        const apps = await userDAO.getAppsByUserId(req);
        expect(apps.findIndex((ap) => ap.app._id.equals(a._id))).not.toBe(-1);
        expect(apps[0].app.isActive).toBe(true);
      }
    }
  });

  // notifications related test cases
  it('should create an unread notification for user on accepting consent', async () => {
    if (userDoc) {
      if (a) {
        req.params.id = userDoc._id;
        req.body = { appId: a._id, consentedMedicalRecords: [] };
        expect(userDoc.notifications.length).toEqual(0);
        const updatedUser = await userDAO.acceptConsent(req, res);
        expect(updatedUser.notifications.length).toBeGreaterThanOrEqual(1);
        expect(updatedUser.notifications[0].isRead).toBe(false);
      }
    }
  });

  it('getNotificationsByUserId: should get notifications of user with transformed message in template', async () => {
    req.params.id = userDoc._id;
    req.body = { appId: a._id, consentedMedicalRecords: [] };
    await userDAO.acceptConsent(req, res);
    const uNotifications = await userDAO.getNotificationsByUserId(req);
    const un = uNotifications[0];
    const template = Handlebars.compile(templateDoc.message);
    const { appName } = a;
    const updatedUser = await userDAO.getUserById(req);
    const appFound = updatedUser.apps.find((ap) => ap.app._id.equals(a._id));
    const { consentUpdatedAt } = appFound;
    const expectedMessage = template({ appName, consentUpdatedAt });
    expect(un.notification.message).toEqual(expectedMessage);
  });

  it('getNotificationsByUserId: should get notifications of user in pagination', async () => {
    for await (const ar of new Array(20)) {
      const ap = await appDAO.createApp(appReq, res);
      req.body = { appId: ap._id, consentedMedicalRecords: [] };
      await userDAO.acceptConsent(req, res);
    }
    const updatedUser = await userDAO.getUserById(req);
    const nReq = {
      params: { id: userDoc._id },
      query: { page: 1, size: 5 },
    };
    const paginatedNs = await userDAO.getNotificationsByUserId(nReq);
    const sortedNs = updatedUser.notifications.sort(
      (c, b) => new Date(b.createdAt) - new Date(c.createdAt)
    );
    expect(paginatedNs.length).toEqual(5); // size assertion
    expect(sortedNs[5].notification).toEqual(paginatedNs[0].notification._id); // page assertion
  });

  it('should mark an unread notification as read', async () => {
    if (userDoc) {
      if (a) {
        req.params.id = userDoc._id;
        req.body = { appId: a._id, consentedMedicalRecords: [] };
        const consentAcceptedUser = await userDAO.acceptConsent(req, res);
        expect(consentAcceptedUser.notifications[0].isRead).toBe(false);
        req.body = {
          notificationId: consentAcceptedUser.notifications[0].notification,
        };
        const updatedUser = await userDAO.markNotificationAsRead(req, res);
        expect(updatedUser.notifications[0].isRead).toBe(true);
      }
    }
  });
});
