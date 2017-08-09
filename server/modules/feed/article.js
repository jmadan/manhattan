'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const DBURI = process.env.MONGODB_URI;

exports.getItemDetails = (item) => {
  return new Promise((resolve, reject) => {
    rp(item.url).then((response) =>{
      let $ = cheerio.load(response,{normalizeWhitespace: true});
      item.keywords = $('meta[name="keywords"]').attr('content');
      item.itembody = $('body').text().replace('/\s+/mg','').replace(/[^a-zA-Z ]/g, "").trim();
      resolve(item);
    }).catch(err => reject(err));
  });
}

exports.getItem = (id) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('feed').findOne({"_id": ObjectID(id)},(err, item)=>{
        if(err){
          reject(err);
        } else{
          resolve(item);
        }
      });
    });
  });
}

exports.saveItem = (item) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('articles').insertOne(item,(err, savedItem)=>{
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
