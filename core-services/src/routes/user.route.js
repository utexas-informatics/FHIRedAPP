var express = require('express');

var router = express.Router();
var userController = require('../controllers/user.controller');

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/logout', userController.logout);
router.post('/exchangeToken', userController.exchangeToken);
router.get('/getUserInfoByToken', userController.getUserInfoByToken);
router.post('/savePassword', userController.savePassword);
router.post('/refreshToken', userController.refreshToken);
router.post('/exchangeUser', userController.exchangeUser);

module.exports = router;
