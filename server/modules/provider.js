'use strict';
const MongoDB = require('../utils/mongodb');
// const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const DBURI = process.env.MONGODB_URI;

exports.fetchProviders = () => {
  return new Promise((resolve, reject) => {
    MongoDB.getDocuments('feedproviders', {}).then((result) => {
      resolve(result);
    });
  });
};

exports.newProvider = data => {
  return new Promise((resolve, reject) => {
    MongoDB.insertDocument('feedproviders', {
      name: data.name,
      url: data.url,
      topic: data.topic,
      status: data.status
    }).then((result) => {
      resolve(result);
    });
  });
};

exports.updateProvider = (status, id) => {
  return new Promise((resolve, reject) => {
    MongoDB.updateDocument('feedproviders', { _id: ObjectID(id) }, { $set: { status: status } }).then((result) => {
      resolve(result);
    });
  });
};
