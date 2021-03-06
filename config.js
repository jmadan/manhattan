module.exports = {
  name: 'MANHATTAN',
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  base_url: process.env.BASE_URL || 'http://localhost',
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manhattan'
  }
};
