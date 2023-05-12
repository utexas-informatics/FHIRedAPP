/* eslint-disable consistent-return */
const fetch = require('node-fetch');
var logger = require('./logger');

const defaultOptions = { 'Content-Type': 'application/json' };

const fetchWrapper = {
  get: async (url, options = {}) => {
    try {
      logger.info(`config : fetchWrapper : get : received request`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...defaultOptions,
          ...options,
        },
      });
      if (response && response.ok) {
        // if HTTP-status is 200-299
        return await response.json();
      }
      throw new Error(`HTTP-Error: ${response.status}`);
    } catch (e) {
      logger.error(`config : fetchWrapper : get : Error : ${e}`);
      // throw e;
    }
  },
  post: async (url, body, options = {}) => {
    try {
      logger.info(`config : fetchWrapper : post : received request`);
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          ...defaultOptions,
          ...options,
        },
      }).catch((err) => {
        logger.error(`config : fetchWrapper : post : fetch : Error : ${err}`);
        // throw err;
      });
      if (response && response.ok) {
        // if HTTP-status is 200-299
        return await response.json();
      }
      throw new Error(
        `HTTP-Error: ${
          response
            ? response.status
            : 'Something went wrong while communicating with micro service'
        }`
      );
    } catch (e) {
      logger.error(`config : fetchWrapper : post : Error : ${e}`);
      throw e;
    }
  },
  put: async (url, body, options = {}) => {
    try {
      logger.info(`config : fetchWrapper : put : received request`);
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          ...defaultOptions,
          ...options,
        },
      });
      if (response && response.ok) {
        // if HTTP-status is 200-299
        return await response.json();
      }
      throw new Error(`HTTP-Error: ${response.status}`);
    } catch (e) {
      logger.error(`config : fetchWrapper : put : Error : ${e}`);
      // throw e;
    }
  },
};

module.exports = fetchWrapper;
