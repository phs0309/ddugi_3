import winston from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: nodeEnv === 'development' ? consoleFormat : logFormat
  })
];

// Disable file logging in serverless environments like Vercel
// where file system writes are restricted
if (nodeEnv === 'production' && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    transports.push(
      new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join('logs', 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    );
  } catch (error) {
    console.warn('File logging disabled due to filesystem restrictions');
  }
}

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exitOnError: false
});

export default logger;