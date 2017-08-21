'use strict';

const MongoClient = require('mongodb').MongoClient;
let BSON = require('mongodb').BSONPure;
const DBURI = process.env.MONGODB_URI;

let getCategories = ()=>{
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('categories').distinct("category", (err, result)=>{
        if(err){
          reject(err);
        }
        db.close();
        resolve(result);
      })
    });
  });
}

let saveCategory = (category) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('categories').insert("category").insertOne(item,(err, savedItem)=>{
        if(err){
          reject(err);
        } else{
          db.close();
          resolve(savedItem);
        }
      });
    });
  });
}

let getDistinctCategories = ()=>{
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      if(err){
        console.log(err);
      } else {
        db.collection("feeditems").distinct("category", (err, result)=>{
          if(err){
            reject(err);
          }
          db.close();
          resolve(result);
        });
      }
    });
  });
}

let deleteCategory = (category)=>{
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      if(err){
        console.log(err);
      } else {
        db.collection("categories").deleteOne({name: category}, (err, result)=>{
          if(err){
            reject(err);
          }
          db.close();
          resolve(result);
        });
      }
    });
  });
}

module.exports = {getDistinctCategories, saveCategory, getCategories}
