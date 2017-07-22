let cron = require('node-cron');
let hnJobs = require('./hackernews_feed');

exports.getHackerNewsFeed = cron.schedule('* */6 * * *', () => {
  console.log("initializing initial feed retrieval from hackerNews", new Date().toUTCString());
  hnJobs.HackerNewsInitialFeed().then((result) => {
    console.log("Got the Feed and saved it to DB: ", result.length);
  });
}).stop();

exports.getHackerNewsFeedMetaData = cron.schedule('*/12 * * * * *', () => {
   console.log("fetching feed detail from HN.........", new Date().toUTCString());
   hnJobs.getHackerNewsMetaData();
}).stop();

exports.gethackerNewsFeedItemBody = cron.schedule('*/30 * * * * *', () => {
  console.log("fetching article body text.........", new Date().toUTCString());
  hnJobs.getFeedBatch('hn_feed', 'pending body', 10);
}).stop();