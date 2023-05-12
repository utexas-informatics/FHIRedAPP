var winston = require('winston');

var { format } = winston;

var options = {
  file: {
    level: 'info',
    filename: `logs/dms-support-services.log`,
    handleExceptions: true,
    maxsize: 31457280,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    colorize: true,
  },
};

var logger = new winston.createLogger({
  format: format.combine(
    format.label({
      label: 'DmsSupportServices',
    }),
    format.timestamp(),
    format.json()
  ),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

logger.stream = {
  write(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;
