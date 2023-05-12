var router = require('express').Router();

var errorResponse = require('../config/error-response');
var constants = require('../config/constants');
var logger = require('../config/logger');
var users = require('../models/user');
var roles = require('../models/role');
const { route } = require('./medical-record-type.route');

// TBD - middleware to parse and process routes under '/api/*' for common validations, auth etc..
router.use((req, res, next) => {
  // TBD - verify token with IDP here..
  logger.info(`api router : middleware : path : ${req.path}`);
  // get admin name to be used through out the session
  // res.locals.adminName = 'Admin User';
  // res.locals.adminId = '5ff40c7e153fc3d42838f9cb';
  roles.findOne({ role: 'Admin' }, (er, role) => {
    if (role) {
      users.findOne({ role: role._id }, (err, adminUser) => {
        if (adminUser) {
          res.locals.adminId = adminUser._id;
          next();
          // res.locals.adminName = `${adminUser.firstName} ${adminUser.lastName}`;
        } else {
          // TBD - throw error if admin user not found and use fallback admin name in the mean while
          const message = `admin user not found`;
          logger.error(
            `api router : middleware : error : ${err} : message : ${message}`
          );
          next(
            errorResponse.build(
              constants.error.internalServerError,
              err,
              message
            )
          );
        }
      });
    } else {
      // TBD - throw error if admin user not found and use fallback admin name in the mean while
      /* const message = `admin role not found`;
    logger.error(
      `api router : middleware : error : ${message} : message : ${message}`
    );
    next(
      errorResponse.build(constants.error.internalServerError, message, message)
    ); */
    }
  });
  // get user info from 'Authorization' header and make it available throughout the session
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('bearer ') &&
    req.headers['userid']
  ) {
    users.findById(req.headers['userid'], (err, user) => {
      if (user) {
        res.locals.userId = user._id;
        // res.locals.user = user.toJSON();
        // const firstName =
        //   !user.firstName && req.body.firstName
        //     ? req.body.firstName
        //     : user.firstName;
        // const lastName =
        //   !user.lastName && req.body.lastName
        //     ? req.body.lastName
        //     : user.lastName;
        // res.locals.userName = `${firstName} ${lastName}`;
      } else {
        const message = `user not found for ${req.headers.authorization}`;
        logger.error(
          `api router : middleware : error : ${err} : message : ${message}`
        );
        next(errorResponse.build(constants.error.badRequest, err, message));
      }
    });
  } else {
    // TODO : this is temp for api call which doesn't have auth headers.
    if (req.body && req.body.userId) {
      //&& req.body.userName) {
      res.locals.userId = req.body.userId;
      // res.locals.userName = req.body.userName;
    }
  }
});

router.use('/metadata', require('./metadata.route'));
router.use('/apps', require('./app.route'));
router.use('/notifications', require('./notification.route'));
router.use('/users', require('./user.route'));
router.use('/messages', require('./message.route'));
router.use('/inviteCodes', require('./invite-code.route'));
router.use(
  '/emailVerificationCodes',
  require('./email-verification-code.route')
);
router.use('/appSettings', require('./app-setting.route'));
router.use('/medicalRecordTypes', require('./medical-record-type.route'));
router.use('/clinicalData', require('./fhir.route'));
router.use('/audit', require('./audit.route'));

module.exports = router;
