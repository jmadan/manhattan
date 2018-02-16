"use strict";

const MongoClient = require("mongodb");
const ObjectID = MongoClient.ObjectID;
const DBURI = process.env.MONGODB_URI;
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
    db = client.db("manhattan");
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

let getDocumentsWithLimit = (coll, query, limit) => {
  return new Promise((resolve, reject) => {
    db
      .collection(coll)
      .find(query)
      .limit(parseInt(limit, 10))
      .toArray((err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      });
  });
  //   MongoClient.connect(DBURI, (err, datab) => {
  //     if (err) {
  //       reject(err);
  //     }
  //     datab
  //       .db('manhattan')
  //       .collection(coll)
  //       .find(query)
  //       .limit(parseInt(limit, 10))
  //       .toArray((err, docs) => {
  //         if (err) {
  //           reject(err);
  //         }
  //         datab.close();
  //         resolve(docs);
  //       });
  //   });
  // });
};

module.exports = {
  insertManyDocuments,
  updateDocument,
  getDocuments,
  insertDocument,
  deleteDocument,
  getDocumentsWithLimit
};
