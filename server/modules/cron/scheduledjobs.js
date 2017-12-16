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
  cronTime: '30 22 * * Sunday',
  onTick: () => {
    console.log('Initiating Network update...');
    initialSetup.trainNetwork();
  },
  start: false
});

let saveClassifiedDocs = doc => {
  article.autoUpdateArticleByClassification(doc).then(d => {
    console.log(d.value._id + ' - update ' + d.lastErrorObject.updateExisting);
  });
};

let synapticTraining = new CronJob({
  cronTime: '49 * * * *',
  onTick: () => {
    synaptic.trainNetwork();
  },
  start: true
});

let classifyDocs = new CronJob({
  cronTime: '*/4 * * * *',
  onTick: () => {
    console.log('Initiating article classification ...');
    article
      .fetchArticles('unclassified', 1)
      .then(doc => {
        return synaptic.classifyDocs(doc[0]);
      })
      .then(item => {
        saveClassifiedDocs(item);
      })
      .catch(e => console.log(e));
  },
  start: false
});

module.exports = {
  synapticTraining,
  fetchInitialFeeds,
  fetchFeedContents,
  updateNetwork,
  classifyDocs
};
