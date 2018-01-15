const User = require('../modules/user');
let ObjectID = require('mongodb').ObjectID;
const Article = require('../modules/article');

let fetchUserByEmail = (req, res, next) => {
  User.fetchUserByEmail(req.params.email).then(user => {
    res.json({ user: user });
  });
  return next();
};

let fetchUserFeed = (req, res, next) => {
  if (req.params.userId && ObjectID.isValid(req.params.userId)) {
    User.fetchUserById(req.params.userId).then(user => {
      User.fetchUserFeed(user).then(response => {
        Article.formatFeedResponse(response.records).then(val => {
          res.json({ userfeed: val });
        });
      });
    });
  } else {
    User.fetchAnonymousFeed().then(response => {
      res.json({ userfeed: response });
    });
  }
  return next();
};

let createUser = (req, res, next) => {
  User.newUser(req.body).then(response => {
    res.json({
      statusCode: 201,
      msg: 'user created',
      userId: response.insertedId
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

module.exports = {
  fetchUserByEmail,
  fetchUserFeed,
  createUser,
  updateUser,
  updateUserInterest,
  userAction
};
