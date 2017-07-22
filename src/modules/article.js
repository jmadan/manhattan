let docDB = require('./docDB');
let Q = require('q');

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

let updateDocument = (id, category) => {
  let deferred = Q.defer();
  docDB.open().then((db) =>{
    return db.collection('feed');
  }).then((coll) => {
    return coll.updateOne({hn_id: parseInt(id)}, {$set: {category: category, status: 'classified'}});
  }).then((result)=>{
    docDB.close();
    deferred.resolve({
      error: false,
      message: "document updated",
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

export {changeStatus, deleteDocument, updateDocument, search};
