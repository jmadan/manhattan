'use strict';
const rp = require('request-promise');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;
const natural = require('natural');
const textract = require('textract');

const lancasterStemmer = natural.LancasterStemmer;

const DBURI = process.env.MONGODB_URI;

let getRSSFeedProviders = () => {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(DBURI,(err, db)=>{
      if(err){
        reject(err);
      }
      db.collection("feedproviders").find({status: {$in: ['active', 'Active']}}).toArray((err, providerList)=>{
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
      let lastBuildDate = Date.parse($("lastBuildDate").text());
      $("item").each(function() {
        feedList.push({
          title: $(this).find('title').text(),
          url: $(this).find('link').text(),
          description: $(this).find('description').text(),
          img: $(this).find('media\\:thumbnail').attr('url'),
          author: $(this).find('dc\\:creator').text(),
          category: $(this).find('category').map((i, el) => {return $(el).text()}).get().join(', '),
          keywords: $(this).find('media\\:keywords').text(),
          status: "pending body",
          type: "story",
          pubDate: Date.parse($(this).find('pubDate').text()),
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

let getProviderFeed = async(providers) => {
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

let makeRequests = (item) => {
  return new Promise((resolve, reject) => {
    textract.fromUrl(item.url, function( error, text ) {
      item.stemwords = lancasterStemmer.tokenizeAndStem(text);
      item.itembody = text.replace('/\s+/gm',' ').replace('([^a-zA-Z])+', ' ');
        // item.status = "unclassified";
      resolve(item);
    })
  })
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
            description: item.description,
            type: item.type,
            keywords: item.keywords,
            img: item.img,
            author: item.author,
            timestamp: item.timestamp,
            provider: item.provider,
            topic: item.topic,
            category: item.category,
            status: 'unclassified',
            stemwords: item.stemwords
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
  console.log(itemsArray.length);
  return itemsArray;
}

let fetchAndUpdate = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DBURI, (err, db)=> {
      if(err){
        reject(err)
      } else {
        db.collection("feeditems").find({status: "classified"}).toArray((err, docs)=>{
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

let tempUpdate = () =>{
  MongoClient.connect(DBURI, (err, db)=> {
    if(err){
      reject(err)
    } else {
      db.collection("feeditems").updateMany({status: "classified"}, {$set:{status: "unclassified"}}, (err, r)=>{
        db.close();
        if(err){
          console.log(err)
        }
        console.log(r);
      })
    }
  })
}

module.exports = {
  makeRequests,
  getProviderFeed,
  getFeedItems,
  getRSSFeedProviders,
  saveRssFeed,
  fetchItemsWithStatusPendingBody,
  fetchContents,
  updateAndMoveFeedItem,
  fetchAndUpdate
};
