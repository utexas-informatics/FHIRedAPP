var session = require('express-session');
var Keycloak = require('keycloak-connect');

var _keycloak;
var keycloakConfig = {
  realm: 'LEAP',
  'auth-server-url': process.env.KC_URL,
  'ssl-required': 'external',
  resource: 'fhiredapp',
  'verify-token-audience': true,
  credentials: {
    secret: process.env.KC_SECRET,
  },
  'use-resource-role-mappings': true,
  'confidential-port': 0,
  'policy-enforcer': {},
};

function initKeycloak(memoryStore) {
  if (_keycloak) {
    console.warn('Trying to init Keycloak again!');
    return _keycloak;
  }
  console.log('Initializing Keycloak...');
  _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
  return _keycloak;
}

function getKeycloak() {
  if (!_keycloak) {
    console.error(
      'Keycloak has not been initialized. Please called init first.'
    );
  }
  return _keycloak;
}

module.exports = {
  initKeycloak,
  getKeycloak,
};
