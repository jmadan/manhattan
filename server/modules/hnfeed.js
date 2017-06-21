let fetch = require('isomorphic-fetch');
let docDB = require('./docDB');

let checkIdExists = (mcollection, id) => {
  docDB.open().then((db) => {
    return db.collection(mcollection);
  }).then((mcoll) => {
    return mcoll.find({id: id}).toArray();
  }).then((doc) => {
    docDB.close();
    if(doc.length > 0) {
      return true;
    }
  }).catch((err) => {
    console.log("error: ", err);
  })
}

let inserthnids = function(mcollection, hnDoc) {
  docDB.open().then((db) => {
    return db.collection(mcollection);
  }).then((mcoll) => {
    // console.log(checkIdExists(mcollection, hnDoc.id));
    return mcoll.insertOne(hnDoc);
  }).then((result) => {
    if(result){
    console.log("result: ", result.result.n);}
    docDB.close();
  }).catch((err) => {
    console.log("error: ", err);
  })
}

exports.getFeed = () => {
  fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty')
  .then((response) => {
    if(response.status > 400){
      throw new Error("Bad response from Server");
    }
    return response.json();
  }).then((feed)=>{
    feed.map((id)=>{
      inserthnids("hnfeed_initial", {"id": id, "status": "pending"});
    });
  }).catch((err) => {
    console.log(err.message);
  });
}

exports.getIdDetails = () => {
  docDB.open().then((db) => {
    return db.collection("hnfeed_initial");
  }).then((mcoll) => {
    return mcoll.find({status: "pending"}).limit(10).toArray();
  }).then((results) => {
    results.map((item) => {
      let url = "https://hacker-news.firebaseio.com/v0/item/number.json?print=pretty".replace("number", item.id);
      fetch(url).then((response)=>{
        if(response.status >= 400){
          throw new Error("Got fucked");
        }
        return response.json();
      }).then((details) => {
        console.log(details);
      });
    });
  }).catch((err) => {
    console.log("error while getting details: ", err);
  })
}
