var dotenv = require('dotenv');
var constants = require('./constants');
var logger = require('./logger');

var defaultEnvironment = 'development';
const NODE_ENV = process.env.NODE_ENV || defaultEnvironment;
var environment = NODE_ENV.toLowerCase();
if (constants.environments.indexOf(environment) === -1) {
  logger.warn(
    `'NODE_ENV' value is not compatible, using default environment '${defaultEnvironment}'`
  );
  environment = defaultEnvironment;
} else {
  logger.info(`Using environment '${environment}'`);
}
dotenv.config({ path: `.env.${environment}` });
