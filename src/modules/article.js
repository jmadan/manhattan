const docDB = require('./docDB');
import request from 'request';
const Q = require('q');
const cheerio = require('cheerio');
const natural = require('./natural');


let changeStatus = (id, status) => {
  let deferred = Q.defer();
  docDB.open().then((db) =>{
    return db.collection('feed');
  }).then((coll) => {
    return coll.updateOne({hn_id: parseInt(id)}, {$set: {status: status}});
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
    return db.collection('feed');
  }).then((coll) => {
    return coll.deleteOne({hn_id: parseInt(id)});
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
    return db.collection('feed');
  }).then((coll) => {
    console.log(prop);
    switch (prop)
    {
      case 'stem':
        return coll.updateOne({hn_id: parseInt(article.hn_id)}, {$set: {stemmed: article.stemwords}});
        break;
      case 'keywords':
        return coll.updateOne({hn_id: parseInt(article.hn_id)}, {$set: {keywords: article.keywrds}});
        break;
      case 'body':
        return coll.updateOne({hn_id: parseInt(article.hn_id)}, {$set: {itembody: article.itembody}});
        break;
      case 'category':
        return coll.updateOne({hn_id: parseInt(article.hn_id)}, {$set: {keywords: article.keywrds, category: article.category, status: 'classified'}});
        break;
      default:
        return coll.updateOne({hn_id: parseInt(article.hn_id)}, {$set: {title: article.title}});
    }
  }).then((result)=>{
    docDB.close();
    deferred.resolve({
      error: false,
      message: "document updated",
      docID: article.hn_id
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
    return db.collection('feed');
  }).then((coll) => {
    return coll.find({hn_id: parseInt(id)}).limit(1).toArray();
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
    let articleText = $('body').text().replace('/\s+/gm',' ').replace('([^a-zA-Z])+', ' ').trim();
    doc["itembody"] = articleText;
    deferred.resolve(doc);
  });
  return deferred.promise;
}

let getStemmedDoc = (doc) => {
  doc["stemwords"] = natural.lancasterStem(doc.itembody);
  return doc;
}

export {changeStatus, deleteDocument, updateDocument, search, getDocument, getStemmedDoc, getDocumentBody};
