/* eslint-disable global-require */
const request = require('supertest');

const { getApp } = require('../../mock-express');
const errorResponse = require('../../../src/config/error-response');
const constants = require('../../../src/config/constants');

describe('audit routes request validation', () => {
  describe('/api/audits - createAudit', () => {
    const mockRequest = {
      system: 'LEAP',
      action: 'AcceptConsent',
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
    const mockResponse = { _id: 1 };
    const mockErrorMessage = 'mock error';
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('SUCCESS', async (done) => {
      const controller = require('../../../src/controllers/audit.controller');
      controller.createAudit = jest
        .fn()
        .mockImplementationOnce((req, res, next) => {
          res.json(mockResponse);
        });
      const auditRoutes = require('../../../src/routes/audit.route');
      const express = require('express');
      const app = express();
      app.use('/api/audits', auditRoutes);
      const response = await request(app)
        .post('/api/audits')
        .send(mockRequest)
        .set('authorization', 'mock-access-token');
      expect(response.body).toEqual(mockResponse);
      expect(response.statusCode).toBe(200);
      done();
    });
    it('NOT FOUND', async (done) => {
      const auditRoutes = require('../../../src/routes/audit.route');
      const app = getApp('/api/audits', auditRoutes);
      const response = await request(app).get('/api/unknown-path');
      expect(response.statusCode).toBe(404);
      done();
    });
    it('INTERNAL SERVER ERROR', async (done) => {
      const controller = require('../../../src/controllers/audit.controller');
      const spy = jest
        .spyOn(controller, 'createAudit')
        .mockImplementationOnce((req, res, next) => {
          res
            .status(constants.error.internalServerError.status)
            .json(
              errorResponse.build(
                constants.error.internalServerError,
                mockErrorMessage,
                mockErrorMessage
              )
            );
        });
      const auditRoutes = require('../../../src/routes/audit.route');
      const express = require('express');
      const app = express();
      app.use((err, req, res, next) => res.status(err.status).json(err));
      app.use('/api/audits', auditRoutes);
      const response = await request(app)
        .post('/api/audits')
        .set('authorization', 'mock-access-token');
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe(mockErrorMessage);
      spy.mockRestore();
      done();
    });
    it('BAD REQUEST', async (done) => {
      const auditRoutes = require('../../../src/routes/audit.route');
      const app = getApp('/api/audits', auditRoutes);
      const response = await request(app).post('/api/audits');
      expect(response.statusCode).toBe(400);
      expect(response.body.details.body.length).toBe(1);
      expect(response.body.details.body[0].path[0]).toBe('system');
      done();
    });
  });
});
