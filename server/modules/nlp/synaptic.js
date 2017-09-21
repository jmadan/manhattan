const synaptic = require("synaptic");
let trainingdata = require('./trainingdata');

function vec_result(res, num_classes) {
  var i = 0,
  vec = [];
  for (i; i < num_classes; i += 1) {
    vec.push(0);
  }
  vec[res] = 1;
  return vec;
}

function synapticBrain(){
  let distinctCategories = 67;
  const trainer = new Trainer(myNetwork);

  let docs = await trainingdata.fetchDocs();
  let dictionary = await trainingdata.createDict(docs);
  let tData = await trainingdata.formattedData(docs, dictionary);

  let categoryMap = await trainingdata.getCategoryMap();
  let categoryArray = Object.keys(categoryMap);

  return tData.map(function (pair) {
    return {
      input: pair[0],
      output: vec_result(pair[1], distinctCategories)
    };
  });
}

function synapticSun = (doc) => {
  const Layer = synaptic.Layer;
  const Network = synaptic.Network;
  const Trainer = synaptic.Trainer;

  const inputLayer = new Layer(1000);
  const hiddenLayer = new Layer(500);
  const outputLayer = new Layer(10);

  inputLayer.project(hiddenLayer);
  hiddenLayer.project(outputLayer);

  const myNetwork = new Network({
      input: inputLayer,
      hidden: [hiddenLayer],
      output: outputLayer
  });

  const trainer = new Trainer(myNetwork);

  let trainingData = synapticBrain();

  trainer.train(trainingData, {
      rate: .2,
      iterations: 100,
      error: .1,
      shuffle: true,
      log: 10,
      cost: Trainer.cost.CROSS_ENTROPY
  });

  testDoc = trainingdata.convertToVector(doc, dictionary);

  console.log(myNetwork.activate(testDoc.input));
  console.log(testDoc.output);
}
