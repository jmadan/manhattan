'use strict';
const rp = require('request-promise');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;
const natural = require('natural');

const lancasterStemmer = natural.LancasterStemmer;

const DBURI = process.env.MONGODB_URI;

let getFeedProviders = () => {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(DBURI,(err, db)=>{
      if(err){
        reject(err);
      }
      db.collection("feedproviders").find().toArray((err, providerList)=>{
        db.close();
        if(err){reject(err);}
        resolve({list: providerList});
      });
    });
  });
}

let getFeedItems = (url) => {
  let feedList = [];
  return new Promise((resolve, reject) =>{
    rp(url)
    .then((res)=>{
      let $ = cheerio.load(res,{withDomLvl1: true, normalizeWhitespace: true, xmlMode: true, decodeEntities: true});
      $("item").each(function() {
        feedList.push({
          title: $(this).find('title').text(),
          url: $(this).find('link').text(),
          status: "pending body",
          type: "story",
          timestamp: Date.parse($(this).find('pubDate').text())/1000
        });
      });
      console.log(feedList);
      resolve(feedList);
    })
    .catch(err => reject(err));
  });
}

let insertFeed = (items)=>{
  return new Promise(function (resolve, reject) {
    MongoClient.connect(MongoDB_URI, (err, db) => {
      if(err){
        reject(err);
      } else {
        db.collection("feed").insertMany(items, (err, result) => {
          db.close();
          if(err){reject(err);}
          resolve(result);
        });
      }
    });
  });
}

let feedJob = async () => {
  let itemsArray =[];
  let providerList = await getFeedProviders();
  await Promise.all(
    providerList.list.map((f) => {
      let feedItems = getFeedItems(f.url);
      itemsArray.push(feedItems);
    })
  );
  insertFeed(itemsArray);
}

let getItemsPendingDetails = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=> {
      if(err){
        reject(err)
      } else {
        db.collection("feed").find({status: "pending body"}).limit(10).toArray((err, docs)=>{
          db.close();
          if(err){
            reject(err);
          }
          resolve(docs);
        })
      }
    })
  });
}

let getItemBody = (item) => {
  return rp(item.url).then((response) => {
    let $ = cheerio.load(response);
    item.stemwords = lancasterStemmer.tokenizeAndStem($('body').text().replace('/\s+/mg','').replace(/[^a-zA-Z ]/g, "").trim());
    item.status = "unclassified";
    return item;
  });
}

let updateAndMoveFeedItem = (item)=>{
  return new Promise(function (resolve, reject) {
    MongoClient.connect(DBURI, (err, db) => {
      if(err){
        reject(err);
      } else {
        db.collection("feeditems").insertOne(
          {
            url: item.url,
            title: item.title,
            type: item.type,
            keywords: item.keywords,
            stemwords: item.stemwords,
            status: 'unclassified'
          }, (err, result) => {
          if(err){
            reject(err);
          } else {
            db.collection("feed").deleteOne({"_id": ObjectId(item._id)}, (err, response) => {
              db.close();
              if(err){reject(err)}
              resolve(response);
            });
          }
        });
      }
    });
  });
}

let getItemDetails = async() => {
  let itemArray = [];
  let items = await getItemsPendingDetails();
  let stemmedItem = await Promise.all(
    items.map((item) => {
      return getItemBody(item);
    }));
  await Promise.all(stemmedItem.map((doc) => {
    updateAndMoveFeedItem(doc).then((response => console.log("deleted Response", response.result.n)));
  }));
}
module.exports = {feedJob, getItemDetails};
