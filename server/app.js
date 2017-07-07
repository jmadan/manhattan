let cron = require('node-cron');
let hnfeed = require('./modules/hnfeed');

exports.getinitialHNFeed = cron.schedule('* * 6 * *', () => {
  console.log("initialing intial feed retrieval....");
  hnfeed.getinitialfeedlist();
 });

exports.getHNFeedDetail = cron.schedule('* 10 * * *', () => {
   console.log("initialing feed deatil from HN....");
   hnfeed.getfeeditemdetails();
});

exports.getFeedItemBody = cron.schedule('* 2 * * *', () => {
  console.log("getting the article body text....");
  hnfeed.gettext();
});
