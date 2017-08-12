"use strict";

const synaptic = require('synaptic');
// const MongoClient = require('mongodb').MongoClient;
const MongoDB = require('../mongodb');



let fetchRawTrainingData = async() => {
  return await MongoDB.getDocuments("feeditems", {status:'classified'}).then((docs) => {
    return docs;
  });
}

let convertRawToTrainingData = async() => {
  let data = await fetchRawTrainingData();
  let tdata = [];
  await data.map((d) => {
    tdata.push({input: d.stemwords,output: d.category});
  });
  return tdata;
}


module.exports = {fetchRawTrainingData, convertRawToTrainingData}
