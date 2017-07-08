let hnfeed = require('./modules/hnfeed');

module.exports ={
  start: () => {
    console.log("printing this for everytime it runs");
  }
}

// exports.getinitialHNFeed = cron.schedule('* * * * *', () => {
//   console.log("initialing intial feed retrieval....");
//   hnfeed.getinitialfeedlist();
//  });
//
// exports.getHNFeedDetail = cron.schedule('* 10 * * *', () => {
//    console.log("initialing feed detail from HN....");
//    hnfeed.getfeeditemdetails();
// });
//
// exports.getFeedItemBody = cron.schedule('* 2 * * *', () => {
//   console.log("getting the article body text....");
//   hnfeed.gettext();
// });
