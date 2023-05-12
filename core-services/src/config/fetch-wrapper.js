const fetch = require('node-fetch');
var logger = require('./logger');

const defaultOptions = {
  'Content-Type': 'application/json',
};

const urlencodedOptions = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

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

      if (response.ok) {
        // if HTTP-status is 200-299
        return await response.json();
      }
      throw new Error(`HTTP-Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      logger.error(`config : fetchWrapper : get : Error : ${e}`);
      throw e;
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
      });
      if (response.status === 201 || response.status === 204) {
        return {};
      }
      if (response.ok) {
        // if HTTP-status is 200-299
        return await response.json();
      }
      throw new Error(`HTTP-Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      logger.error(`config : fetchWrapper : post : Error : ${e}`);
      throw e;
    }
  },
  postEncode: async (url, body, options = {}) => {
    try {
      logger.info(`config : fetchWrapper : postEncode : received request`);
      const response = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams(body),
        headers: {
          ...urlencodedOptions,
          ...options,
        },
      });
      if (response.status === 201 || response.status === 204) {
        return {};
      }
      if (response.ok) {
        // if HTTP-status is 200-299
        return await response.json();
      }
      throw new Error(`HTTP-Error: ${response.status} ${response.statusText}`);
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
      if (response.status === 201 || response.status === 204) {
        return {};
      }
      if (response.ok) {
        // if HTTP-status is 200-299
        return await response.json();
      }
      throw new Error(`HTTP-Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      logger.error(`config : fetchWrapper : put : Error : ${e}`);
      throw e;
    }
  },
};

module.exports = fetchWrapper;
