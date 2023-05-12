const dbHandler = require('../db-handler');
const appSettingDAO = require('../../src/dao/app-setting.dao');

describe('AppSetting DAO', () => {
  const id = 1;
  const params = { id };
  const body = {
    sessionTimeOutPeriod: 1,
    emailVerificationCodeExpiryPeriod: 24,
    loginAttemptsAllowed: 3,
    invalidLoginLockPeriod: 4,
    timeZone: 'UTC',
    dateFormat: 'MM-DD-YYYY',
    appConsentExpiryPeriod: 5,
    emailLoginLinkValidityPeriod: 10,
    loginExpiryPeriod: 3,
    studyCoOrdinatorEmail: 'test',
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
  it('should create appSetting correctly', async () => {
    const appSetting = await appSettingDAO.createAppSetting(req, res);
    expect(appSetting._id).toBeDefined();
    expect(appSetting.timeZone).toBe('UTC');
    expect(appSetting.dateFormat).toBe('MM-DD-YYYY');
    expect(appSetting.studyCoOrdinatorEmail).toBe('test');
  });

  it('should get appSetting correctly', async () => {
    const appSetting = await appSettingDAO.createAppSetting(req, res);
    if (appSetting) {
      req.params.id = appSetting._id;
      expect(
        async () => await appSettingDAO.getAppSettingById(req)
      ).not.toThrow();
    }
  });

  it('should update appSetting correctly', async () => {
    const appSetting = await appSettingDAO.createAppSetting(req, res);
    if (appSetting) {
      req.params.id = appSetting._id;
      req.body.timeZone = 'CST';
      const updatedAppSetting = await appSettingDAO.updateAppSettings(req, res);
      expect(updatedAppSetting.timeZone).toBe(req.body.timeZone);
    }
  });
});
