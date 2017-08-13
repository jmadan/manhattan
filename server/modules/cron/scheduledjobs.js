"use strict";

const cron = require("node-cron");
const feed = require("../feed/feedparser");

let fetchRSSFeed = () => {
  cron.schedule('* * */6 * *', () => {
    console.log("initializing initial feed retrieval", new Date().toUTCString());
    feed.getRSSFeedProviders().then((providers)=>{
      return feed.getFeedForProviders(providers);
    }).then((flist) => {
      flist.map((f)=>{
        feed.saveRssFeed(f.data).then((result)=>{
          console.log(result.result.n + " Documents saved.");
        });
      })
    })
  });
}

module.exports = { fetchRSSFeed }
