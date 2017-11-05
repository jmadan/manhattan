const User = require('../modules/user');

let fetchUser = (req, res, next) => {
  User.fetchUser(req.params.email).then(user => {
    res.json({ user: user });
  });
  return next();
};

let fetchUserFeed = (req, res, next) => {
  if (req.params.email) {
    User.fetchUser(req.params.email).then(user => {
      User.fetchUserFeed(user).then(response => {
        res.json({ userfeed: response });
      });
    });
  } else {
    User.fetchAnonymousFeed().then(response => {
      res.json({ userfeed: response });
    });
  }
  return next();
};

let userExists = (req, res, next) => {
  User.userExists(req.params.email).then(response => {
    if (response.length > 0) {
      res.json({ user: response[0] });
    } else {
      res.json({ statusCode: 404, msg: 'Not Found' });
    }
  });
  return next();
};

let createUser = (req, res, next) => {
  User.newUser(req.body).then(response => {
    res.json({ statusCode: 201, msg: 'user created', userId: response.insertedId });
  });
  return next();
};

let updateUser = (req, res, next) => {
  User.updateUser(req.body).then(result => {
    res.json({ result });
  });
  return next();
};

module.exports = {
  fetchUser,
  fetchUserFeed,
  createUser,
  userExists,
  updateUser
};
