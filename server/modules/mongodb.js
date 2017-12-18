'use strict';

const MongoClient = require('mongodb');
const ObjectID = MongoClient.ObjectID;

const DBURI = process.env.MONGODB_URI;

let insertDocuments = (coll, docs) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if (err) {
        reject(err);
      }
      db.collection(coll).insertMany(docs, (err, result) => {
        db.close();
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  });
};

let insertDocument = (coll, doc) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if (err) {
        reject(err);
      }
      db.collection(coll).update({ name: 'synaptic_brain' }, doc, { upsert: true }, (err, result) => {
        db.close();
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  });
};

let updateDocument = (coll, userId, query) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if (err) {
        reject(err);
      }
      db.collection(coll).updateOne({ _id: ObjectID(userId) }, query, { new: true }, (err, result) => {
        db.close();
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  });
};

let getDocuments = (coll, query) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if (err) {
        reject(err);
      }
      db
        .collection(coll)
        .find(query)
        .toArray((err, docs) => {
          if (err) {
            reject(err);
          }
          resolve(docs);
        });
    });
  });
};

module.exports = { insertDocuments, updateDocument, getDocuments, insertDocument };
