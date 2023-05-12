const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require('mongodb-memory-server');

var mongoServer = new MongoMemoryServer();
require('../src/config/environment');

// jest.setTimeout(2000);

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  const MONGO_URL = await mongoServer.getUri();
  const mongooseOpts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };
  await mongoose.connect(MONGO_URL, mongooseOpts);
  // eslint-disable-next-line global-require
  require('../src/models');
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  const { connections } = mongoose;
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  // close all connections
  for (const con of connections) {
    con.close();
  }
  await mongoose.disconnect();
  await mongoServer.stop();
};
