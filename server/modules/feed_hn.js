'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const cheerio = require('cheerio');
const natural = require('./natural');
const fetch = require('isomorphic-fetch');
const MongoClient = require('mongodb').MongoClient;

const HN_NewStoriesURL = 'https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty';
const MongoDB_URI = process.env.MONGODB_URI;

exports.HackerNewsInitialFeed = async(() =>{
    let newestStoriesId = await(fetch(HN_NewStoriesURL).then(res => res.json()));

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
});

let updateItem = (story) => {
  MongoClient.connect(MongoDB_URI, (err, db) => {
    if(err){
      console.log("MongoDB connection error: ", err);
    } else {
      db.collection("hn_feed").updateOne({'hn_id': story.id}, {$set: {status: "pending body", title: story.title, url: story.url, type: story.type}}, (err, result)=>{
        if(err){
          console.log("error updating the story", story.id, err);
        } else {
          db.close();
          console.log("Story updated", story.id, result.result.ok);
        }
      });
    }
  });
}

let getData = async((data) => {
  let storyList = await(data.map((d) => {
    return (fetch(d.url).then((response) => {
      return response.json();
    }));
  }));

  let filteredStories = storyList.filter((f) => (f.url !== undefined));
  filteredStories.map((story) => {
    updateItem(story)
  });

});

exports.getHackerNewsMetaData = (callback) => {
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
            callback(itemList);
          }
        });
      }
    });
}

// HackerNewsInitialFeed().then((result) => {
//   console.log("Got the Feed and saved it to DB: ", result.length);
// });
