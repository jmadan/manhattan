let cron = require('node-cron');
let hnfeed = require('./hnfeed');

exports.getinitialHNFeed = cron.schedule('* */6 * * *', () => {
  console.log("initializing intial feed retrieval.........", new Date().toUTCString());
  hnfeed.getinitialfeedlist();
 });

exports.getHNFeedDetail = cron.schedule('*/3 * * * *', () => {
   console.log("fetching feed detail from HN.........", new Date().toUTCString());
   hnfeed.getfeeditemdetails();
});

exports.getFeedItemBody = cron.schedule('*/5 * * * *', () => {
  console.log("fetching article body text.........", new Date().toUTCString());
  hnfeed.gettext();
});
