var express = require('express');

var router = express.Router();
var appSettingController = require('../controllers/app-setting.controller');

router.post('/', appSettingController.createAppSetting);
router.get('/', appSettingController.getAppSetting);
router.get('/:id', appSettingController.getAppSettingById);
router.put('/:id', appSettingController.updateAppSetting);
router.delete('/:id', appSettingController.deleteAppSetting);

module.exports = router;
