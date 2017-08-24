"use strict"

const brain = require('brain');
let trainingdata = require('./trainingdata');
let net = new brain.NeuralNetwork();
const mimir = require('./mimir');
const MongoClient = require('mongodb').MongoClient;
const DBURI = process.env.MONGODB_URI;

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

let letsrunit = async(id) => {
  let docs = await trainingdata.fetchDocs();
  let dictionary = await trainingdata.createDict(docs);
  let tData = await trainingdata.formattedData(docs, dictionary);

  let ann_train = tData.map(function (pair) {
    return {
      input: pair[0],
      output: vec_result(pair[1], 3)
    };
  });
  net.train(ann_train);

  MongoClient.connect(DBURI, (err, db)=>{
    db.collection('feeditems').findOne({"status": "unclassified"},(err, item)=>{
      if(err){
        console.log(err);
      } else{
        console.log(item.url);
        let predict = net.run(trainingdata.convertToVector(item, dictionary));
        console.log(predict);
        console.log([maxarg(predict)]);
      }
    });
  })
}

letsrunit();
