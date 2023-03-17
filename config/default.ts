export default {
  port: process.env.PORT || 4000,
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/express-ts',
  logLevel: process.env.LOG_LEVEL || 'info',
};
