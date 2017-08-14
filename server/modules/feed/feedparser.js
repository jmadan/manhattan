'use strict';
const rp = require('request-promise');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;
const natural = require('natural');

const lancasterStemmer = natural.LancasterStemmer;

const DBURI = process.env.MONGODB_URI;

let getRSSFeedProviders = () => {
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

let getFeedItems = (provider) => {
  let feedList = [];
  return new Promise((resolve, reject) =>{
    rp(provider.url)
    .then((res)=>{
      let $ = cheerio.load(res,{withDomLvl1: true, normalizeWhitespace: true, xmlMode: true, decodeEntities: true});
      let lastBuildDate = $("lastBuildDate").text();
      $("item").each(function() {
        feedList.push({
          title: $(this).find('title').text(),
          url: $(this).find('link').text(),
          status: "pending body",
          type: "story",
          timestamp: Date.parse($(this).find('pubDate').text())/1000,
          provider: provider.name,
          topic: provider.topic
        });
      });
      resolve(feedList);
    })
    .catch(err => reject(err));
  });
}

let saveRssFeed = (items)=>{
  return new Promise(function (resolve, reject) {
    MongoClient.connect(DBURI, (err, db) => {
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

async function returnNew (val, index, arr) {
  val["data"] = await getFeedItems(val);
  return val;
}

let getFeedForProviders = async(providers) => {
  let flist = await Promise.all(providers.list.map(returnNew));
  return flist;
}

let fetchItemsWithStatusPendingBody = () => {
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

let makeRequests = async(item) => {
  return await rp(item.url).then((response) => {
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
            timestamp: item.timestamp,
            provider: item.provider,
            topic: item.topic,
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

let fetchContents = async(items) => {
  let itemsArray = await Promise.all(items.map(makeRequests));
  // await Promise.all(stemmedItem.map((doc) => {
  //   updateAndMoveFeedItem(doc).then((response => console.log("deleted Response", response.result.n)));
  // }));
  return itemsArray;
}
module.exports = {getFeedForProviders, getRSSFeedProviders, saveRssFeed, fetchItemsWithStatusPendingBody, fetchContents, updateAndMoveFeedItem};
