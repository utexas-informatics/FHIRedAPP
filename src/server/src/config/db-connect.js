module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  sslUrl: process.env.DB_SSL_URI,
  dbCA: process.env.DB_CA_CRT,
  dbClientCRT: process.env.DB_CLIENT_CRT,
  dbClientPEM: process.env.DB_CLIENT_PEM,
};
