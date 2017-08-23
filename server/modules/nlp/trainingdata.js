"use strict";

const synaptic = require('synaptic');
const MongoDB = require('../mongodb');
const MongoClient = require("mongodb");
const DBURI = process.env.MONGODB_URI;
const mimir = require('./mimir');

let fetchRawTrainingData = async() => {
  return await MongoDB.getDocuments("feeditems", {status:'classified'}).then((docs) => {
    return docs;
  }).catch(err=>console.log(err));
}

let trainingData = async() => {
  let docs = await fetchRawTrainingData();
  let tdata = [];
  await data.map((d) => {
    tdata.push({input: mimir.dict(d.stemwords),output: d.category});
  });
  return tdata;
}

let createDict = async() => {
  let data = await fetchRawTrainingData();
  let dict = data.reduce((prev, curr) => {
    return prev.concat(curr.stemwords);
  }, []);
  return mimir.dict(dict.toString());
}

module.exports = {fetchRawTrainingData, trainingData, createDict }
