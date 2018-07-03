'use strict';
let ObjectID = require('mongodb').ObjectID;
let neo4j = require('../utils/neo4j');

const MongoDB = require('../utils/mongodb');

let fetchUserById = userId => {
  return new Promise((resolve) => {
    MongoDB.getDocuments('users', { _id: ObjectID(userId) }).then((result) => {
      resolve(result);
    });
  });
};

let fetchUserByEmail = email => {
  return new Promise((resolve) => {
    MongoDB.getDocuments('users', { email: email }).then((result) => {
      let user = result[0];
      if (result.length) {
        neo4j.getUser(user).then(response => {
          if (response.user) {
            user.tags = response.user.records[0].get('tags');
          }
          resolve(user);
        });
      } else {
        resolve(user);
      }
    });
  });
};

let fetchUserFeed = user => {
  let interestsIdArray = user.interests && user.interests.length > 0 ? user.interests.map(i => i._id) : [];
  return new Promise((resolve, reject) => {
    neo4j
      .userRecommendation(user._id, interestsIdArray)
      .then(result => {
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

let savedFeed = user => {
  return new Promise((resolve, reject) => {
    neo4j
      .userSavedList(user)
      .then(result => {
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

let standardFeed = () => {
  return new Promise((resolve, reject) => {
    neo4j
      .standardRecommendation()
      .then(result => {
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

let fetchAnonymousFeed = () => {
  return new Promise((resolve) => {
    MongoDB.getAggregateQuery('feeditems', [
      { $match: { $and: [{ status: 'classified' }] } },
      { $sample: { size: 100 } },
      {
        $project: {
          url: 1,
          title: 1,
          description: 1,
          keywords: 1,
          author: 1,
          pubDate: 1,
          provider: 1,
          category: 1,
          parentcat: 1,
          subcategory: 1,
          img: 1
        }
      }
    ], { pubDate: -1 }).then(result => {
      resolve(result);
    });
  });
};

let newUser = user => {
  return new Promise((resolve, reject) => {
    MongoDB.insertDocument('users', {
      nickname: user.nickname,
      name: user.name,
      email: user.email,
      picture: user.picture,
      updated_at: user.updated_at,
      role: user.role ? user.role : 'member'
    }).then(result => {
      console.log('created user in Mongo.............');
      if (result.insertedCount === 1) {
        user.id = result.insertedId;
        neo4j.createUser(user).then(response => {
          console.log('creating user in Neo.............');
          if (response.records.length > 0) {
            resolve(user);
          } else {
            reject(new Error('Failed to create user graph node.'));
          }
        });
      } else {
        reject(result);
      }
    });
  });
};

let updateUser = (userId, reqBody) => {
  let { action, attr, value } = reqBody;
  let query = null;
  switch (attr) {
  case 'interest':
    query = { [action === 'add' ? '$addToSet' : '$pull']: { interests: value } };
    break;
  case 'user':
    query = { $set: { value } };
    break;
  default:
    break;
  }

  return new Promise((resolve, reject) => {
    MongoDB.updateDocument('users', { _id: ObjectID(userId) }, query)
      .then(result => {
        neo4j.userInterestIn(userId, value._id, action);
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

let performAction = (user, action, item) => {
  return new Promise((resolve, reject) => {
    neo4j
      .userAction(user, action, item)
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
    // }
  });
};

module.exports = {
  fetchUserById,
  fetchUserByEmail,
  fetchUserFeed,
  savedFeed,
  newUser,
  updateUser,
  fetchAnonymousFeed,
  performAction,
  standardFeed
};
