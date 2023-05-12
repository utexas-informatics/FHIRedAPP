var express = require('express');

var router = express.Router();
var appController = require('../controllers/app.controller');
var grantAccess = require('../authorization');
const kc = require('../config/keycloak-config.js').getKeycloak();

router.post(
  '/',
  kc.enforcer(['createApp']),
  grantAccess('createApp', kc),
  appController.createApp
);
router.get(
  '/',
  kc.enforcer(['getApps']),
  grantAccess('getApps', kc),
  appController.getApps
);
router.get(
  '/list',
  kc.enforcer(['appList']),
  grantAccess('appList', kc),
  appController.appList
);
router.get(
  '/:id',
  kc.enforcer(['getAppById']),
  grantAccess('getAppById', kc),
  appController.getAppById
);
router.put(
  '/:id',
  kc.enforcer(['updateApp']),
  grantAccess('updateApp', kc),
  appController.updateApp
);

router.get(
  'getAppRedirectionUrl/:id',
  kc.enforcer(['updateApp']),
  grantAccess('updateApp', kc),
  appController.getAppRedirectionUrl
);

module.exports = router;
