const synaptic = require('synaptic');
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

let createSynapticServer = async () => {
  const Network = synaptic.Network;
  console.log('Starting Classification Process...');
  const Trainer = synaptic.Trainer;
  let result = await Promise.all([
    Redis.getRedis('numberOfCategories'),
    Redis.getRedis('dictionary'),
    article.fetchArticles('classified'),
    Redis.getRedis('categoryMap')
  ]);
  let numberOfCategories = result[0];
  let classifiedDocs = result[2];
  let dictionary = result[1];
  let categoryMap = result[3];

  let tData = await trainingdata.formattedData(classifiedDocs, dictionary);

  const Layer = synaptic.Layer;

  const inputLayer = new Layer(500);
  const hiddenLayer = new Layer(260);
  const outputLayer = new Layer(25);

  inputLayer.project(hiddenLayer);
  hiddenLayer.project(outputLayer);

  let myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
  });

  console.log('Got all moving parts...');

  let trainData = tData.map(pair => {
    return {
      input: pair.input,
      output: vec_result(categoryMap[pair.output], numberOfCategories)
    };
  });

  console.log('trainingData created...');
  let trainer = new Trainer(myNetwork);

  return new Promise((resolve, reject) => {
    trainer.train(trainData, {
      rate: 0.3,
      iterations: 10000,
      error: 0.03,
      shuffle: true,
      cost: Trainer.cost.CROSS_ENTROPY,
      schedule: {
        every: 1000, // repeat this task every 500 iterations
        do: function(data) {
          // custom log
          console.log('error', data.error, 'iterations', data.iterations, 'rate', data.rate);
          if (data.iterations == 10000) {
            resolve(myNetwork);
          }
        }
      }
    });
  });
};

let getSynapticBrain = async () => {
  const Network = synaptic.Network;
  let myNetwork = await Redis.getRedis('SynapticBrain');
  return !myNetwork ? null : Network.fromJSON(myNetwork);
};

let synapticClassify = async doc => {
  const Network = synaptic.Network;
  let myNetwork = await getSynapticBrain();
  let dictionary = await Redis.getRedis('dictionary');
  let categoryMap = await Redis.getRedis('categoryMap');
  let categoryArray = Object.keys(categoryMap);
  let testDoc = trainingdata.convertToVector(doc, dictionary);
  return new Promise((resolve, reject) => {
    if (!myNetwork) {
      createSynapticServer().then(NW => {
        Redis.setRedis('SynapticBrain', JSON.stringify(NW.toJSON()));
        console.log('I have what I need..... 4');
        doc.category = categoryArray[maxarg(NW.activate(testDoc))];
        resolve(doc);
      });
    } else {
      doc.category = categoryArray[maxarg(myNetwork.activate(testDoc))];
      doc.status = 'review';
      resolve(doc);
    }
  });
};

module.exports = {
  createSynapticServer,
  synapticClassify
};
