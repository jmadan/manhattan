'use strict';

const MongoClient = require('mongodb').MongoClient;

let open = () => {
  let dbURI = process.env.MONGODB_URI ? process.env.MONGODB_URI : "mongodb://localhost:27017/manhattan";
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbURI, (err, db) => {
      if(err) {
        reject(err);
      }
      resolve(db);
    });
  });
}

let close = (db)=>{
  if(db){
    db.close();
  }
}

let db = {
  open: open,
  close: close
}

module.exports = db;
