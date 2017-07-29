'use strict';

// const async = require('asyncawait/async');
// const __await = require('asyncawait/await');
const cheerio = require('cheerio');
const natural = require('./natural');
const request = require('request');
const fetch = require('isomorphic-fetch');
const MongoClient = require('mongodb').MongoClient;

const HN_NewStoriesURL = 'https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty';
const MongoDB_URI = process.env.MONGODB_URI;

exports.HackerNewsInitialFeed = async() =>{
    let newestStoriesId = __await(fetch(HN_NewStoriesURL).then(res => res.json()));

    let newStoriesDetail = newestStoriesId.map(ns => (
      {
        hn_id: ns,
        url: 'https://hacker-news.firebaseio.com/v0/item/'+ ns +'.json?print=pretty',
        status: 'new'
      }));

    MongoClient.connect(MongoDB_URI, (err, db) => {
      if(err){
        console.log("MongoDB connection error: ", err);
      } else {
        db.collection("hn_feed").insertMany(newStoriesDetail, (err, result) => {
          if(err)
          {
            console.log("Error while inserting many IDs: ", err);
          } else {
            db.close();
            return result.result.n;
          }
        });
      }
    });
}

let updateItem = (story) => {
  MongoClient.connect(MongoDB_URI, (err, db) => {
    if(err){
      console.log("MongoDB connection error: ", err);
    } else {
      db.collection("hn_feed").updateOne({'hn_id': story.hn_id}, {$set: {status: "pending body", title: story.title, url: story.url, type: story.type}}, (err, result)=>{
        if(err){
          console.log("error updating the story", story.hn_id, err);
        } else {
          db.close();
          console.log("Story updated", story.hn_id, result.result.ok);
        }
      });
    }
  });
}

let getData = async(data) => {
  let storyList = await(data.map((d) => {
    return fetch(d.url)
    .then((response) => {return response.json();}).catch(err => console.log(err));
  }));
  // let filteredStories = storyList.filter((f) => (f.url !== undefined));
  storyList.map((story) => {
    updateItem(story)
  });

}

exports.getHackerNewsMetaData = () => {
    MongoClient.connect(MongoDB_URI, (err, db) => {
      if(err){
        console.log("MongoDB connection error: ", err);
      } else {
        db.collection("hn_feed").find({status: "new"}).limit(10).toArray((err, itemList) => {
          db.close();
          if(err)
          {
            console.log("Error while selecting batch of 10 : ", err);
          } else {
            db.close();
            getData(itemList);
          }
        });
      }
    });
}

let getMetaKeywords = (html) => {
  let $ = cheerio.load(html);
  let metaArray = $('meta').toArray();
  let keywords = metaArray.filter((m)=>{
      if(m.attribs.name === 'keywords'){
        return m;
      }
  });
  if(keywords.length > 0){
    return keywords[0].attribs.content;
  } else {
    return "";
  }
}

let getBodyText = (html) => {
  let $ = cheerio.load(html, {normalizeWhitespace: true});
  return $('body').text().replace('/\s+/mg','').replace(/[^a-zA-Z ]/g, "").trim();
}

let deleteItem = (item) => {
  MongoClient.connect(MongoDB_URI, (err, db) => {
    if(err){
      console.log("MongoDB connection error: ", err);
    } else {
      db.collection("hn_feed").deleteOne({hn_id: item.hn_id}, (err, result)=>{
        if(err){
          console.log("Error deleting in Feed collection: ", item.hn_id, err);
        }
      });
    }
  });
}

let fetchItemBody = (itemList) => {
  itemList.map((item) => {
    if(item.url){
      request(item.url, (err, response, body) => {
        if(err){
          console.log("Error while getting the body: ", err);
        }
        let bodyText = getBodyText(body);
        let keywords = getMetaKeywords(body);
        // console.log('body Text : ', bodyText);

        updateFeedItem({
          hn_id: item.hn_id,
          url: item.url,
          title: item.title,
          type: item.type,
          itembody: bodyText,
          keywords: keywords,
          stemmed: natural.lancasterStem(bodyText),
          status: 'unclassified'
        });
      });
    } else {
      deleteItem(item);
    }
  });
}

let updateFeedItem = (item) => {
  MongoClient.connect(MongoDB_URI, (err, db) => {
    if(err){
      console.log("MongoDB connection error: ", err);
    } else {
      db.collection("feed").insertOne(item, (err, result)=>{
        if(err){
          console.log("Error inserting in Feed collection: ", item.hn_id, err);
        } else {
          db.collection("hn_feed").deleteOne({hn_id: result.ops[0].hn_id}, (err, data) => {
            console.log("document inserted and deleted :", result.result.ok);
            db.close();
            console.log("Story inserted", item.hn_id, result.insertedId);
          });
        }
      });
    }
  });
}

exports.getFeedBatch = (mcoll, status, listLimit) => {
  MongoClient.connect(MongoDB_URI, (err, db) => {
    if(err){
      console.log("MongoDB connection error: ", err);
    } else {
      db.collection(mcoll).find({status: status}).limit(parseInt(listLimit)).toArray((err, itemList) => {
        db.close();
        if(err)
        {
          console.log("Error while selecting batch of 10 : ", err);
        } else {
          db.close();
          fetchItemBody(itemList);
        }
      });
    }
  });
}
