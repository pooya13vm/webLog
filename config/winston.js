const winston = require("winston");
const appRoot = require("app-root-path");

const option = {
  file: {
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    format: winston.format.json(),
    maxsize: 5000000,
    maxFile: 5,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  },
};

const logger = new winston.createLogger({
  transports: [
    new winston.transports.File(option.file),
    new winston.transports.Console(option.console),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function (message) {
    logger.info(message);
  },
};

module.exports = logger;
