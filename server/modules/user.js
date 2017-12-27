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
  let today = Math.round(new Date().getTime() / 1000);
  let seventyTwoHours = today - 72 * 3600 * 1000;

  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db
        .collection('feeditems')
        .find(
          {
            $and: [
              { status: 'classified' },
              { category: { $in: user.interests ? user.interests.map(i => i.name) : [] } },
              { pubDate: { $gte: seventyTwoHours } }
            ]
          },
          {
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
        )
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

let fetchAnonymousFeed = () => {
  let today = Math.round(new Date().getTime() / 1000);
  let seventyTwoHours = today - 72 * 3600 * 1000;
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
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('users').insertOne(
        {
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
        }
      );
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
    MongoC.updateDocument('users', userId, query)
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

module.exports = {
  fetchUserById,
  fetchUserByEmail,
  fetchUserFeed,
  newUser,
  updateUser,
  fetchAnonymousFeed
};
