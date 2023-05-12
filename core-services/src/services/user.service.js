var logger = require('../config/logger');
var fetch = require('../config/fetch-wrapper');
var kc = require('../config/keycloak_env');

var login = async function (req) {
  logger.info(`user : service : login : received request`);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('basic ') &&
      req.headers.authorization.split('basic ')[1]
    ) {
      const [username, password] = kc
        .decrypt(req.headers.authorization.split('basic ')[1])
        .split(':');

      const payload = {
        username,
        password,
        client_id: process.env.CLIENT_NAME,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'password',
        scope: 'openid',
      };
      const response = await fetch.postEncode(
        `${process.env.KEYCLOAK_URI}/${kc.admin_uri}`,
        payload
      );
      return response;
    }
    logger.error(`user : service : Authorization token not found`);
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : login : Error : ${e}`);
    throw e;
  }
};

var getUserInfoByToken = async function (req) {
  logger.info(`user : service : getUserInfoByToken : received request`);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('bearer ')
    ) {
      const response = await fetch.get(
        `${process.env.KEYCLOAK_URI}/${kc.token_uri}`,
        { Authorization: req.headers.authorization }
      );
      return response;
    }
    logger.error(
      `user : service : getUserInfoByToken : Authorization token not found`
    );
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : getUserInfoByToken : Error : ${e}`);
    throw e;
  }
};

async function getAdminToken() {
  try {
    const payload = {
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_NAME,
      client_secret: process.env.CLIENT_SECRET,
    };
    const response = await fetch.postEncode(
      `${process.env.KEYCLOAK_URI}/${kc.admin_uri}`,
      payload
    );
    if (response.access_token) {
      return response;
    }
    logger.error(`user : service : Unable to get access token`);
    throw new Error(response);
  } catch (e) {
    logger.error(`user : service : getAdminToken : Error : ${e}`);
    throw e;
  }
}

async function createUser(email, token) {
  try {
    const payload = {
      username: email,
      enabled: true,
      emailVerified: true,
      email,
    };
    const response = await fetch.post(
      `${process.env.KEYCLOAK_URI}/${kc.user_uri}`,
      payload,
      { Authorization: `bearer ${token}` }
    );
    if (response) {
      return response;
    }
    logger.error(`user : service : Unable to create user`);
    throw new Error(response);
  } catch (e) {
    logger.error(`user : service : createUser : Error : ${e}`);
    throw e;
  }
}

async function setPassword(password, id, token) {
  try {
    const payload = {
      type: 'password',
      value: password,
      temporary: false,
    };

    const response = await fetch.put(
      `${process.env.KEYCLOAK_URI}/${kc.user_uri}/${id}/reset-password`,
      payload,
      { Authorization: `bearer ${token}` }
    );
    if (response) {
      return response;
    }
    logger.error(`user : service : Unable to set password`);
    throw new Error(response);
  } catch (e) {
    logger.error(`user : service : setPassword : Error : ${e}`);
    throw e;
  }
}

async function getUserInfo(email, token) {
  try {
    const uri = `${process.env.KEYCLOAK_URI}/${kc.user_uri}?email=${email}`;
    const response = await fetch.get(uri, {
      Authorization: `bearer ${token}`,
    });
    if (response && response.length) {
      return response[0];
    }
    logger.error(`user : service : Unable to get userInfo`);
    throw new Error(response);
  } catch (e) {
    logger.error(`user : service : getUserInfo : Error : ${e}`);
    throw e;
  }
}

async function updateRole(userId, token) {
  try {
    const payload = [
      {
        clientRole: false,
        composite: true,
        containerId: process.env.REALM_NAME,
        id: process.env.REALM_ROLE_ID,
        name: process.env.REALM_ROLE_NAME,
      },
    ];

    const response = await fetch.post(
      `${process.env.KEYCLOAK_URI}/${kc.user_uri}/${userId}/role-mappings/realm`,
      payload,
      { Authorization: `bearer ${token}` }
    );
    if (response) {
      return response;
    }
    logger.error(`user : service : Unable to update Role`);
    throw new Error(response);
  } catch (e) {
    logger.error(`user : service : updateRole : Error : ${e}`);
    throw e;
  }
}

var signup = async function (req) {
  logger.info(`user : service : signup : received request`);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('basic ') &&
      req.headers.authorization.split('basic ')[1]
    ) {
      const [email, password] = kc
        .decrypt(req.headers.authorization.split('basic ')[1])
        .split(':');

      const adminToken = await getAdminToken();
      await createUser(email, adminToken.access_token);
      const usersInfo = await getUserInfo(email, adminToken.access_token);
      await setPassword(password, usersInfo.id, adminToken.access_token);
      await updateRole(usersInfo.id, adminToken.access_token);
      return usersInfo;
    }
    logger.error(`user : service : Authorization token not found`);
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : signup : Error : ${e}`);
    throw e;
  }
};

var savePassword = async function (req) {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('basic ') &&
      req.headers.authorization.split('basic ')[1]
    ) {
      const [username, password] = kc
        .decrypt(req.headers.authorization.split('basic ')[1])
        .split(':');
      const adminToken = await getAdminToken();
      const usersInfo = await getUserInfo(username, adminToken.access_token);
      await setPassword(password, usersInfo.id, adminToken.access_token);
      return usersInfo;
    }
    logger.error(
      `user : service : savePassword : Authorization token not found`
    );
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : savePassword : Error : ${e}`);
    throw e;
  }
};

