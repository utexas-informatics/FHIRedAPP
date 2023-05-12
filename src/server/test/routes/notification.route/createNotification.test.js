/* eslint-disable global-require */
const request = require('supertest');

const { getApp } = require('../../mock-express');
const errorResponse = require('../../../src/config/error-response');
const constants = require('../../../src/config/constants');

const mockResponse = { _id: 1 };
const mockErrorMessage = 'mock error';

describe('notification routes request validation', () => {
  describe('/api/notifications - createNotification', () => {
    beforeEach(() => jest.clearAllMocks());
    it('SUCCESS', async (done) => {
      const controller = require('../../../src/controllers/notification.controller');
      controller.generateNotification = jest
        .fn()
        .mockImplementationOnce((req, res, next) => {
          res.json(mockResponse);
        });
      const notificationRoutes = require('../../../src/routes/notification.route');
      const express = require('express');
      const app = express();
      app.use('/api/notifications', notificationRoutes);
      const response = await request(app)
        .post('/api/notifications')
        .send({
          title: 'mock title',
          message: 'mock message',
          app: 'mock app id',
          template: 'mock template id',
        })
        .set('authorization', 'mock-access-token');
      expect(response.body).toEqual(mockResponse);
      expect(response.statusCode).toBe(200);
      done();
    });
    it('BAD REQUEST', async (done) => {
      const notificationRoutes = require('../../../src/routes/notification.route');
      const app = getApp('/api/notifications', notificationRoutes);
      const response = await request(app).post('/api/notifications');
      expect(response.statusCode).toBe(400);
      expect(response.body.details.headers.length).toBe(1);
      expect(response.body.details.headers[0].path[0]).toBe('authorization');
      done();
    });
    // NOT FOUND scenario already covered in earlier test case..
    it('INTERNAL SERVER ERROR', async (done) => {
      const controller = require('../../../src/controllers/notification.controller');
      const spy = jest
        .spyOn(controller, 'generateNotification')
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
      const notificationRoutes = require('../../../src/routes/notification.route');
      const express = require('express');
      const app = express();
      app.use((err, req, res, next) => res.status(err.status).json(err));
      app.use('/api/notifications', notificationRoutes);
      const response = await request(app)
        .post('/api/notifications')
        .set('authorization', 'mock-access-token');
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe(mockErrorMessage);
      spy.mockRestore();
      done();
    });
  });
});
