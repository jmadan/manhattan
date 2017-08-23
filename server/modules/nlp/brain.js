"use strict"

const brain = require('brain');
let data = require('./trainingdata');
let net = new brain.NeuralNetwork();


let letsrunit = async() => {
  let globalDictionary = await data.createDict();
  // let tData = await data.trainingData();
  // let brainData = [];
  // tData.map((t)=>{
  //   brainData.push([mimir.bow(t.stemwords, globalDictionary), t.category]);
  // })
  //
  // console.log(brainData);
}

letsrunit();
