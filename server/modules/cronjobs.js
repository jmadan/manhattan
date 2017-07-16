let cron = require('node-cron');
let hnJobs = require('./hnjobs');

exports.getinitialHNFeed = cron.schedule('* */6 * * *', () => {
  console.log("initializing intial feed retrieval.........", new Date().toUTCString());
  hnJobs.getInitialHNStories();
}).stop();

exports.getHNFeedDetail = cron.schedule('*/3 * * * *', () => {
   console.log("fetching feed detail from HN.........", new Date().toUTCString());
   hnJobs.createFeed();
}).stop();

exports.getFeedItemBody = cron.schedule('*/5 * * * * *', () => {
  console.log("fetching article body text.........", new Date().toUTCString());
  hnJobs.getItemPendingBodyStatus();
}).stop();
