'use strict';

const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const DBURI = process.env.MONGODB_URI;

let fetchUser = (id) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('user').find({_id: ObjectID(id)}, (error, item) => {
        if (error) {
          reject(error);
        }
        resolve(item);
      });
    });
  });
};

let fetchUserFeed = (user) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('feeditems').find({status: 'classified', category: {$in: user.interests}}, {url: 1, title: 1, keywords: 1, category: 1, publisher: 1, author: 1})
        .limit(50)
        .toArray((error, docs) =>{
          if (error) {
            reject(error);
          }
          resolve(docs);
        });
    });
  });
};

let userExists = (email) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('users').find({email: email})
        .toArray((err, user) => {
          if (err) {
            reject(err);
          }
          resolve(user);
        });
    });
  });
};

// let newUser = (user) => {
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(DBURI, (err, db)=>{
//       db.collection('users').find({: 'classified', category: {$in: user.interests}},{url: 1, title: 1, keywords: 1, category: 1, publisher: 1, author: 1})
//         .limit(50)
//         .toArray((error, docs) =>{
//           if (error) {
//             reject(error);
//           }
//           resolve(docs);
//         });
//     });
//   });
// };

module.exports = {
  fetchUser,
  fetchUserFeed,
  userExists
};
