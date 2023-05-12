const fs = require('fs');
require('./environment');

const rdsCa = fs.readFileSync(`${__dirname}/../../rds-ca-2019-root.pem`);

var Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.PG_DB_NAME,
  process.env.PG_DB_USERNAME,
  process.env.PG_DB_PASSWORD,
  {
    host: process.env.PG_DB_HOST,

    dialect: 'postgres',

    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,

        ca: [rdsCa],
      },
    },
  }
);

module.exports = {
  sequelize,
};
