const dbHandler = require('../db-handler');
const inviteCodeDAO = require('../../src/dao/invite-code.dao');
const inviteCodes = require('../../src/models/invite-code');

describe('inviteCode DAO', () => {
  const id = 1;
  const params = { id };
  const body = {
    codes: ['c1', 'c2'],
  };
  const req = {
    params,
    body,
  };
  const res = { locals: { userName: 'firstName lastName' } };

  beforeAll(async (done) => {
    await dbHandler.connect();
    await inviteCodeDAO.createInviteCode(req, res);
    done();
  });
  afterAll(async (done) => {
    await dbHandler.closeDatabase();
    done();
  });

  it('should create invite codes correctly', async () => {
    const codes = await inviteCodes.find({});
    expect(codes.length).toBe(2);
  });

  it('should get and update inviteCode correctly', async () => {
    const codes = await inviteCodes.find({});
    req.params.id = codes[0]._id;
    const inviteCode = await inviteCodeDAO.getInviteCodeById(req);
    expect(inviteCode.isActive).toBe(true);
    req.body.isActive = false;
    await inviteCodeDAO.updateInviteCode(req, res);
    const inviteCodeUpdated = await inviteCodeDAO.getInviteCodeById(req);
    expect(inviteCodeUpdated.isActive).toBe(false);
  });

  it('should get status by code correctly', async () => {
    const codes = await inviteCodes.find({});
    req.params.code = codes[1].code;
    const inviteCode = await inviteCodeDAO.getStatus(req);
    expect(inviteCode).toBe(true);
  });
});
