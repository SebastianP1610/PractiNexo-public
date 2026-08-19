const pino = require('pino');

const isProd = process.env.NODE_ENV === 'production';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
});

const logger = {
  info(msg) {
    pinoLogger.info(msg);
  },
  error(msg) {
    pinoLogger.error(msg);
  },
  warn(msg) {
    pinoLogger.warn(msg);
  },
  debug(msg) {
    pinoLogger.debug(msg);
  },
};

module.exports = logger;
