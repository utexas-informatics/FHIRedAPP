module.exports = {
  admin_uri: `realms/LEAP/protocol/openid-connect/token`,
  user_uri: `admin/realms/LEAP/users`,
  token_uri: `realms/LEAP/protocol/openid-connect/userinfo`,
  logout_uri: `realms/LEAP/protocol/openid-connect/logout`,
  decrypt: (token) => Buffer.from(token, 'base64').toString('binary'),
};
