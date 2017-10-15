const User = require('../modules/user');

let fetchUser = (req, res, next) => {
  User.fetchUser(req.params.id).then((user) => {
    res.json({user: user});
  });
  return next();
};

let fetchUserFeed = (req, res, next) => {
  User.fetchUser(req.params.id).then((user) => {
    User.fetchUserFeed(user)
      .then((response) => {
        res.json({userfeed: response});
      });
  });
  return next();
};

module.exports = {
  fetchUser,
  fetchUserFeed
};
