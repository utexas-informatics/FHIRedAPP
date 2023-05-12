var userService = require('../services/user.service');
var appService = require('../services/app.service');

var logger = require('../config/logger');
var errorResponse = require('../config/error-response');
var constants = require('../config/constants');
const { createAudit } = require('../services/audit.service');
const users = require('../models/user');

var getUserByEmailId = async function (req, res, next) {
  logger.info(
    `user : controller : getUserByEmailId : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.getUserByEmailId(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : getUserByEmailId : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getUserByEVC = async function (req, res, next) {
  logger.info(
    `user : controller : getUserByEVC : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.getUserByEVC(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : getUserByEVC : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getUserById = async function (req, res, next) {
  logger.info(
    `user : controller : getUserById : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.getUserById(req);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : getUserById : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};
var getAllUsers = async function (req, res, next) {
  logger.info(`user : controller : getAllUsers : received request`);
  try {
    var user = await userService.getAllUsers(req);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get Users';
    logger.error(`user : controller : getAllUsers : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var createUser = async function (req, res, next) {
  // logger.info(`user : controller : createUser : received request : id : ${req.params.id}`);
  try {
    var user = await userService.createUser(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : createUser : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var updateUser = async function (req, res, next) {
  logger.info(
    `user : controller : updateUser : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.updateUser(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : updateUser : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var acceptConsent = async function (req, res, next) {
  logger.info(
    `user : controller : acceptConsent : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.acceptConsent(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : acceptConsent : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var revokeConsent = async function (req, res, next) {
  logger.info(
    `user : controller : revokeConsent : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.revokeConsent(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : revokeConsent : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getAppsByUserId = async function (req, res, next) {
  logger.info(
    `user : controller : getAppsByUserId : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.getAppsByUserId(req);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : getAppsByUserId : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getNotificationsByUserId = async function (req, res, next) {
  logger.info(
    `user : controller : getNotificationsByUserId : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.getNotificationsByUserId(req);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : getNotificationsByUserId : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var markNotificationAsRead = async function (req, res, next) {
  logger.info(
    `user : controller : markNotificationAsRead : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.markNotificationAsRead(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to update Notification in User';
    logger.error(`user : controller : markNotificationAsRead : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var signup = async function (req, res, next) {
  logger.info(`user : controller : signup : received request`);
  try {
    const response = await userService.signup(req, res);
    const appResponse = await appService.getApps(req);

    let apps = [];
    for (let i = 0; i < appResponse.length; i++) {
      let obj = {
        isActive: false,
        app: appResponse[i].id,
        isFirstNotify: false,
        consentedMedicalRecords: appResponse[i].medicalRecords,
      };
      apps.push(obj);
    }

    if (response && response.email && appResponse && apps.length > 0) {
      req.body = {
        keycloakId: response.id,
        email: response.email,
        status: 'PendingApproval',
        apps,
      };
      var user = await userService.createUser(req, res);
      createAudit({
        system: 'LEAP',
        action: 'SetSignupPassword',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'patientEmail', value: response.email },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'user',
        documentId: user._id,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });
      res.json(user);
    }
  } catch (e) {
    var error = 'Failed to signup user';
    logger.error(`user : controller : login : Error : ${e}`);
    if (e.message.includes(409)) {
      error = 'User exists with same username';
      next(errorResponse.build(constants.error.conflict, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var login = async function (req, res, next) {
  try {
    const response = await userService.login(req, res);
    // audit the action
    const dToken = Buffer.from(
      req.headers.authorization.split('basic ')[1],
      'base64'
    ).toString('binary');
    const email = dToken.substring(0, dToken.indexOf(':'));
    const user = await users
      .findOne({ email: email, isDeleted: false })
      .populate('apps.app')
      .populate('role', 'role');
    if (user) {
      createAudit({
        system: 'LEAP',
        action:
          user.role._id == '60653ffa4206150ec061d0cb'
            ? 'RecruiterLoginSucceeded'
            : 'PatientLoginSucceeded',
        actionData: [
          {
            name: 'session_state',
            value: req.headers['session_state']
              ? req.headers['session_state']
              : '',
          },
          { name: 'email', value: email },
          { name: 'timestamp', value: new Date() },
        ],
        platform: req.headers['platform'], // TBD - need to get this info from req
        source: req.headers['source'], // TBD - need to get this info from req
        entity: 'user',
        documentId: user._id,
        change: [],
        createdBy: res.locals.userId || res.locals.adminId,
      });
    }

    res.cookie('auth_token', response, {
      maxAge: 900000,
      domain: process.env.DOMAIN,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    res.json(response);
  } catch (e) {
    var error = 'Failed to login user';
    logger.error(`user : controller : login : Error : ${e}`);
    if (e.message.includes(401)) {
      // audit the action
      const dToken = Buffer.from(
        req.headers.authorization.split('basic ')[1],
        'base64'
      ).toString('binary');
      const email = dToken.substring(0, dToken.indexOf(':'));
      const user = await users
        .findOne({ email, isDeleted: false })
        .populate('apps.app')
        .populate('role', 'role');
      if (user) {
        createAudit({
          system: 'LEAP',
          action: 'LoginFailed',
          actionData: [
            {
              name: 'session_state',
              value: req.headers['session_state']
                ? req.headers['session_state']
                : '',
            },
            { name: 'email', value: email },
            { name: 'timestamp', value: new Date() },
          ],
          platform: req.headers['platform'], // TBD - need to get this info from req
          source: req.headers['source'], // TBD - need to get this info from req
          entity: 'user',
          documentId: user._id,
          change: [],
          createdBy: res.locals.userId || res.locals.adminId,
        });
      }
      e.message = 'Invalid Username or Password';
      next(errorResponse.build(constants.error.unauthorized, error, e.message));
    } else {
      next(
        errorResponse.build(
          constants.error.internalServerError,
          error,
          e.message
        )
      );
    }
  }
};

var verifyUser = async function (req, res, next) {
  logger.info(
    `user : controller : verifyUser : received request : id : ${req.body.emailId}`
  );
  createAudit({
    system: 'LEAP',
    action: 'VerifySignUpMail',
    actionData: [
      {
        name: 'session_state',
        value: req.headers['session_state'] ? req.headers['session_state'] : '',
      },
      { name: 'patientEmail', value: req.body.emailId },
      { name: 'timestamp', value: new Date() },
    ],
    platform: req.headers['platform'],
    source: req.headers['source'],
    entity: 'user',
    documentId: res.locals.adminId || res.locals.userId,
    change: [],
    createdBy: res.locals.adminId || res.locals.userId,
  });
  try {
    var user = await userService.getUserByEmailId(req, res, req.body.emailId);
    if (user != null && user.email == req.body.emailId) {
      res.json({ status: user.status, userExists: true });
    }
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : verifyUser : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var logout = async function (req, res, next) {
  logger.info(`user : controller : logout : received request `);
  try {
    var user = await userService.logout(req, res);
    res.json({ status: 'logged out successfully' });
  } catch (e) {
    var error = 'Failed to log out';
    logger.error(`user : controller : logout : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};
var forgotPassword = async function (req, res, next) {
  logger.info(
    `user : controller : forgotPassword : received request : id : ${req.params.id}`
  );
  try {
    var user = await userService.forgotPassword(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get User';
    logger.error(`user : controller : forgotPassword : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var setNewPassword = async function (req, res, next) {
  logger.info(`user : controller : setNewPassword : received request`);
  if (
    req.headers.authorization &&
    req.headers.authorization.includes('basic ') &&
    req.headers.authorization.split('basic ')[1]
  ) {
    const dToken = Buffer.from(
      req.headers.authorization.split('basic ')[1],
      'base64'
    ).toString('binary');
    var patientEmail = dToken.substring(0, dToken.indexOf(':'));
  }
  try {
    const response = await userService.setNewPassword(req, res);
    createAudit({
      system: 'LEAP',
      action: 'PasswordChangeSucceeded',
      actionData: [
        {
          name: 'session_state',
          value: req.headers['session_state']
            ? req.headers['session_state']
            : '',
        },
        { name: 'patientEmail', value: patientEmail },
        { name: 'timestamp', value: new Date() },
      ],
      platform: req.headers['platform'], // TBD - need to get this info from req
      source: req.headers['source'], // TBD - need to get this info from req
      entity: 'user',
      documentId: res.locals.userId || res.locals.adminId,
      change: [],
      createdBy: res.locals.userId || res.locals.adminId,
    });
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (e) {
    createAudit({
      system: 'LEAP',
      action: 'PasswordChangeFailed',
      actionData: [
        {
          name: 'session_state',
          value: req.headers['session_state']
            ? req.headers['session_state']
            : '',
        },
        { name: 'patientEmail', value: patientEmail },
        { name: 'timestamp', value: new Date() },
      ],
      platform: req.headers['platform'], // TBD - need to get this info from req
      source: req.headers['source'], // TBD - need to get this info from req
      entity: 'user',
      documentId: res.locals.userId || res.locals.adminId,
      change: [],
      createdBy: res.locals.userId || res.locals.adminId,
    });
    var error = 'Failed to setNewPassword user';
    logger.error(`user : controller : setNewPassword : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getBiometricAccessToken = async function (req, res, next) {
  logger.info(`user : controller : getBiometricAccessToken : received request`);
  try {
    var user = await userService.getBiometricAccessToken(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get access token';
    logger.error(`user : controller : getBiometricAccessToken : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var magicLink = async function (req, res, next) {
  logger.info(`user : controller : magicLink : received request`);
  try {
    var user = await userService.magicLink(req, res);
    res.json(user);
  } catch (e) {
    var error = 'Failed to get access token';
    logger.error(`user : controller : magicLink : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, "If this email address is already registered with us, you should receive a one time login link shortly.")
    );
  }
};
var getTokenByHashkey = async function (req, res, next) {
  logger.info(`user : controller : getTokenByHashkey : received request`);
  try {
    var token = await userService.getTokenByHashkey(req, res);
    res.json(token);
  } catch (e) {
    var error = 'Failed to authenticate';
    logger.error(`user : controller : getTokenByHashkey : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var getCrosswalkID = async function (req, res, next) {
  logger.info(`user : controller : getCrosswalkID : received request`);
  try {
    var patient = await userService.getCrosswalkID(req, res);
    if (patient != null && patient.source_patient_id != null) {
      var patientDetailsFromFhir = await userService.getPatientIDFromFhir(
        patient.source_patient_id
      );
      if (patientDetailsFromFhir.total > 0) {
        const user = await userService.updateFhiredPatientID(
          req,
          patientDetailsFromFhir.entry[0].resource.id
        );
        res.json(user);
      } else {
        next(
          errorResponse.build(
            constants.error.notFound,
            'Patient Not found in Fhir Envirnment',
            'Patient Not found in Fhir Envirnment'
          )
        );
      }
    } else {
      next(
        errorResponse.build(
          constants.error.notFound,
          'Patient Not found datavent table',
          'Patient Not found datavent table'
        )
      );
    }
  } catch (e) {
    var error = 'Failed to get access token';
    logger.error(`user : controller : getCrosswalkID : Error : ${e}`);
    next(
      errorResponse.build(constants.error.internalServerError, error, e.message)
    );
  }
};

var datavantMatchStatus = async function (req, res) {
  logger.info(`user : controller : datavantMatchStatus : received request`);
  try {
    var user = await userService.datavantMatchStatus(req, res);
    // NOTE : We dont need response because it is cron job
    // res.json(user);
  } catch (e) {
    var error = 'Failed to get match status';
    logger.error(`user : controller : datavantMatchStatus : Error : ${e}`);
  }
};

var reminderNotification = async function (req, res) {
  logger.info(`user : controller : reminderNotification : received request`);
  try {
    var user = await userService.reminderNotification(req, res);
    // NOTE : We dont need response because it is cron job
    // res.json(user);
  } catch (e) {
    var error = 'Failed to send thirdParty app reminder notification';
    logger.error(`user : controller : reminderNotification : Error : ${e}`);
  }
};

var reminderDemographic = async function (req, res) {
  logger.info(`user : controller : reminderDemographic : received request`);
  try {
    var user = await userService.reminderDemographic(req, res);
    // NOTE : We dont need response because it is cron job
    // res.json(user);
  } catch (e) {
    var error = 'Failed to send demographic reminder notification';
    logger.error(`user : controller : reminderDemographic : Error : ${e}`);
  }
};
var reminderLogin = async function (req, res) {
  logger.info(`user : controller : reminderLogin : received request`);
  try {
    var user = await userService.reminderLogin(req, res);
    // NOTE : We dont need response because it is cron job
    // res.json(user);
  } catch (e) {
    var error = 'Failed to send login activated reminder notification';
    logger.error(`user : controller : reminderLogin : Error : ${e}`);
  }
};

var userSurvey = async function (req, res) {
  logger.info(`user : controller : userSurvey : received request`);
  try {
    var user = await userService.userSurvey(req, res);
    // NOTE : We dont need response because it is cron job
    res.json(user);
  } catch (e) {
    var error = 'Failed to get match status';
    logger.error(`user : controller : userSurvey : Error : ${e}`);
  }
};
var newMedicalRecordNotify = async function (req, res) {
  logger.info(`user : controller : newMedicalRecordNotify : received request`);
  try {
    var user = await userService.newMedicalRecordNotify(req, res);
    // NOTE : We dont need response because it is cron job
    // res.json(user);
  } catch (e) {
    var error = 'Failed to send new medical reminder notification';
    logger.error(`user : controller : newMedicalRecordNotify : Error : ${e}`);
  }
};
module.exports.getUserById = getUserById;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.acceptConsent = acceptConsent;
module.exports.revokeConsent = revokeConsent;
module.exports.getAppsByUserId = getAppsByUserId;
module.exports.getNotificationsByUserId = getNotificationsByUserId;
module.exports.markNotificationAsRead = markNotificationAsRead;
module.exports.getUserByEmailId = getUserByEmailId;
module.exports.getUserByEVC = getUserByEVC;
module.exports.login = login;
module.exports.signup = signup;
module.exports.verifyUser = verifyUser;
module.exports.logout = logout;
module.exports.forgotPassword = forgotPassword;
module.exports.setNewPassword = setNewPassword;
module.exports.getBiometricAccessToken = getBiometricAccessToken;
module.exports.magicLink = magicLink;
module.exports.getTokenByHashkey = getTokenByHashkey;
module.exports.getCrosswalkID = getCrosswalkID;
module.exports.datavantMatchStatus = datavantMatchStatus;
module.exports.getAllUsers = getAllUsers;
module.exports.reminderNotification = reminderNotification;
module.exports.reminderDemographic = reminderDemographic;
module.exports.reminderLogin = reminderLogin;
module.exports.userSurvey = userSurvey;
module.exports.newMedicalRecordNotify = newMedicalRecordNotify;
