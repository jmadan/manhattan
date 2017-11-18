'use strict';
const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const DBURI = process.env.MONGODB_URI;

const MongoC = require('./mongodb');

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
  let user_interests = user.interests.map(i => i.name);
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db
        .collection('feeditems')
        .find(
          { status: 'classified', category: { $in: user_interests } },
          {
            url: 1,
            title: 1,
            description: 1,
            keywords: 1,
            author: 1,
            pubDate: 1,
            provider: 1,
            category: 1
          }
        )
        .limit(50)
        .toArray((error, docs) => {
          if (error) {
            reject(error);
          }
          resolve(docs);
        });
    });
  });
};

let fetchAnonymousFeed = () => {
  let today = Math.round(new Date().getTime() / 1000);
  let twentyFoursAgo = (today - 24 * 3600) * 1000;
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db
        .collection('feeditems')
        .find(
          { status: 'classified', pubDate: { $gte: twentyFoursAgo } },
          {
            url: 1,
            title: 1,
            keywords: 1,
            category: 1,
            publisher: 1,
            author: 1,
            pubDate: 1
          }
        )
        .limit(50)
        .toArray((error, docs) => {
          if (error) {
            reject(error);
          }
          resolve(docs);
        });
    });
  });
};

let userExists = email => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db
        .collection('users')
        .find({ email: email })
        .toArray((err, user) => {
          if (err) {
            reject(err);
          }
          resolve(user);
        });
    });
  });
};

let newUser = user => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('users').insertOne({
        nickname: user.nickname,
        name: user.name,
        email: user.email,
        picture: user.picture,
        updated_at: user.updated_at,
        role: user.role ? user.role : 'member'
      },
      (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  });
};

let updateUser = (userId, reqBody) => {
  let { op, attr, value } = reqBody;
  let query = null;
  switch (attr) {
  case 'interest':
    query = { _id: ObjectID(userId) } + ', ' + { [op === 'add' ? '$addToSet' : '$pull']: { interests: value } };
    break;
  case 'user':
    query = { _id: ObjectID(userId) } + ', ' + { $set: value };
    break;
  default:
    break;
  }

  return new Promise((resolve, reject) => {
    MongoC.updateDocument('users', query)
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
  // return new Promise((resolve, reject) => {
  //   MongoClient.connect(DBURI, (err, db) => {
  //     db.collection('users').updateOne({
  //       email: user.email
  //     },
  //     { $set: user },
  //     { new: true },
  //     (error, result) => {
  //       if (error) {
  //         reject(err);
  //       }
  //       resolve(result);
  //     });
  //   });
  // });
};

let updateUserInterest = item => {
  let query = { [item.action === 'add' ? '$addToSet' : '$pull']: { interests: item.interest } };
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('users').updateOne({
        email: item.email
      },
      query,
      { new: true },
      (error, result) => {
        if (error) {
          reject(err);
        }
        resolve(result);
      });
    });
  });
};

module.exports = {
  fetchUserById,
  fetchUserByEmail,
  fetchUserFeed,
  userExists,
  newUser,
  updateUser,
  fetchAnonymousFeed,
  updateUserInterest
};
