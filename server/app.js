let cron = require('node-cron');
let hnfeed = require('./modules/hnfeed');

cron.schedule('* * * * *', () => {
  console.log("calling hnfeed....");
  // hnfeed.getFeed();
  hnfeed.getIdDetails();
});
