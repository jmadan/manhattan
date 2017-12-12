'use strict';

const MongoDB = require('../mongodb');
const MongoClient = require('mongodb');
const DBURI = process.env.MONGODB_URI;
const mimir = require('./mimir');
const category = require('../category');

let formattedData = (docs, dict) => {
  let tdata = [];
  docs.map(d => {
    tdata.push({ input: mimir.bow(d.stemwords.toString(), dict), output: d.category });
  });
  return tdata;
};

let createDict = docs => {
  let dict = docs.reduce((prev, curr) => {
    return prev.concat(curr.stemwords);
  }, []);
  return mimir.dict(dict.toString());
};

let convertToVector = (doc, dict) => {
  console.log('doc id: ', doc._id);
  return mimir.bow(doc.stemwords.toString(), dict);
};

let getCategoryMap = async () => {
  let categoryMap = {};
  await category.getDistinctCategories().then(items => {
    items.forEach((item, i) => {
      categoryMap[item] = i;
    });
  });

  return categoryMap;
};

module.exports = { formattedData, createDict, convertToVector, getCategoryMap };
