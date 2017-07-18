let docDB = require('./docDB');
let Q = require('q');

let getdocuments = (noofdocs, category) => {
  let deferred = Q.defer();
  if(!noofdocs){
    noofdocs = 1;
  }
  docDB.open().then((db) => {
    return db.collection("feed");
  }).then((collection) => {
    return collection.find({'status': 'unclassified'}).limit(parseInt(noofdocs)).toArray();
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

let getdocument = (id) => {
  let deferred = Q.defer();
  docDB.open().then((db) => {
    return db.collection("feed");
  })
  .then((collection) => {
    return collection.find({hnid: parseInt(id)}).limit(1).toArray();
  })
  .then((docs) => {
    docDB.close();
    deferred.resolve({
      error: false,
      list: docs
    });
  }).catch((err) => {
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}

let updatedocument = (hnid, category) => {
  let deferred = Q.defer();
  docDB.open().then((db) =>{
    return db.collection('feed');
  }).then((coll) => {
    return coll.updateOne({hnid: parseInt(hnid)}, {$set: {category: category, status: 'classified'}});
  }).then((result)=>{
    docDB.close();
    deferred.resolve({
      error: false,
      message: "document updated",
      docID: hnid
    });
  }).catch((err) =>{
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}

let deletedocument = (hnid) => {
  let deferred = Q.defer();
  docDB.open().then((db) =>{
    return db.collection('feed');
  }).then((coll) => {
    return coll.deleteOne({hnid: parseInt(hnid)});
  }).then((result)=>{
    docDB.close();
    deferred.resolve({
      error: false,
      message: "document with ID "+ hnid +" deleted",
      docID: hnid
    });
  }).catch((err) =>{
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}

export {getdocument, getdocuments, updatedocument, deletedocument}
