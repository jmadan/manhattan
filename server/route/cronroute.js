let Cronjob = require('../modules/cron/scheduledjobs');

let startTask = (req, res, next) => {
  switch (req.params.job) {
  case 'fetchRSSFeed':
    Cronjob.fetchRSSFeed.start();
  case 'fetchFeedContent':
    Cronjob.fetchFeedContent.start();
  case 'updateFeed':
    Cronjob.updateFeed.start();
  default:
    break;
  }
  User.fetchUser(req.params.id).then(user => {
    res.json({ user: user });
  });
  return next();
};

let fetchUserFeed = (req, res, next) => {
  User.fetchUser(req.params.id).then(user => {
    User.fetchUserFeed(user).then(response => {
      res.json({ userfeed: response });
    });
  });
  return next();
};

let userExists = (req, res, next) => {
  User.userExists(req.params.email).then(response => {
    if (response.length > 0) {
      res.json({ user: response[0] });
    } else {
      res.json({ error: 'Not Found' });
    }
  });
  return next();
};

let createUser = (req, res, next) => {
  console.log(req.body);
  return next();
};

module.exports = {
  fetchUser,
  fetchUserFeed,
  createUser,
  userExists
};
