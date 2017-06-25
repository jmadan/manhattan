let fetch = require('isomorphic-fetch');
let docDB = require('./docDB');
let async = require('async');
let cheerio = require('cheerio');
let request = require('request');

let updateitembody = (doc, docBody) => {
  // console.log(doc);
  docDB.open().then((db) => {
    return db.collection("hnfeed_initial");
  }).then((mcoll) => {
    return mcoll.updateOne({'hnid': doc.hnid}, {$set: {status: "complete", itembody: docBody}});
  }).then((r) => {
    docDB.close();
    console.log("document update: ", r.modifiedCount);
  }).catch((err)=>{
    console.log("Error updating: ", err);
  });
}

let updateitem = (doc) => {
  docDB.open().then((db) => {
    return db.collection("hnfeed_initial");
  }).then((mcoll) => {
    if(doc.type == 'story'){
      return mcoll.updateOne({'hnid': doc.id}, {$set: {status: "getBody", title: doc.title, url: doc.url, type: doc.type}});
    } else {
      return mcoll.updateOne({'hnid': doc.id}, {$set: {type: doc.type}});
    }
  }).then((r) => {
    console.log("document update: ", r.modifiedCount);
  }).catch((err)=>{
    console.log("Error updating: ", err);
  });
}
exports.gettext = (item) => {
  docDB.open().then((db) => {
    return db.collection("hnfeed_initial");
  }).then((mcoll) => {
    return mcoll.find({status: "getBody"}).limit(10).toArray();
  }).then((docs) => {
    docDB.close();
    docs.map((doc) => {
      request(doc.url, (error, response, html) => {
        let $ = cheerio.load(html, {normalizeWhitespace: true});
        updateitembody(doc, $.text());
      });
    })
  }).catch((err)=>{
    console.log("Error updating: ", err);
  });
}

exports.getfeeditemdetails = () => {
  docDB.open().then((db) => {
    return db.collection("hnfeed_initial");
  }).then((mcoll) => {
    return mcoll.find({status: "pending"}).limit(10).toArray();
  }).then((results) => {
    docDB.close();
    results.map((item) => {
      fetch(item.url).then((response)=>{
        if(response.status >= 400){
          throw new Error("Got fucked....");
        }
        return response.json();
      }).then((details) => {
        updateitem(details);
      }).catch((err)=>{
        console.log("Error updating: ", err)
      });
    });
  }).catch((err) => {
    console.log("error while getting details: ", err);
  })
}

let ifStory = (item, callback) => {
  if(item.type == 'story'){
    callback(null, item);
  };
}

let insertinitiallist = (docs) => {
  console.log("I am in insertinitialfeed function");
  docDB.open().then((db) => {
    return db.collection("hnfeed_initial");
  }).then((mcoll) => {
    // console.log(checkIdExists(mcollection, hnDoc.id));
    return mcoll.insertMany(docs);
  }).then((result) => {
    if(result){
    console.log("result: ", result.result.n);}
    docDB.close();
  }).catch((err) => {
    console.log("insertinitialfeed error :", err);
  });
}

let geturl = (id, callback) => {
  let url = "https://hacker-news.firebaseio.com/v0/item/number.json?print=pretty".replace("number", id);
  callback(null, {"hnid": id, "url": url, "status": "pending"});
}

exports.getinitialfeedlist = () => {
  fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty')
  .then((response) => {
    if(response.status > 400){
      throw new Error("Bad response from Server");
    }
    return response.json();
  }).then((feed)=>{
    async.map(feed, geturl, (err, result) => {
      insertinitiallist(result);
    });
  }).catch((err) => {
    console.log("tempfuncton error: ", err.message);
  });
}
