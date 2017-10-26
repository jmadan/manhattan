const synaptic = require("synaptic");
const trainingdata = require('./trainingdata');
const article = require('../article');
const Redis = require('../../utils/redis');

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

let createDictionary = async () => {
    let docs = await trainingdata.fetchDocs();
    return await trainingdata.createDict(docs);
};

let synapticBrain = async () => {
    let distinctCategories = 67;
    let docs = await trainingdata.fetchDocs();
    let dictionary = await trainingdata.createDict(docs);
    let tData = await trainingdata.formattedData(docs, dictionary);

    let categoryMap = await trainingdata.getCategoryMap();
    let categoryArray = Object.keys(categoryMap);
    // console.log(categoryMap[tData[0].output]);
    // vec_result(tData[0].output, distinctCategories);
    // console.log(vec_result(tData[0].output, distinctCategories));

    return tData.map((pair) => {
        return {
          input: pair.input,
          output: vec_result(categoryMap[pair.output], distinctCategories)
        };
    });
}

let synapticSun = async () => {
    const Layer = synaptic.Layer;
    const Network = synaptic.Network;
    const Trainer = synaptic.Trainer;

    const inputLayer = new Layer(100);
    const hiddenLayer = new Layer(10);
    const outputLayer = new Layer(3);

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    const myNetwork = new Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });

    const trainer = new Trainer(myNetwork);

    let distinctCategories = 67;
    let docs = await trainingdata.fetchDocs();
    let dictionary = await trainingdata.createDict(docs);
    let tData = await trainingdata.formattedData(docs, dictionary);

    let categoryMap = await trainingdata.getCategoryMap();
    let categoryArray = Object.keys(categoryMap);

    let trainData = tData.map((pair) => {
        return {
          input: pair.input,
          output: vec_result(categoryMap[pair.output], distinctCategories)
        };
    });

    trainer.train(trainData, {
        rate: .2,
        iterations: 70,
        error: .1,
        shuffle: true,
        log: 100,
        cost: Trainer.cost.CROSS_ENTROPY
    });

    article.fetchArticles("unclassified").then(async(results) => {
      let testDoc = await trainingdata.convertToVector(results[0], dictionary);
      console.log(myNetwork.activate(testDoc));
      console.log(categoryArray[maxarg(myNetwork.activate(testDoc))]);
    });
}

let synapticClassify = async (doc) => {
    console.log("Starting Classification Process...");
    const Trainer = synaptic.Trainer;
    let numberOfCategories = await Redis.getRedis('numberOfCategories');
    let classifiedDocs = await article.fetchArticles('classified');
    let dictionary = await Redis.getRedis('dictionary');
    let myNetwork = synaptic.Network.fromJSON(await Redis.getRedis('NeuralNetwork'));
    // let categoryMap = await trainingdata.getCategoryMap();
    let categoryMap = await Redis.getRedis('categoryMap');
    let categoryArray = Object.keys(categoryMap);

    let tData = await trainingdata.formattedData(classifiedDocs, dictionary);

    console.log("Got all moving parts...");
    const trainer = new Trainer(myNetwork);

    let trainData = tData.map((pair) => {
        return {
          input: pair.input,
          output: vec_result(categoryMap[pair.output], numberOfCategories)
        };
    });

    console.log("trainingData created...");

    trainer.train(trainData, {
        rate: .3,
        iterations: 1000,
        error: .1,
        shuffle: true,
        cost: Trainer.cost.CROSS_ENTROPY
    });
    // train the network
    //   var learningRate = .2;
    //   for (var i = 0; i < 200; i++)
    //   {
    //     trainData.map((ts) => {
    //       myNetwork.activate(ts.input);
    //       myNetwork.propagate(learningRate, ts.output);
    //     });
    //   }

    console.log("training Done!!!!");

    return trainingdata.convertToVector(doc, dictionary).then((testDoc) => {
      // myNetwork.activate(testDoc);
      console.log("test doc created");
    //   console.log(myNetwork.activate(testDoc));
      doc.category = categoryArray[maxarg(myNetwork.activate(testDoc))];
      // console.log("classified doc: ", doc.category);
      return doc;
    });

    // article.fetchArticles("unclassified").then(async(results) => {
    //   let testDoc = await trainingdata.convertToVector(results[0], dictionary);
    // //   console.log(myNetwork.activate(testDoc));
    //   console.log(categoryArray[maxarg(myNetwork.activate(testDoc))]);
    // });

}

module.exports = {
    synapticSun,
    synapticClassify
}
