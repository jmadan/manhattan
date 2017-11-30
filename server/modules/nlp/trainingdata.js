'use strict';

// const synaptic = require('synaptic');
const MongoDB = require('../mongodb');
const MongoClient = require('mongodb');
const DBURI = process.env.MONGODB_URI;
const mimir = require('./mimir');
const category = require('../category');

// let fetchDocs = async() => {
//   return await MongoDB.getDocuments("feeditems", {status:'classified'}).then((docs) => {
//     return docs;
//   }).catch(err=>console.log(err));
// }

let formattedData = async (docs, dict) => {
  let tdata = [];
  await docs.map(d => {
    tdata.push({ input: mimir.bow(d.stemwords.toString(), dict), output: d.category });
  });
  return tdata;
};

let createDict = async docs => {
  let dict = docs.reduce((prev, curr) => {
    return prev.concat(curr.stemwords);
  }, []);
  return mimir.dict(dict.toString());
};

let convertToVector = async (doc, dict) => {
  return await mimir.bow(doc.stemwords.toString(), dict);
};

let getCategoryMap = async () => {
  let categoryMap = {};
  await category.getDistinctCategories().then(items => {
    items.forEach((item, i) => {
      // console.log(item);
      // if(item){
      categoryMap[item] = i;
      // }
    });
  });
  return categoryMap;
};

module.exports = { formattedData, createDict, convertToVector, getCategoryMap };
