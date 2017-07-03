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
  .then((mcoll) => {
    return mcoll.find({status: "complete"}).limit(noofdocs).toArray();
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
