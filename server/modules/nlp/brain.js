"use strict"

const brain = require('brain');
const Redis = require('../../utils/redis');
const article = require('../article');
const trainingdata = require('./trainingdata');

function vec_result(res, num_classes) {
  var i = 0,
  vec = [];
  for (i; i < num_classes; i += 1) {
    vec.push(0);
  }
  vec[res] = 1;
  return vec;
}

function maxarg(array) {
  return array.indexOf(Math.max.apply(Math, array));
}

// let createBrain = async () => {
//   let distinctCategories = 68;
//   let docs = await trainingdata.fetchDocs();
//   let dictionary = await trainingdata.createDict(docs);
//   let tData = await trainingdata.formattedData(docs, dictionary);

//   let categoryMap = await trainingdata.getCategoryMap();
//   let categoryArray = Object.keys(categoryMap);

//   let ann_train = tData.map(function (pair) {
//     return {
//       input: pair[0],
//       output: vec_result(pair[1], distinctCategories)
//     };
//   });
//   net.train(ann_train, {
//     errorThresh: 0.003,  // error threshold to reach
//     iterations: 100000,   // maximum training iterations
//     log: true,           // console.log() progress periodically
//     logPeriod: 10000,       // number of iterations between logging
//     learningRate: 0.3    // learning rate
//   });
//   let jsonBrain = net.toJSON();

//   //Now save it to Store for suture use

// };

// let letsrunit = async(doc) => {
//   let docs = await trainingdata.fetchDocs();
//   let dictionary = await trainingdata.createDict(docs);
//   let tData = await trainingdata.formattedData(docs, dictionary);

//   let categoryMap = await trainingdata.getCategoryMap();
//   let categoryArray = Object.keys(categoryMap);

//   let ann_train = tData.map(function (pair) {
//     return {
//       input: pair[0],
//       output: vec_result(pair[1], 71)
//     };
//   });
//   net.train(ann_train, {
//   errorThresh: 0.003,  // error threshold to reach
//   iterations: 100000,   // maximum training iterations
//   log: true,           // console.log() progress periodically
//   logPeriod: 10000,       // number of iterations between logging
//   learningRate: 0.3    // learning rate
// });

//   let predict = net.run(trainingdata.convertToVector(doc, dictionary));

//   return (categoryArray[maxarg(predict)]);
// }

module.exports = {
  brainClassify: async (doc) => {
    console.log("Starting Brain Classification Process...");
    let numberOfCategories = await Redis.getRedis('numberOfCategories');
    let classifiedDocs = await article.fetchArticles('classified');
    let dictionary = await Redis.getRedis('dictionary');
    let categoryMap = await Redis.getRedis('categoryMap');
    let categoryArray = Object.keys(categoryMap);
    let tData = await trainingdata.formattedData(classifiedDocs, dictionary);
    console.log("Got all moving parts...");

    let net = new brain.NeuralNetwork();

    let trainData = tData.map((pair) => {
        return {
          input: pair.input,
          output: vec_result(categoryMap[pair.output], numberOfCategories)
        };
    });

    net.train(trainData, {
      errorThresh: 0.003,  // error threshold to reach
      iterations: 100,   // maximum training iterations
      log: true,           // console.log() progress periodically
      logPeriod: 10,       // number of iterations between logging
      learningRate: 0.05    // learning rate
    });

    return trainingdata.convertToVector(doc, dictionary).then((res)=>{
      let predict = net.run(res);
      console.log('predict :', predict);
      return (categoryArray[maxarg(predict)]);
    });
  }
}
