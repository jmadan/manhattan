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
