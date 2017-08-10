"use strict";

const MongoClient = require("mongodb");
const DBURI = process.env.MONGODB_URI;

let insertDocuments = (coll, docs) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      if(err){reject(err);}
      db.collection(coll).insertMany(docs, (err, result) => {
        db.close();
        if(err){reject(err)}
        resolve(result);
      });
    });
  });
}

let updateDocument = (coll, query) => {
  console.log(query);
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      if(err){reject(err);}
      db.collection(coll).updateOne(query, (err, result) => {
        db.close();
        if(err){reject(err)}
        resolve(result);
      });
    });
  });
}

let test = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=>{
      if(err){reject(err);}
      db.collection("wordbag").
      updateOne({"category":"Writers Block"},{$set:{"stemwords":["skip","main","cont","advert","clos","search","chronic","hom","new","facul","stud","admin","lead","govern","glob","technolog","peopl","gazet","fin","research","admit","aid","athlet","publ","commun","colleg","gradu","opin","review","com","book","let","crossword","dat","almanac","high","educ","sal","titl","ix","investig","ide","lab","foc","collect","adv","job","employ","seek","spec","report","cur","issu","arch","forum","video","interview","blog","tick","lingu","franc","profhack","camp","viewpoint","academ","priv","policy","agr","copyright"]}},{upsert: true}, (err, result) => {
        db.close();
        if(err){reject(err)}
        resolve(result);
      });
    });
  });
}

module.exports = {insertDocuments, updateDocument, test}
