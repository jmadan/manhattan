'use strict';
const Scheduler = require('../modules/cron/scheduledjobs');

let startTask = (req, res, next) => {
  switch (req.query.job) {
  case 'initialfeeds':
    if (!Scheduler.fetchInitialFeeds.running) {
      Scheduler.fetchInitialFeeds.start();
      res.json({ msg: 'initial feed retrieval...' });
    }
    break;
  case 'fetchfeedcontent':
    if (!Scheduler.fetchFeedContents.running) {
      Scheduler.fetchFeedContents.start();
      res.json({ msg: 'initial feed content retrieval...' });
    }
    break;
  case 'updatenetwork':
    if (!Scheduler.updateNetwork.running) {
      Scheduler.updateNetwork.start();
      res.json({ msg: 'Network update in progress...' });
    }
    break;
  case 'classify':
    if (!Scheduler.classifyDocs.running) {
      Scheduler.classifyDocs.start();
      res.json({ msg: 'Starting classification...' });
    }
    break;
  case 'all':
    if (!Scheduler.fetchInitialFeeds.running) {
      Scheduler.fetchInitialFeeds.start();
    }
    if (!Scheduler.fetchFeedContents.running) {
      Scheduler.fetchFeedContents.start();
    }
    if (!Scheduler.updateNetwork.running) {
      Scheduler.updateNetwork.start();
    }
    Scheduler.classifyDocs.start();
    res.json({ msg: 'Starting all jobs...' });
    break;
  default:
    res.json({ msg: 'No job supplied...' });
    break;
  }

  return next();
};

let stopTask = (req, res, next) => {
  switch (req.query.job) {
  case 'initialfeeds':
    Scheduler.fetchInitialFeeds.stop();
    res.json({ msg: 'Stopping feed retrieval...' });
    break;
  case 'fetchfeedcontent':
    Scheduler.fetchFeedContents.stop();
    res.json({ msg: 'Stopping feed content retrieval...' });
    break;
  case 'classify':
    Scheduler.classifyDocs.stop();
    res.json({ msg: 'Stopping classification...' });
    break;
  case 'all':
    Scheduler.fetchInitialFeeds.stop();
    Scheduler.fetchFeedContents.stop();
    Scheduler.updateNetwork.stop();
    Scheduler.classifyDocs.stop();
    res.json({ msg: 'Stopping all jobs...' });
    break;
  default:
    res.json({ msg: 'No job supplied...' });
    break;
  }

  return next();
};

module.exports = {
  startTask,
  stopTask
};
