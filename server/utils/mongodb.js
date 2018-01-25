'use strict';

const MongoClient = require('mongodb');
const ObjectID = MongoClient.ObjectID;
const DBURI = process.env.MONGODB_URI;

let insertManyDocuments = (coll, docs) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, datab) => {
      if (err) {
        reject(err);
      }
      datab
        .db('manhattan')
        .collection(coll)
        .insertMany(docs, (err, result) => {
          datab.close();
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
    MongoClient.connect(DBURI, (err, datab) => {
      if (err) {
        reject(err);
      }
      datab
        .db('manhattan')
        .collection(coll)
        .insertOne(doc, (err, result) => {
          datab.close();
          if (err) {
            reject(err);
          }
          resolve(result);
        });
    });
  });
};

let deleteDocument = (coll, doc) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, datab) => {
      if (err) {
        reject(err);
      }
      datab
        .db('manhattan')
        .collection(coll)
        .deleteOne({ _id: ObjectID(doc._id) }, (err, result) => {
          datab.close();
          if (err) {
            reject(err);
          }
          resolve(result);
        });
    });
  });
};

let updateDocument = (coll, findQuery, updateQuery) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, datab) => {
      if (err) {
        reject(err);
      }
      datab
        .db('manhattan')
        .collection(coll)
        .findOneAndUpdate(findQuery, updateQuery, { returnOriginal: false }, (error, result) => {
          datab.close();
          if (error) {
            reject(error);
          }
          resolve(result);
        });
    });
  });
};

let getDocuments = (coll, query) => {
  return new Promise((resolve, reject) => {
    console.log(DBURI);
    MongoClient.connect(DBURI, (err, datab) => {
      if (err) {
        reject(err);
      }
      datab
        .db('manhattan')
        .collection(coll)
        .find(query)
        .sort({ pubDate: -1 })
        .toArray((err, docs) => {
          if (err) {
            reject(err);
          }
          datab.close();
          resolve(docs);
        });
    });
  });
};

let getDocumentsWithLimit = (coll, query, limit) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, datab) => {
      if (err) {
        reject(err);
      }
      datab
        .db('manhattan')
        .collection(coll)
        .find(query)
        .limit(parseInt(limit, 10))
        .toArray((err, docs) => {
          if (err) {
            reject(err);
          }
          datab.close();
          resolve(docs);
        });
    });
  });
};

module.exports = {
  insertManyDocuments,
  updateDocument,
  getDocuments,
  insertDocument,
  deleteDocument,
  getDocumentsWithLimit
};
