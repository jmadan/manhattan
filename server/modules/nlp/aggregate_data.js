"use strict"

const MongoClient = require('mongodb').MongoClient;
const DBURI = process.env.MONGODB_URI;
const Mongo = require('../mongodb');



let groupStemWordsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if(err){reject(err);}

      db.collection("feeditems").aggregate([
        { $match: { "category": category } },
        {$group:{_id:"$category", count: {$sum: 1}, stemwords:{"$addToSet": "$stemwords"}}}], function(err, docs){
        docs.map((d) => {
          let query = "{category:"+d._id+"},{$set:{stemwords:"+d.stemwords+"}}";
          // Mongo.updateDocument("wordbag","{category:"++"}")
          console.log(query);
        })
      });
    });
  });
}

let groupStemWordsByCategories = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db) => {
      if(err){reject(err);}

      db.collection("feeditems").aggregate([
        {$group:{_id:"$category", count: {$sum: 1}, stemwords:{"$addToSet": "$stemwords"}}}], function(err, docs){
        Promise.all(docs.map((d) => {
          if(d._id && d.stemwords.length > 0){
        //     // console.log(JSON.stringify(d._id),"********",JSON.stringify(d.stemwords[0]));}
            MongoClient.connect(DBURI, (err, db) => {
              db.collection("wordbag").
              updateOne({category: JSON.stringify(d._id)},{$set:{stemwords: JSON.stringify(d.stemwords[0])}},{upsert: true}, (err, result) =>{
                db.close();
                console.log(result.result.n);
              })
            })
          }
        }));
      });
    });
  });
}

module.exports = {groupStemWordsByCategory, groupStemWordsByCategories}
