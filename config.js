module.exports = {
  name: 'MANHATTAN',
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  base_url: process.env.BASE_URL || 'http://localhost:4000',
  db: {
    uri: process.env.MANHATTAN_MONGODB_URI || 'mongodb://127.0.0.1:27017/manhattan',
  }
};
