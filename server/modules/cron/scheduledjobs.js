'use strict';

const cron = require('node-cron');
const CronJob = require('cron').CronJob;
const feed = require('../feed/feedparser');
// const initialSetup = require('./initial');

// let createNetwork = () => {
//   cron.schedule('* * */24 * * *', () => {
//     console.log('Initializing Network creation and update', new Date().toDateString);
//     initialSetup
//       .distinctCategoryNumber()
//       .then(num => {
//         console.log(num);
//         initialSetup.createDictionary();
//         initialSetup.createCategoryMap();
//         initialSetup.createNetwork();
//       })
//       .catch(e => console.log(e));
//   });
// };

// let fetchRSSFeed = () => {
//   cron.schedule('*/5 * * * *', () => {
//     console.log('initializing initial feed retrieval...', new Date().toUTCString());
//     feed
//       .getRSSFeedProviders()
//       .then(providers => {
//         return feed.getProviderFeed(providers);
//       })
//       .then(flist => {
//         flist.map(f => {
//           feed.saveRssFeed(f.data).then(result => {
//             console.log(result.result.n + ' Documents saved.');
//           });
//         });
//       });
//   });
// };

let fetchFeedContent = () => {
  cron.schedule('*/15 * * * * *', () => {
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
  });
};

let updateFeed = () => {
  cron.schedule('*/13 * * * * *', () => {
    console.log('updating article content for feed...', new Date().toUTCString());
    feed.fetchAndUpdate().then(docs => {
      feed.fetchContents(docs).then(d => {
        console.log(d.length);
      });
    });
  });
};

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

module.exports = {
  // fetchRSSFeed,
  // createNetwork,
  fetchFeedContent,
  updateFeed,
  fetchInitialFeeds,
  fetchFeedContents
};
