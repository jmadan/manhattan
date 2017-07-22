let docDB = require('./docDB');
let Q = require('q');

let getdocuments = (noofdocs, category) => {
  let article_status = category === true ? 'classified' : 'unclassified';
  let deferred = Q.defer();
  if(!noofdocs){
    noofdocs = 1;
  }
  docDB.open().then((db) => {
    return db.collection("feed");
  }).then((collection) => {
    return collection.find({'status': article_status}).limit(parseInt(noofdocs)).toArray();
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
    return collection.find({hn_id: parseInt(id)}).limit(1).toArray();
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

export {getdocument, getdocuments}
