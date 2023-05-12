const access = require('../config/exchange-role.json');

module.exports = (resourceId, kc) =>
  kc.protect((token, request) => {
    request.decodeToken = token;
    if (
      token.content.azp === access.studyApp.exchangeClient &&
      token.hasRole(access.studyApp.originRole)
    ) {
      return access.studyApp.whitelistServices.includes(resourceId)
        ? token.hasRole(access.studyApp.exchangeRole)
        : false;
    }

    return true;
  });
