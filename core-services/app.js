var express = require('express');
var mongoose = require('mongoose');
var compression = require('compression');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var swaggerUi = require('swagger-ui-express');
const { ValidationError } = require('express-validation');
var serveStatic = require('serve-static');
var path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const https = require('https');

var logger = require('./src/config/logger');
var routes = require('./src/routes');
var errorResponse = require('./src/config/error-response');
var constants = require('./src/config/constants');
require('./src/config/environment');
require('./src/config/load-env-var');
var dbConfig = require('./src/config/db-connect');
var swaggerDoc = require('./src/resources/swagger/swagger.json');
const { sequelize } = require('./src/config/sequelise');

var app = express();

app.use(compression());
app.use(cors());

app.use(
  morgan('tiny', {
    stream: logger.stream,
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(serveStatic(path.join(__dirname, 'public', 'assets')));
app.use('/api', routes);

if (process.env.NODE_ENV !== 'production') {
  // sample route
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DMS support services.' });
  });
  app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

app.get('/healthcheck', (req, res) => {
  res.json({ message: 'Welcome to DMS support services.' });
});


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(errorResponse.build(constants.error.notFound, 'Invalid URL'));
});

// error handler
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res
      .status(err.statusCode)
      .json(errorResponse.build(constants.error.badRequest, err, err.message));
  }
  return res
    .status(err.status || constants.error.internalServerError.status)
    .json(err);
});

const getCA = new Promise((resolve) => {
  https.get(dbConfig.dbCA, (res) => {
    res.pipe(fs.createWriteStream('ca.crt'));
    resolve();
  });
});
const getClientCrt = new Promise((resolve) => {
  https.get(dbConfig.dbClientCRT, (res) => {
    res.pipe(fs.createWriteStream('client.crt'));
    resolve();
  });
});

const getClientPem = new Promise((resolve) => {
  https.get(dbConfig.dbClientPEM, (res) => {
    res.pipe(fs.createWriteStream('client.pem'));
    resolve();
  });
});

async function getkeys() {
  try {
    await Promise.all([getCA, getClientCrt, getClientPem]);
  } catch (error) {
    console.log('*************', error);
  }
}

async function dbConnect() {
  try {
    if (
      !fs.existsSync('ca.crt') ||
      !fs.existsSync('client.crt') ||
      !fs.existsSync('client.pem')
    ) {
      await getkeys();
      console.log('===================');
      console.log('Download keys for your project & Restart server Again');
      console.log('===================');
      process.exit();
    }
    const dbConnectionUrl = `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?ssl=true&authSource=admin`;

    var mongoUri = dbConnectionUrl,
      mongoOpt = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        sslValidate: false,
        server: {
          sslCa: fs.readFileSync('ca.crt'),
          sslCert: fs.readFileSync('client.crt'),
          sslKey: fs.readFileSync('client.pem'),
        },
      };

    mongoose.connect(mongoUri, mongoOpt);
    mongoose.connection.once('open', () => {
      console.info('mongo DB SSL connection established successfully');
      mongoose.set('useUnifiedTopology', true);
      // eslint-disable-next-line global-require
      require('./src/models');
    });
  } catch (error) {
    console.log('dbconnect error', error);
  }
}

dbConnect();

  const testICCDBConnection = async()=>{
    try {
     
      await sequelize.authenticate();
      console.log('Connection has been established to ICC DB successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }


  testICCDBConnection();
    

module.exports = app;
