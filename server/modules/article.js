'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const DBURI = process.env.MONGODB_URI;
const textract = require('textract');
const natural = require('natural');
const lancasterStemmer = natural.LancasterStemmer;

exports.fetchArticles = (status) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('feeditems').find({status: status})
        .limit(10)
        .toArray((err, docs) =>{
          if (err) {
            reject(err);
          }
          resolve(docs);
        });
    });
  });
};

exports.getArticle = (id) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('feeditems').findOne({_id: ObjectID(id)}, (err, item)=>{
        if (err) {
          reject(err);
        } else {
          resolve(item);
        }
      });
    });
  });
};

exports.updateArticle = (id, data) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('feeditems').findOneAndUpdate({'_id': ObjectID(data._id)},
        {$set: {itembody: data.itembody, keywords: data.keywords, stemwords: data.stemwords, category: data.category, status: data.status}},
        {returnOriginal: false},
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        }
      );
    });
  });
};

exports.updateArticleCategory = (id, category) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('feeditems').findOneAndUpdate({_id: ObjectID(id)},
        {$set: {category: category, status: 'classified'}},
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        }
      );
    });
  });
};


exports.updateArticleStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('feeditems').findOneAndUpdate({'_id': ObjectID(id)},
        {$set: {status: status}}, {returnOriginal: false},
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        }
      );
    });
  });
};

exports.getItemDetails = (item) => {
  return new Promise((resolve, reject) => {
    rp(item.url).then((response) =>{
      let $ = cheerio.load(response, {normalizeWhitespace: true});
      item.keywords = $('meta[name="keywords"]').attr('content');
      item.itembody = $('body').text()
        .replace('/\s+/mg', '')
        .replace(/[^a-zA-Z ]/g, '')
        .trim();
      resolve(item);
    })
      .catch(err => reject(err));
  });
};

exports.getArticleText = (item) => {
  textract.fromUrl(item.url, (function (error, text) {
    return text;
  }));
};

exports.getArticleStemWords = (item) => {
  return new Promise((resolve, reject) =>{
    try {
      textract.fromUrl(item.url, (function (error, text) {
        if (text) {
          item.itembody = text;
          item.stemwords = lancasterStemmer.tokenizeAndStem(text);
          resolve(item);
        }
        reject(error);
      }));
    } catch (err) {
      reject(error);
    }
  });
};

exports.saveItem = (item) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('articles').insertOne(item, (err, savedItem)=>{
        if (err) {
          reject(err);
        } else {
          db.close();
          resolve(savedItem);
        }
      });
    });
  });
};

exports.getArticleBasedOnCategory = (category) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      db.collection('feeditems').find({'category': category.toLowerCase()})
        .toArray((err, item)=>{
          if (err) {
            reject(err);
          } else {
            resolve(item);
          }
        });
    });
  });
};

exports.updateItem = (item) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      db.collection('feeditems').findOneAndUpdate({_id: ObjectID(item.id)},
        {$set: {itembody: item.itembody, keywords: item.keywords, stemwords: item.stemwords, category: item.category}},
        {returnOriginal: false},
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        }
      );
    });
  });
};
