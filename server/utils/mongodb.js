"use strict";

const MongoClient = require("mongodb");
const ObjectID = MongoClient.ObjectID;
const DBURI = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;
let db;

MongoClient.connect(
  DBURI,
  {
    poolSize: 10
  },
  (err, client) => {
    if (err) {
      throw err;
    }
    db = client.db(dbName);
  }
);

let insertManyDocuments = (coll, docs) => {
  return new Promise((resolve, reject) => {
    db.collection(coll).insertMany(docs, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

let insertDocument = (coll, doc) => {
  return new Promise((resolve, reject) => {
    db.collection(coll).insertOne(doc, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

let deleteDocument = (coll, doc) => {
  return new Promise((resolve, reject) => {
    db.collection(coll).deleteOne({ _id: ObjectID(doc._id) }, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

let updateDocument = (coll, findQuery, updateQuery) => {
  return new Promise((resolve, reject) => {
    db
      .collection(coll)
      .findOneAndUpdate(
        findQuery,
        updateQuery,
        { returnOriginal: false },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
  });
};

let findDocument = (coll, query) => {
  return new Promise((resolve, reject) => {
    db
      .collection(coll)
      .findOne(query)
      .sort({ pubDate: -1 })
      .toArray((err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      });
  });
};

let getDocuments = (coll, query, options) => {
  return new Promise((resolve, reject) => {
    db
      .collection(coll)
      .find(query, options)
      .sort({ pubDate: -1 })
      .toArray((err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      });
  });
};

let getDocumentsWithLimit = (coll, query, sortOption, limit) => {
  return new Promise((resolve, reject) => {
    db
      .collection(coll)
      .find(query)
      .sort(sortOption)
      .limit(parseInt(limit, 10))
      .toArray((err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      });
  });
};

let getAggregateQuery = (coll, query, sort) => {
  return new Promise((resolve, reject) => {
    db
      .collection(coll)
      .aggregate(query)
      .toArray((err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      });
  });
};

let getDistinctQuery = (coll, key, options) => {
  return new Promise((resolve, reject) => {
    db
      .collection(coll)
      .distinct(key, options)
      .toArray((err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      });
  });
};

module.exports = {
  insertManyDocuments,
  updateDocument,
  getDocuments,
  findDocument,
  insertDocument,
  deleteDocument,
  getDocumentsWithLimit,
  getAggregateQuery,
  getDistinctQuery
};
