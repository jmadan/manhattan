"use strict";

const nbayes = require('nbayes');
const natural = require('natural');
const tdata = require('./trainingdata');
const mongodb = require('../mongodb');

const CLASSIFIER = nbayes();
var naturalClassifier = new natural.BayesClassifier();

let naturalBayes = (stemwords) => {
  tdata.convertRawToTrainingData().then((data) => {
    data.map((d) => {
      console.log(d.output)
      naturalClassifier.addDocument(String(d.input), d.output);
    });
    setTimeout(function(){
      console.log("executed");
      naturalClassifier.train();
      console.log(naturalClassifier.classify('this isa test and fullstack'));
    }, 20000);

    naturalClassifier.events.on('trainedWithDocument', function (obj) {
      console.log(obj.index);
       /* {
       *   total: 23 // There are 23 total documents being trained against
       *   index: 12 // The index/number of the document that's just been trained against
       *   doc: {...} // The document that has just been indexed
       *  }
       */
    });
  })
}


let trainBayes = (stemwords) => {
  tdata.convertRawToTrainingData().then((data) => {
    data.map((d) => {
      console.log(d.output)
      CLASSIFIER.learn(d.output, nbayes.stringToDoc(d.input));
    });
    setTimeout(function(){
      console.log("executed");
      CLASSIFIER.probabilities(nbayes.stringToDoc(String(stemwords)));
    }, 20000);
  })
}

let bayesClassify = () => {
  let query = {};
  query["status"] = "unclassified";
  mongodb.getDocuments("feeditems", query).then(docs => {
    console.log(docs[7].url);
    naturalBayes(docs[7].stemmed);

  });
}

module.exports = { trainBayes, bayesClassify }
