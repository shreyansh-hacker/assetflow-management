module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  dbUrl: process.env.DATABASE_URL
};
