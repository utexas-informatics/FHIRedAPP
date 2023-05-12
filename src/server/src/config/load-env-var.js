var logger = require('./logger');

const requiredEnv = [
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_NAME',
  'DB_PORT',
  'DB_SSL_URI',
  'SMTP_FROM',
  'KC_URL',
  'KC_SECRET',
  'FHIR_API_BASE_URL',
  'SMTP_REPLY_TO',
  'CORE_SERVICES_API_BASE_URL',
  'DB_CA_CRT',
  'DB_CLIENT_CRT',
  'DB_CLIENT_PEM',
];
const unsetEnv = requiredEnv.filter(
  (env) => !(typeof process.env[env] !== 'undefined')
);

if (unsetEnv.length > 0) {
  const errorString = `Required ENV variables are not set: [${unsetEnv.join(
    ', '
  )}]`;
  logger.info(errorString);
  process.exit(1);
}
logger.info(`ENV Variables are read and now initializing the db and app`);
