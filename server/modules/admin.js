let docDB = require('./docDB');
let Q = require('q');

exports.getalldocuments = (noofdocs) => {
  let deferred = Q.defer();
  if(!noofdocs){
    noofdocs = 1;
  }
  docDB.close();
  docDB.open()
  .then((db) => {
    return db.collection("hnfeed_initial");
  })
  .then((collection) => {
    return collection.find({status: "classification pending"}).limit(noofdocs).toArray();
  })
  .then((docs) => {
    docDB.close();
    deferred.resolve({
      error: false,
      article_list: docs
    });
  }).catch((err)=>{
    deferred.reject({
      message: err,
      error: true
    });
  });
  return deferred.promise;
}

exports.getdocument = (id) => {
  let deferred = Q.defer();
  docDB.close();
  docDB.open().then((db) => {
    return db.collection("hnfeed_initial");
  })
  .then((collection) => {
    return collection.find({hnid: parseInt(id)}).limit(1).toArray();
  })
  .then((docs) => {
    docDB.close();
    deferred.resolve({
      error: false,
      article_list: docs
    });
  }).catch((err) => {
    deferred.reject({
      error: true,
      message: err
    });
  });
  return deferred.promise;
}
