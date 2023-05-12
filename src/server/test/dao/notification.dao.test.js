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
const nDAO = require('../../src/dao/notification.dao');
const uDAO = require('../../src/dao/user.dao');
const nDC = require('../../src/models/notification-delivery-channel');
const notificationTemplates = require('../../src/models/notification-template');
const notificationTypes = require('../../src/models/notification-type');

describe('Notification DAO', () => {
  const id = 1;
  const params = { id };
  const body = {
    title: 'test title',
    message: 'test message',
  };
  let req;
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
  const appReq = {
    params,
    body: appBody,
  };
  const res = {
    locals: { userName: 'firstName lastName', adminName: 'admin name' },
  };
  beforeAll(async (done) => {
    await dbHandler.connect();
    const nDCDoc = await nDC.create({
      name: 'InApp',
      createdBy: 'user name',
      updatedBy: 'user name',
    });
    const templateDoc = await notificationTemplates.create({
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
  beforeEach(() => {
    req = { params, body };
  });

  it('should create notification correctly and should add ref to corresponding app', async () => {
    const app = await appDAO.createApp(appReq, res);
    req.body.app = app._id;
    expect(app.notifications.length).toEqual(0);
    const doc = await nDAO.createNotification(req, res);
    expect(doc._id).toBeDefined();
    expect(doc.isDeleted).toBe(false);
    expect(doc.isActive).toBe(true);
    expect(doc.createdAt).toBeDefined();
    expect(doc.createdBy).toBe(res.locals.userName);
    expect(doc.updatedAt).toBeDefined();
    expect(doc.updatedBy).toBe(res.locals.userName);
    appReq.params.id = app._id;
    const updatedApp = await appDAO.getAppById(appReq);
    expect(updatedApp.notifications.length).toEqual(1);
    expect(updatedApp.notifications.includes(doc._id)).toBe(true);
  });

  it('should get notification correctly', async () => {
    const app = await appDAO.createApp(appReq, res);
    req.body.app = app._id;
    const n = await nDAO.createNotification(req, res);
    expect(async () => await nDAO.getNotificationById(n._id)).not.toThrow();
  });

  it(`sendNotifications: should create ref of notification in user(s) consented it's app`, async () => {
    const uBody = {
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
    const uReq = {
      params,
      body: uBody,
    };
    const u = await uDAO.createUser(uReq, res);
    const a = await appDAO.createApp(appReq, res);
    uReq.params.id = u._id;
    uReq.body = { appId: a._id, consentedMedicalRecords: [] };
    await uDAO.acceptConsent(uReq, res);
    req.body.app = a._id;
    const n = await nDAO.createNotification(req, res);
    req.body = { notifications: [n._id] };
    const status = await nDAO.mapNotifications(req, res);
    const expectedStatus = true;
    expect(status).toEqual(expectedStatus);
  });
});
