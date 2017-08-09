"use strict"

const MongoClient = require('mongodb').MongoClient;
const DBURI = process.env.MONGODB_URI;

let getArticlesBasedOnCategory = (category) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if(err){reject(err);}

      // db.collection("feed").group(['category'],{category: category},{"bagofwords": []}, "function (obj, prev) { prev.bagofwords.push(obj) }", function(err, docs) {
      //    if(!err){ resolve(docs); } else{ reject(err); }
      //  });
      db.collection("feed").aggregate([
        { $match: { "category": category } },
        {$group:{_id:"$category", count: {$sum: 1}, stemwords:{"$addToSet": "$stemwords"}}}], function(err, docs){
        console.log(docs);
      });
    });
  });
}

module.exports = {getArticlesBasedOnCategory}
