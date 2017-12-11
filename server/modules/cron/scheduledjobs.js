'use strict';

const CronJob = require('cron').CronJob;
const feed = require('../feed/feedparser');
const initialSetup = require('./initial');
const synaptic = require('../nlp/synaptic');
const article = require('../article');

let fetchInitialFeeds = new CronJob({
  cronTime: '0 5 * * *',
  onTick: () => {
    feed
      .getRSSFeedProviders()
      .then(providers => {
        return feed.getProviderFeed(providers);
      })
      .then(flist => {
        flist.map(f => {
          feed
            .saveRssFeed(f.data)
            .then(result => {
              console.log(result.result.n + ' feeds processed.');
            })
            .catch(err => console.log(err, f));
        });
      });
  },
  start: false
});

let fetchFeedContents = new CronJob({
  cronTime: '*/1 * * * *',
  onTick: () => {
    console.log('fetching Feed content...', new Date().toUTCString());
    feed.fetchItemsWithStatusPendingBody().then(result => {
      feed.fetchContents(result).then(res => {
        res.map(r => {
          feed.updateAndMoveFeedItem(r).then(result => {
            console.log(result.result.n + ' Documents saved.');
          });
        });
      });
    });
  },
  start: false
});

let updateNetwork = new CronJob({
  cronTime: '0 6 * * *',
  onTick: () => {
    console.log('Initiating Network update...');
    initialSetup.trainNetwork();
  },
  start: false
});

let classifyDocs = docs => {
  return Promise.all(
    docs.map(d => {
      return synaptic.synapticClassify(d);
    })
  );
};

let saveClassifiedDocs = docs => {
  return Promise.all(
    docs.map(d => {
      console.log(d._id + ' - ' + d.category);
      return article.autoUpdateArticleByClassification(d);
    })
  );
};

let synapticPrediction = new CronJob({
  cronTime: '* */1 * * *',
  onTick: () => {
    article
      .fetchArticles('unclassified', 50)
      .then(docs => {
        return classifyDocs(docs);
      })
      .then(docsArray => {
        saveClassifiedDocs(docsArray);
      })
      .catch(e => console.log(e));
  },
  start: false
});

module.exports = {
  // fetchRSSFeed,
  // createNetwork,
  synapticPrediction,
  fetchInitialFeeds,
  fetchFeedContents,
  updateNetwork
};
