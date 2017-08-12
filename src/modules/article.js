const docDB = require('./docDB');
import request from 'request';
const Q = require('q');
const cheerio = require('cheerio');
const natural = require('./natural');
let ObjectId = require('mongodb').ObjectID;


let changeStatus = (id, status) => {
  let deferred = Q.defer();
  docDB.open().then((db) =>{
    return db.collection('feeditems');
  }).then((coll) => {
    return coll.updateOne({_id: ObjectId(id)}, {$set: {status: status}});
  }).then((result)=>{
    docDB.close();
    if(result.nModified == 1){
      deferred.resolve({
        error: false,
        message: "document not updated",
        docID: id,
        count: result.modifiedCount
      });
    } else {
      deferred.resolve({
        error: false,
        message: "document updated",
        docID: id,
        count: result.modifiedCount
      });
    }
  }).catch((err) =>{
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}

let deleteDocument = (id) => {
  let deferred = Q.defer();
  docDB.open().then((db) =>{
    return db.collection('feeditems');
  }).then((coll) => {
    return coll.deleteOne({_id: ObjectId(id)});
  }).then((result)=>{
    docDB.close();
    deferred.resolve({
      error: false,
      message: "document with ID "+ id +" deleted",
      docID: id
    });
  }).catch((err) =>{
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}

let updateDocument = (article, prop) => {
  let deferred = Q.defer();
  docDB.open().then((db) => {
    return db.collection('feeditems');
  }).then((coll) => {
    switch (prop)
    {
      case 'stem':
        return coll.updateOne({_id: ObjectId(article._id)}, {$set: {stemwords: article.stemwords}});
        break;
      case 'keywords':
        return coll.updateOne({_id: ObjectId(article._id)}, {$set: {keywords: article.keywords}});
        break;
      case 'body':
        return coll.updateOne({_id: ObjectId(article._id)}, {$set: {itembody: article.itembody}});
        break;
      case 'category':
        return coll.updateOne({_id: ObjectId(article._id)}, {$set: {keywords: article.keywords, category: article.category, status: 'classified'}});
        break;
      default:
        return coll.updateOne({_id: ObjectId(article._id)}, {$set: {title: article.title}});
    }
  }).then((result)=>{
    docDB.close();
    deferred.resolve({
      error: false,
      message: "document updated",
      docID: article._id
    });
  }).catch((err) =>{
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}

let search = (query, docLimit) => {

  let deferred = Q.defer();
  if(!query){
    query = {};
  }
  docDB.open().then((db) => {
    return db.collection("feed");
  }).then((collection) => {
    return collection.find(query).limit(docLimit).toArray();
  }).then((docs) => {
    docDB.close();
    deferred.resolve({
      error: false,
      list: docs
    });
  }).catch((err)=>{
    deferred.reject({
      message: err,
      error: true
    });
  });
  return deferred.promise;
}

let getDocument = (id) => {
  let deferred = Q.defer();
  docDB.open().then((db) =>{
    return db.collection('feeditems');
  }).then((coll) => {
    return coll.find({_id: ObjectId(id)}).limit(1).toArray();
  }).then((doc)=>{
    docDB.close();
    deferred.resolve(doc[0]);
  }).catch((err) =>{
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}

let getDocumentBody = (doc) => {
  let deferred = Q.defer();
  request(doc.url, (error, response, html)=>{
    if(error){
      deferred.reject(error);
    }
    let $ = cheerio.load(html, {normalizeWhitespace: true});
    let articleText = $('body').text().replace('/\s+/gm',' ').replace('([^a-zA-Z])+', ' ').toLowerCase();
    doc["itembody"] = articleText;
    deferred.resolve(doc);
  });
  return deferred.promise;
}

let getStemmedDoc = (doc) => {
  let corpus = {}, bagofwords=[];
  let text = natural.lancasterStem(doc.itembody);
  text.map((t) => {
    if(t.length>=4 && t.length<20){
      if(!corpus[t]){
        corpus[t];
      }
      bagofwords.push(String(t.toLowerCase()));
    }
  });
  doc.stemwords = bagofwords;
  doc.corpus = corpus;
  return doc;
}

export {changeStatus, deleteDocument, updateDocument, search, getDocument, getStemmedDoc, getDocumentBody};
