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
    tdata.push({ input: mimir.bow(d.stemwords.toString(), dict), output: d.category });
  });
  return tdata;
};

let createDict = async docs => {
  console.log('docs length: ', docs.length);
  let dict = docs.reduce((prev, curr) => {
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
  let result = await Promise.all([getNetwork(), getDistinctCategories()]);
  let trainingSet = await formattedTrainingData(result[1]);
  const Trainer = synaptic.Trainer;
  let myTrainer = new Trainer(result[0]);
  myTrainer.train(trainingSet, {
    rate: 0.2,
    iterations: 20000,
    error: 0.1,
    shuffle: true,
    log: 2000,
    cost: Trainer.cost.MSE
  });

  Redis.setRedis('NeuralNetwork', JSON.stringify(myNetwork));
  console.log('Network Trained...');
  return myNetwork;
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
      console.log('data structured...');
      let categoryMap = await getCategoryMap();
      console.log('got CategoryMap...');

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

module.exports = {
  distinctCategoryNumber,
  trainNetwork,
  createDictionary,
  createCategoryMap,
  formattedTrainingData
};
