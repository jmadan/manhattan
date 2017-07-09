let cron = require('node-cron');
let hnfeed = require('./hnfeed');

exports.getinitialHNFeed = cron.schedule('31 * * * *', () => {
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


// let hnfeed = require('./hnfeed');
//
// module.exports ={
//   start: () => {
//     console.log("printing this for everytime it runs", new Date().toUTCString());
//   }
// }

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
