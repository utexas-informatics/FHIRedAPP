var logger = require('./logger');

const requiredEnv = [
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_NAME',
  'DB_PORT',
  'DB_SSL_URI',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_AUTH_USER',
  'SMTP_AUTH_PASS',
  'KEYCLOAK_URI',
  'CLIENT_SECRET',
  'CLIENT_NAME',
  'CLIENT_ID',
  'ROLE_NAME',
  'ROLE_ID',
  'PG_DB_USERNAME',
  'PG_DB_PASSWORD',
  'PG_DB_NAME',
  'PG_DB_HOST',
  'PG_DB_PORT',
  'REALM_ROLE_NAME',
  'REALM_NAME',
  'REALM_ROLE_ID',
  'STUDY_APP_CLIENT_ID',
  'STUDY_APP_CLIENT_SECRET',
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
