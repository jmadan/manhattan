'use strict';

const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const DBURI = process.env.MONGODB_URI;

exports.fetchProviders = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db
        .collection('feedproviders')
        .find({})
        .toArray((err, docs) => {
          if (err) {
            reject(err);
          }
          resolve(docs);
        });
    });
  });
};

exports.newProvider = data => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (error, db) => {
      db.collection('feedproviders').insertOne({
        name: data.name,
        url: data.url,
        topic: data.topic,
        status: data.status
      },
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  });
};

exports.updateProvider = (status, id) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db
        .collection('feedproviders')
        .findOneAndUpdate({ _id: ObjectID(id) }, { $set: { status: status } }, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
    });
  });
};