var logout = async function (req) {
  logger.info(`user : service : logout : received request`);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('bearer ')
    ) {
      const payload = {
        client_id: process.env.CLIENT_NAME,
        client_secret: process.env.CLIENT_SECRET,
      };
      const adminToken = await getAdminToken();
      await fetch.post(
        `${process.env.KEYCLOAK_URI}/${kc.user_uri}/${req.body.id}/logout`,
        payload,
        { Authorization: `bearer ${adminToken.access_token}` }
      );
      return true;
    }
    logger.error(`user : service : logout : Authorization token not found`);
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : logout : Error : ${e}`);
    throw e;
  }
};

var refreshToken = async function (req) {
  logger.info(`user : service : refreshToken : received request`);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('bearer ') &&
      req.headers.authorization.split('bearer ')[1]
    ) {
      if(req.body.authType && req.body.authType == 'magicLink' )
      {
        const payload = {
          client_id: process.env.REALM_CLIENT_ID ,
          client_secret: process.env.REALM_CLIENT_SECRET,
          grant_type: 'refresh_token',
          scope: 'openid',
          refresh_token: req.headers.authorization.split('bearer ')[1],
        };
        const adminToken = await fetch.postEncode(
          `${process.env.KEYCLOAK_URI}/${kc.admin_uri}`,
          payload
        );

        if (adminToken.access_token) {
          const userInfo = await exchangeUserToken(
            adminToken.access_token,
            req.body.email
          );
          return { ...adminToken, access_token: userInfo.access_token };
        }
        logger.error(`user : service : admin token not found`);
        throw new Error('admin token not found');
       
      }else{
      const payload = {
        client_id: process.env.CLIENT_NAME,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'refresh_token',
        scope: 'openid',
        refresh_token: req.headers.authorization.split('bearer ')[1],
      };
      const response = await fetch.postEncode(
        `${process.env.KEYCLOAK_URI}/${kc.admin_uri}`,
        payload
      );
      return response;
      }
    }
    logger.error(`user : service : Authorization token not found`);
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : refreshToken : Error : ${e}`);
    throw e;
  }
};

var loginAdmin = async function () {
  logger.info(`user : service : loginAdmin : received request`);
  try {
    const payload = {
      client_id: process.env.REALM_CLIENT_ID,
      grant_type: 'password',
      client_secret: process.env.REALM_CLIENT_SECRET,
      scope: 'openid',
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_SECRET,
    };
    const response = await fetch.postEncode(
      `${process.env.KEYCLOAK_URI}/${kc.admin_uri}`,
      payload
    );
    return response;
  } catch (e) {
    logger.error(`user : service : loginAdmin : Error : ${e}`);
    throw e;
  }
};

var exchangeUserToken = async function (token, email) {
  logger.info(`user : service : exchangeUserToken : received request`);
  try {
    const payload = {
      client_id: process.env.CLIENT_NAME,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      audience: process.env.CLIENT_NAME,
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token: token,
      requested_subject: email,
    };
    const response = await fetch.postEncode(
      `${process.env.KEYCLOAK_URI}/${kc.admin_uri}`,
      payload
    );
    return response;
  } catch (e) {
    logger.error(`user : service : exchangeUserToken : Error : ${e}`);
    throw e;
  }
};

var exchangeUser = async function (req) {
  logger.info(`user : service : exchangeUser : received request`);
  try {
    if (req.body.email) {
      // return await loginAdmin();
      const adminToken = await loginAdmin();
      if (adminToken.access_token) {
        const userInfo = await exchangeUserToken(
          adminToken.access_token,
          req.body.email
        );
        return { ...adminToken, access_token: userInfo.access_token };
      }
      logger.error(`user : service : admin token not found`);
      throw new Error('admin token not found');
    }
    logger.error(`user : service : Authorization token not found`);
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : exchangeUser : Error : ${e}`);
    throw e;
  }
};

var exchangeToken = async function (req) {
  logger.info(`user : service : exchangeToken : received request`);
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.includes('bearer ') &&
      req.headers.authorization.split('bearer ')[1]
    ) {
      let token = req.headers.authorization.split('bearer ')[1];
      if (req.headers['token-type'] === 'refreshToken') {
        const res = await refreshToken(req);
        token = res.access_token;
      }
      if (req.headers['token-type'] === 'magicLinkToken') {
        const res = await exchangeUser(req);
        token = res.access_token;
      }
      const payload = {
        client_id: process.env.STUDY_APP_CLIENT_ID,
        client_secret: process.env.STUDY_APP_CLIENT_SECRET,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        audience: process.env.STUDY_APP_CLIENT_ID,
        requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        subject_token: token,
      };
      const response = await fetch.postEncode(
        `${process.env.KEYCLOAK_URI}/${kc.admin_uri}`,
        payload
      );
      return response;
    }
    logger.error(`user : service : Authorization token not found`);
    throw new Error('Authorization token not found');
  } catch (e) {
    logger.error(`user : service : exchangeToken : Error : ${e}`);
    throw e;
  }
};

module.exports.login = login;
module.exports.savePassword = savePassword;
module.exports.signup = signup;
module.exports.getUserInfoByToken = getUserInfoByToken;
module.exports.logout = logout;
module.exports.exchangeToken = exchangeToken;
module.exports.refreshToken = refreshToken;
module.exports.exchangeUser = exchangeUser;
