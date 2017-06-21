'use strict';

const MongoClient = require('mongodb').MongoClient;

let open = () => {
  let dbURI = process.env.MONGO_URI ? process.env.MONGO_URI : "mongodb://localhost:27017/manhattan";
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

//
//
// exports.connectDB = (dbURI) => {
//   console.log("state before connection: ", mongoose.connection.readyState);
//   if(!dbURI) dbURI="mongodb://localhost/niteowl";
//
//   console.log(dbURI);
//
//   // if (mongoose.connection.readyState != 2) {
//   //     mongoose.connect(dbURI);
//   //     console.log("state after connection: ", mongoose.connection.readyState);
//   //     console.log("Mongo Connected");
//   // } else {
//   //     console.log("Mongo Already Connected");
//   // }
//   let db = mongoose.connect(dbURI);
//
//   mongoose.connection.on('connected', function () {
//     console.log('Mongoose default connection open to ' + dbURI);
//     console.log("state after connection: ", mongoose.connection.readyState);
//   });
//
//   // If the connection throws an error
//   mongoose.connection.on('error',function (err) {
//     console.log('Mongoose default connection error: ' + err);
//   });
//
//   // When the connection is disconnected
//   mongoose.connection.on('disconnected', function () {
//     console.log('Mongoose default connection disconnected');
//   });
//   return db;
// };
//
// exports.disconnectDB = () => {
//     mongoose.disconnect();
//     console.log("state after disconnect: ", mongoose.connection.readyState);
//     console.log("Mongo Diconnected");
// };
//
// exports.saveToDB = (modelToBeSaved) => {
//
// }
