'use strict';
const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const DBURI = process.env.MONGODB_URI;
let neo4j = require('../utils/neo4j');

const MongoDB = require('../utils/mongodb');

let fetchUserById = userId => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('users').findOne({ _id: ObjectID(userId) }, (error, item) => {
        if (error) {
          reject(error);
        }
        resolve(item);
      });
    });
  });
};

let fetchUserByEmail = email => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('users').findOne({ email: email }, (error, item) => {
        if (error) {
          reject(error);
        }
        resolve(item);
      });
    });
  });
};

let fetchUserFeed = user => {
  let interestsIdArray = user.interests.map(i => i._id);

  return new Promise((resolve, reject) => {
    neo4j
      .userRecommendation(interestsIdArray)
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

let fetchAnonymousFeed = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db
        .collection('feeditems')
        .aggregate([
          { $match: { $and: [{ status: 'classified' }] } },
          { $sample: { size: 50 } },
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
              subcategory: 1
            }
          }
        ])
        .sort({ pubDate: -1 })
        .toArray((error, docs) => {
          if (error) {
            reject(error);
          }
          resolve(docs);
        });
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
      if (result.insertedCount === 1) {
        user.id = result.insertedId;
        console.log(user);
        neo4j.createUser(user).then(response => {
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
  let { op, attr, value } = reqBody;
  let query = null;
  switch (attr) {
    case 'interest':
      query = { [op === 'add' ? '$addToSet' : '$pull']: { interests: value } };
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
        neo4j.userInterestIn(userId, value._id, op);
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

let performAction = (user, action, item) => {
  return new Promise(async (resolve, reject) => {
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
  performAction
};
