import { getDistinctCategories } from './modules/category/category';
import Redis from './utils/redis';
const MongoDB = require('./modules/mongodb');
const MongoClient = require("mongodb");
const DBURI = process.env.MONGODB_URI;
const mimir = require('./modules/nlp/mimir');
const synaptic = require("synaptic");


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

let fetchDocs = async() => {
  return await MongoDB.getDocuments("feeditems", {status:'classified'}).then((docs) => {
    return docs;
  }).catch(err=>console.log(err));
}

let formattedData = async(docs, dict) => {
  let tdata = [];
  await docs.map((d) => {
    console.log('formattedData',d.url);
    tdata.push({input: mimir.bow(d.stemwords.toString(), dict),output: d.category});
    // if(d.stemwords){
    //   tdata.push({input: mimir.bow(d.stemwords.toString(), dict),output: d.category});
    // } else {
    //   tdata.push({input: mimir.bow(d.stemmed.toString(), dict),output: d.category});
    // }
  });
  return tdata;
}

let createDict = async(docs) => {
  console.log('docs length: ', docs.length);
  let dict = docs.reduce((prev, curr) => {
    console.log('createDict', curr.url);
    return prev.concat(curr.stemwords);
    // if(curr.stemwords){
    //   return prev.concat(curr.stemwords);
    // } else{
    //   return prev.concat(curr.stemmed);
    // }
  }, []);
  return mimir.dict(dict.toString());
}

let convertToVector = async(doc, dict) => {
  return await mimir.bow(doc.stemwords.toString(), dict);
}

let getCategoryMap = async() => {
  let categoryMap = {};
  return Redis.getRedis('distinctCategories').then((categories) => {
    categories.forEach((item, i) => {
      if(item){
        categoryMap[item] = i;
      }
    });
    return categoryMap;
  });

  // await category.getDistinctCategories().then((items) => {
  //   items.forEach((item, i) => {
  //     // console.log(item);
  //     if(item){
  //       categoryMap[item] = i;
  //     }
  //   })
  // });
}

module.exports = {
  distinctCategoryNumber: () => {
    return Redis.getRedis('distinctCategories')
    .then((cats) => {
      if(cats){
        console.log('distinctCategoryNumber: ',cats.length);
        return cats.length;
      } else {
        return getDistinctCategories().then((values) => {
          Redis.setRedis('distinctCategories', JSON.stringify(values));
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
  },

  createNetwork: (trainingSet) => {
      let errors = [];
      let result=[];
      const Layer = synaptic.Layer;
      const Network = synaptic.Network;
      const Trainer = synaptic.Trainer;

      const inputLayer = new Layer(100);
      const hiddenLayer = new Layer(300);
      const outputLayer = new Layer(10);

      inputLayer.project(hiddenLayer);
      hiddenLayer.project(outputLayer);

      const myNetwork = new Network({
          input: inputLayer,
          hidden: [hiddenLayer],
          output: outputLayer
      });
      let myTrainer = new Trainer(myNetwork);
      myTrainer.train(trainingSet, {
        rate: .2,
        iterations: 20000,
        error: .1,
        shuffle: true,
        log: 2000,
        cost: Trainer.cost.CROSS_ENTROPY,
        schedule: {
          every: 2000,
          do: function (data) {
              errors.push(data.error);
              console.log(data.error)
              counter+=1;
              result.push({nr: counter, value: data.error});
          }
        }
      });
      Redis.setRedis('NeuralNetwork', JSON.stringify(myNetwork));
      console.log("Network Created....")
  },

  getNetwork: () => {
    return Redis.getRedis('NeuralNetwork').then((myNetwork) => {
      if(myNetwork){
        return myNetwork;
      } else {
        console.log('You got no Network!!! HELP...');
      }
    });
  },

  createDictionary: async () => {
    let docs = await fetchDocs();
    let dictionary = await createDict(docs);

    Redis.setRedis('dictionary', JSON.stringify(dictionary));
  },

  formattedTrainingData: async (distinctCategories) => {
    let docs = await fetchDocs();
    return Redis.getRedis('dictionary').then(async (dict) => {
      console.log('got dict from Redis....');
      let tData = await formattedData(docs, dict);

      let categoryMap = await getCategoryMap();
      let categoryArray = Object.keys(categoryMap);
      Redis.setRedis('categoryArray', JSON.stringify(categoryArray));

      let trainingSet = tData.map((pair) => {
          return {
            input: pair.input,
            output: vec_result(categoryMap[pair.output], distinctCategories)
          };
      });
      return trainingSet;
    }).catch(e => console.log(e));
  }

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

}
