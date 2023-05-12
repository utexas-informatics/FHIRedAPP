const dbHandler = require('../db-handler');
const auditDAO = require('../../src/dao/audit.dao');
const auditTypes = require('../../src/models/audit-models/audit-type');

describe('Audit DAO', () => {
  const action = 'AcceptConsent';

  beforeAll(async (done) => {
    await dbHandler.connect();
    done();
  });
  afterAll(async (done) => {
    await dbHandler.closeDatabase();
    done();
  });
  it('should create audit correctly', async () => {
    const auditType = await auditTypes.create({
      name: action,
      action: 'Consent given to an external app',
      createdBy: 'user name',
      updatedBy: 'user name',
    });
    const mockAuditData = {
      system: 'LEAP',
      action: auditType._id,
      actionData: [
        {
          name: 'appId',
          value: '5fec6f6e8048d25b1c189a2d',
        },
      ],
      platform: 'mobile, web etc..',
      source: 'device-id or ip of requester',
      entity: 'User, App etc..',
      documentId: '_id of document updated',
      change: [
        {
          fieldName: 'appName',
          oldValue: 'old name',
          newValue: 'new name',
        },
      ],
      createdBy: 'user name',
    };
    const app = await auditDAO.createAudit(mockAuditData);
    expect(app._id).toBeDefined();
    expect(app.isDeleted).toBe(false);
    expect(app.createdAt).toBeDefined();
  });
});
