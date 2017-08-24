"use strict";

const synaptic = require('synaptic');
const MongoDB = require('../mongodb');
const MongoClient = require("mongodb");
const DBURI = process.env.MONGODB_URI;
const mimir = require('./mimir');

let fetchDocs = async() => {
  return await MongoDB.getDocuments("feeditems", {status:'classified'}).then((docs) => {
    return docs;
  }).catch(err=>console.log(err));
}

let formattedData = async(docs, dict) => {
  let tdata = [];
  await docs.map((d) => {
    if(d.stemwords){
      tdata.push({input: mimir.bow(d.stemwords.toString(), dict),output: d.category});
    } else {
      tdata.push({input: mimir.bow(d.stemmed.toString(), dict),output: d.category});
    }
  });
  return tdata;
}

let createDict = async(docs) => {
  let dict = docs.reduce((prev, curr) => {
    if(curr.stemwords){
      return prev.concat(curr.stemwords);
    } else{
      return prev.concat(curr.stemmed);
    }
  }, []);
  return mimir.dict(dict.toString());
}

let convertToVector = async(doc, dict) => {
  return await mimir.bow(doc.stemwords.toString(), dict);
}

module.exports = {fetchDocs, formattedData, createDict, convertToVector }
