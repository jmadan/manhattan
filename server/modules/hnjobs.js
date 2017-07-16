let docDB = require('./docDB');
let cheerio = require('cheerio');
let request = require('request');
let natural = require('./natural');
let fetch = require('isomorphic-fetch');
let Q = require('q');

const MongoClient = require('mongodb').MongoClient;

let dbURI = process.env.MONGODB_URI;

// gets the article body and moves it to 'feed' collection and deletes it to 'hn_feed' collection
let getUrlBody = (doc) => {
  console.log(doc);
  if(doc.url){
  request(doc.url, (error, response, html) => {
      let $ = cheerio.load(html, {normalizeWhitespace: true});
      // let metaArray = $('meta').toArray();
      // let categories = metaArray.filter((m)=>{
      //   if(m.attribs.name === 'Keywords'){
      //     return m.attribs.content;
      //   }
      //   // return m.attribs.name === 'Keywords' ? m.attribs.content : '';
      // });
      // updateitembody(doc, $('body').text().replace('/\s+/mg','').replace(/[^a-zA-Z ]/g, "").trim(), categories);
      // return {text: $('body').text().replace('/\s+/mg','').replace(/[^a-zA-Z ]/g, "").trim(), cat: categories};
      let docToBeInserted = {
        'hnid': doc.hnid,
        'url': doc.url,
        'title': doc.title,
        'type': doc.type,
        'itembody': $('body').text().replace('/\s+/mg','').replace(/[^a-zA-Z ]/g, "").trim(),
        'tbody': natural.lancasterStem($('body').text().replace('/\s+/mg','').replace(/[^a-zA-Z ]/g, "").trim()),
        'category': '',
        'status': 'unclassified'
      };
      console.log("doc to be Inserted: ", docToBeInserted.hnid);

      MongoClient.connect(dbURI, (err, db)=>{
        db.collection("feed").insertOne(docToBeInserted, (err, records) => {
          db.collection("hn_feed").deleteOne({hnid: records.ops[0].hnid}, (err, result) => {
            console.log("document inserted and deleted :", result.result.ok);
            db.close();
          });
        });
      });

    });}
}

exports.getItemPendingBodyStatus = () => {
  return MongoClient.connect(dbURI, (err, db)=>{
      db.collection("hn_feed").find({status: "pending text"}).limit(1).toArray((err, items) => {
        if(items.length != 0){
          return getUrlBody(items[0]);
        } else {
          console.log("No Items pending at the moment for getting body text.");
        }
        db.close();
      });
    });
}

let insertinitiallist = (docs) => {
  console.log("I am in insertinitialfeed function", docs.length);
  docDB.open().then((db) => {
    return db.collection("hn_feed");
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
  callback(null, {"hnid": id, "url": url, "status": "new"});
}

let getinitialfeedlist = () => {
  let deferred = Q.defer();
  fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty')
  .then((response) => {
    if(response.status > 400){
      throw new Error("Bad response from Server");
    }
    return response.json();
  }).then((feed)=>{
    async.map(feed, geturl, (err, result) => {
      // insertinitiallist(result);
      deferred.resolve(result);
    });
  }).catch((err) => {
    console.log("tempfuncton error: ", err.message);
    deferred.reject(err);
  });
  return deferred.promise;
}

exports.getInitialHNStories = () => {
  getinitialfeedlist().then(insertinitiallist).catch(err => (console.log(err)));
}


let updateitem = (doc) => {
  console.log("I am in updateItem");
  docDB.open().then((db) => {
    return db.collection("hn_feed");
  }).then((mcoll) => {
    if(doc.type === 'story' && doc.url != null){
      return mcoll.updateOne({'hnid': doc.id}, {$set: {status: "pending text", title: doc.title, url: doc.url, type: doc.type}});
    } else {
      return mcoll.deleteOne({'hnid': doc.id});
    }
  }).then((r) => {
    console.log("document updated/deleted: ", r.result.ok);
    docDB.close();
  }).catch((err)=>{
    console.log("Error updating: ", err);
  });
}

exports.createFeed = () => {
  docDB.open().then((db) => {
    return db.collection("hn_feed");
  }).then((mcoll) => {
    return mcoll.find({status: "pending"}).limit(1).toArray();
  }).then((results) => {
    docDB.close();
    results.map((item) => {
      fetch(item.url).then((response)=>{
        if(response.status >= 400){
          throw new Error("Got fucked....");
        }
        return response.json();
      }).then((details) => {
        console.log(details);
        updateitem(details);
      }).catch((err)=>{
        console.log("Error updating: ", err)
      });
    });
  }).catch((err) => {
    console.log("error while getting details: ", err);
  })
}
