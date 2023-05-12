var router = require('express').Router();
var logger = require('../config/logger');

// middleware to parse and process routes under '/api/*' for common validations, auth etc..
router.use((req, res, next) => {
  logger.info(`api router : middleware : path : ${req.path}`);
  // TBD - auth check
  next();
});

router.use('/audits', require('./audit.route'));
router.use('/users', require('./user.route'));
router.use('/email', require('./email.route'));
router.use('/patient', require('./patient.route'));

module.exports = router;
