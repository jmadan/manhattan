"use strict";

const MongoClient = require("mongodb");
const DBURI = process.env.MONGODB_URI;

let insertDocuments = (coll, docs) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      if(err){reject(err);}
      db.collection(coll).insertMany(docs, (err, result) => {
        db.close();
        if(err){reject(err)}
        resolve(result);
      });
    });
  });
}

let updateDocument = (coll, query) => {
  console.log(query);
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      if(err){reject(err);}
      db.collection(coll).updateOne(query, (err, result) => {
        db.close();
        if(err){reject(err)}
        resolve(result);
      });
    });
  });
}

let getDocuments = (coll, query) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if(err){reject(err)}
      db.collection(coll).find(query).toArray((err, docs) => {
        if(err){reject(err)}
        resolve(docs);
      });
    });
  });
}

module.exports = { insertDocuments, updateDocument, getDocuments }
