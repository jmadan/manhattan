const Category = require('../category/category');
const Redis = require('../../utils/redis');
const MongoDB = require('../mongodb');
const mimir = require('../nlp/mimir');
const synaptic = require('synaptic');

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

let fetchDocs = async () => {
  return await MongoDB.getDocuments('feeditems', { category: { $nin: [null, ''] } })
    .then(docs => {
      return docs;
    })
    .catch(err => console.log(err));
};

let formattedData = async (docs, dict) => {
  let tdata = [];
  await docs.map(d => {
    console.log('formattedData', d.url);
    tdata.push({ input: mimir.bow(d.stemwords.toString(), dict), output: d.category });
  });
  return tdata;
};

let createDict = async docs => {
  console.log('docs length: ', docs.length);
  let dict = docs.reduce((prev, curr) => {
    console.log('createDict', curr.url);
    return prev.concat(curr.stemwords);
  }, []);
  return mimir.dict(dict.toString());
};

let convertToVector = async (doc, dict) => {
  return await mimir.bow(doc.stemwords.toString(), dict);
};

let getCategoryMap = async () => {
  return Redis.getRedis('categoryMap').then(cMap => {
    if (cMap) {
      return cMap;
    } else {
      console.log('You got no categpry map!!! HELP...');
    }
  });
};
//   Redis.
//   // await category.getDistinctCategories().then((items) => {
//   //   items.forEach((item, i) => {
//   //     // console.log(item);
//   //     if(item){
//   //       categoryMap[item] = i;
//   //     }
//   //   })
//   // });
// }

let distinctCategoryNumber = () => {
  return Redis.getRedis('distinctCategories')
    .then(cats => {
      if (cats) {
        console.log('distinctCategoryNumber: ', cats.length);
        return cats.length;
      } else {
        return Category.getDistinctCategories()
          .then(values => {
            Redis.setRedis('distinctCategories', JSON.stringify(values));
            Redis.setRedis('numberOfCategories', JSON.stringify(values.length));
            return values.length;
          })
          .catch(e => {
            console.log('error fetching catgories: ', e);
          });
      }
    })
    .catch(err => {
      console.log('Error: ', err);
    });
};

let createNetwork = trainingSet => {
  let errors = [];
  let result = [];
  const Layer = synaptic.Layer;
  const Network = synaptic.Network;

  const inputLayer = new Layer(100);
  const hiddenLayer = new Layer(150);
  const outputLayer = new Layer(10);

  inputLayer.project(hiddenLayer);
  hiddenLayer.project(outputLayer);

  const myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
  });
  // let myTrainer = new Trainer(myNetwork);
  // myTrainer.train(trainingSet, {
  //   rate: .2,
  //   iterations: 20000,
  //   error: .1,
  //   shuffle: true,
  //   log: 2000,
  //   cost: Trainer.cost.CROSS_ENTROPY,
  //   schedule: {
  //     every: 2000,
  //     do: function (data) {
  //         errors.push(data.error);
  //         console.log(data.error)
  //         counter+=1;
  //         result.push({nr: counter, value: data.error});
  //     }
  //   }
  // });

  // train the network
  // var learningRate = .3;
  // for (var i = 0; i < 100; i++)
  // {
  //   trainingSet.map((ts) => {
  //     myNetwork.activate(ts.input);
  //     myNetwork.propagate(learningRate, ts.output);
  //   });
  // }

  Redis.setRedis('NeuralNetwork', JSON.stringify(myNetwork));
  console.log('Network Created....');
};

let getNetwork = () => {
  const Network = synaptic.Network;
  return Redis.getRedis('NeuralNetwork').then(myNetwork => {
    if (myNetwork) {
      return Network.fromJSON(myNetwork);
    } else {
      console.log('You got no Network!!! HELP...');
    }
  });
};

let getDistinctCategories = () => {
  return Redis.getRedis('distinctCategories').then(dCats => {
    if (dCats) {
      return dCats;
    } else {
      console.log('Something is wrong @ distinct Categories');
    }
  });
};

let trainNetwork = async () => {
  let myNetwork = await getNetwork();
  let distinctCategories = await getDistinctCategories();
  let trainingSet = await formattedTrainingData(distinctCategories);
  const Trainer = synaptic.Trainer;
  let myTrainer = new Trainer(myNetwork);
  // myTrainer.train(trainingSet, {
  //   rate: 0.2,
  //   iterations: 20000,
  //   error: 0.1,
  //   shuffle: true,
  //   log: 2000,
  //   cost: Trainer.cost.MSE
  // });
  let learningRate = 0.3;
  for (var i = 0; i < 100; i++) {
    trainingSet.map(ts => {
      myNetwork.activate(ts.input);
      myNetwork.propagate(learningRate, ts.output);
    });
  }

  Redis.setRedis('NeuralNetwork', JSON.stringify(myNetwork));
  console.log('Network Trained...');
};

let createDictionary = async () => {
  let docs = await fetchDocs();
  let dictionary = await createDict(docs);
  Redis.setRedis('dictionary', JSON.stringify(dictionary));
  console.log('dictionary saved to Redis...');
};

let createCategoryMap = async () => {
  Redis.getRedis('distinctCategories')
    .then(cats => {
      let cMap = {};
      for (let i = 0, len = cats.length; i < len; i += 1) {
        cMap[cats[i]] = i;
      }
      Redis.setRedis('categoryMap', JSON.stringify(cMap));
    })
    .catch(er => console.log(er));
};

let formattedTrainingData = async distinctCategories => {
  let docs = await fetchDocs();
  return Redis.getRedis('dictionary')
    .then(async dict => {
      console.log('got dict from Redis....');
      let tData = await formattedData(docs, dict);
      let categoryMap = await getCategoryMap();
      // let categoryArray = Object.keys(categoryMap);
      // Redis.setRedis('categoryArray', JSON.stringify(categoryArray));
      // getCategoryMap().then((cm)=>{
      //   let categoryArray = Object.keys(cm);
      //   Redis.setRedis('categoryArray', JSON.stringify(categoryArray));
      // });

      let trainingSet = tData.map(pair => {
        return {
          input: pair.input,
          output: vec_result(categoryMap[pair.output], distinctCategories)
        };
      });
      return trainingSet;
    })
    .catch(e => console.log(e));
};
// createLSTMNetwork: (trainingSet) => {
//   const Architect = synaptic.Architect;
//   const Trainer = synaptic.Trainer;
//
//   let myLSTM = Architect.LSTM(10, 20, 3);
//   let myTrainer = new Trainer(myLSTM);
//
//   myTrainer.train(trainingSet, {
//     rate: .2,
//     iterations: 20000,
//     error: .1,
//     shuffle: true,
//     log: 2000,
//     cost: Trainer.cost.CROSS_ENTROPY
//   })
//
//   console.log(myLSTM.toJSON());
// }

module.exports = {
  distinctCategoryNumber,
  createNetwork,
  getNetwork,
  trainNetwork,
  createDictionary,
  createCategoryMap,
  formattedTrainingData
};
