const { createLogger, format, transports } = require('winston');

const today = new Date().toLocaleDateString();
const filename = today.replaceAll('/', '')

const logger = createLogger({
  level: 'info',
  exitOnError: false,
  format: format.json(),
  transports: [
    new transports.File({filename: `../../logs/${filename}.log`}),
  ],
});

module.exports = logger;