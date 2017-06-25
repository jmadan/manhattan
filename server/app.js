let cron = require('node-cron');
let hnfeed = require('./modules/hnfeed');

// cron.schedule('* * 6 * *', () => {
//   console.log("initialing intial feed retrieval....");
//   hnfeed.getinitialfeedlist();
//  });
//
//  cron.schedule('* * * * *', () => {
//    console.log("initialing feed deatil from HN....");
//    hnfeed.getfeeditemdetails();
// });

cron.schedule('* * * * *', () => {
  console.log("getting the article body text....");
  hnfeed.gettext();
})
