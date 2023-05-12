const dbHandler = require('../db-handler');
const appDAO = require('../../src/dao/app.dao');

describe('App DAO', () => {
  const id = 1;
  const params = { id };
  const body = {
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
  const req = {
    params,
    body,
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
  it('should create app correctly', async () => {
    const app = await appDAO.createApp(req, res);
    expect(app._id).toBeDefined();
    expect(app.isDeleted).toBe(false);
    expect(app.isActive).toBe(true);
    expect(app.createdAt).toBeDefined();
    expect(app.createdBy).toBe(res.locals.userName);
    expect(app.updatedAt).toBeDefined();
    expect(app.updatedBy).toBe(res.locals.userName);
  });

  it('should get app correctly', async () => {
    const a = await appDAO.createApp(req, res);
    if (a) {
      req.params.id = a._id;
      expect(async () => await appDAO.getAppById(req)).not.toThrow();
    }
  });

  it('should update app correctly', async () => {
    const a = await appDAO.createApp(req, res);
    if (a) {
      req.params.id = a._id;
      req.body.appName = 'new app name';
      const app = await appDAO.updateApp(req, res);
      expect(app.appName).toBe(req.body.appName);
    }
  });

  it('should get app collection correctly', async () => {
    await dbHandler.closeDatabase();
    await dbHandler.connect();
    // create 2 apps
    await appDAO.createApp(req, res);
    await appDAO.createApp(req, res);
    expect(async () => await appDAO.getAllApps(req)).not.toThrow();
    const apps = await appDAO.getAllApps(req);
    expect(apps.length).toBe(2);
  });
});
