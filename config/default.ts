export default {
  port: process.env.PORT || 4000,
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/express-ts',
  logLevel: process.env.LOG_LEVEL || 'info',
  accessTokenPrivateKey: '',
  refreshTokenPrivateKey: '',
  smtp: {
    user: 'gfi77mtkszhaioy7@ethereal.email',
    pass: 'bUCjBk5a3Me4ht6P9U',
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
  },
};
