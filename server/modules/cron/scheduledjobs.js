'use strict';

const CronJob = require('cron').CronJob;
const feed = require('../feed/feedparser');
const initialSetup = require('./initial');
const synaptic = require('../nlp/synaptic');
const article = require('../article');

let initialjobs = () =>
  new CronJob({
    cronTime: '5 0 * 1 *',
    onTick: () => {
      initialSetup
        .distinctCategoryNumber()
        .then(num => {
          console.log(num);
          initialSetup.createDictionary();
          initialSetup.createCategoryMap();
          initialSetup.createNetwork();
          console.log('Initial commands executed...');
        })
        .catch(e => console.log(e));
    },
    start: false
  });

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

let saveClassifiedDocs = doc => {
  article.autoUpdateArticleByClassification(doc).then(d => {
    console.log(
      d.value._id +
        ' - update ' +
        JSON.stringify(d.lastErrorObject.updatedExisting)
    );
  });
};

let synapticTraining = new CronJob({
  cronTime: '30 11 * * *',
  onTick: () => {
    console.log('Triaing the Network Now.....');
    synaptic.trainNetwork();
  },
  start: true
});

let classifyDocs = new CronJob({
  cronTime: '*/3 * * * *',
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
  classifyDocs,
  initialjobs
};
