const User = require('../modules/user');
let ObjectID = require('mongodb').ObjectID;
const Article = require('../modules/article');
const AI = require('../modules/recommendation');

let fetchUserByEmail = (req, res, next) => {
  User.fetchUserByEmail(req.params.email).then(user => {
    res.json({ user: user });
  });
  return next();
};

let fetchUserFeed = async (req, res, next) => {
  if (req.headers.userid && ObjectID.isValid(req.headers.userid)) {
    let user = await User.fetchUserById(req.headers.userid);
    console.log(user);
    let feed = await User.fetchUserFeed(user[0]);
    if (feed.records.length === 0) {
      User.standardFeed().then(result => {
        Article.formatFeedResponse(result.records).then(val => {
          res.json({ userfeed: val });
        });
      });
    } else {
      console.log("I am in specific...............");
      Article.formatFeedResponse(feed.records).then(val => {
        res.json({ userfeed: val });
      });
    }
  } else {
    User.fetchAnonymousFeed().then(response => {
      res.json({ userfeed: response });
    });
  }
  return next();
};

let fetchUserSavedFeed = (req, res, next) => {
  if (req.params.userId && ObjectID.isValid(req.params.userId)) {
    User.fetchUserById(req.params.userId).then(user => {
      User.savedFeed(user).then(response => {
        Article.formatFeedResponse(response.records).then(val => {
          res.json({ userfeed: val });
        });
      });
    });
  } else {
    res.json({ error: 'user id is not valid' });
  }
  return next();
};

let createUser = (req, res, next) => {
  User.newUser(req.body).then(response => {
    res.json({
      statusCode: 201,
      msg: 'user created',
      userId: response.id
    });
  });
  return next();
};

let updateUser = (req, res, next) => {
  User.updateUser(req.body).then(result => {
    res.json({ result });
  });
  return next();
};

let updateUserInterest = (req, res, next) => {
  if (ObjectID.isValid(req.body.userId)) {
    User.updateUser(req.body.userId, req.body).then(result => {
      res.json({ result });
    });
  } else {
    res.json({ error: 'Invalid UserId' });
  }
  return next();
};

let userAction = (req, res, next) => {
  let { user, action, item } = req.body;
  if (user && action && item) {
    User.performAction(user, action, item).then(result => {
      res.json({ msg: result });
    });
  } else {
    res.json({ error: 'Information missing to perform the action' });
  }
  return next();
};

let fetchCatRecommendation = (req, res, next) => {
  let userId = req.headers.userid;
  AI.fetchCatRecommendations(userId).then(result => {
    res.json({ cats: result.records.map(r => r.get('name')) });
  });
  return next();
};

module.exports = {
  fetchUserByEmail,
  fetchUserFeed,
  fetchUserSavedFeed,
  createUser,
  updateUser,
  updateUserInterest,
  userAction,
  fetchCatRecommendation
};
